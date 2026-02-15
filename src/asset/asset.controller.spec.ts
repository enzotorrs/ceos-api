import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Asset } from './asset.model';
import { BucketService } from 'src/bucket/bucket.service';
import {  INestApplication, ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { User } from 'src/auth/user/user.model';
import { AssetService } from './asset.service';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { Reflector } from '@nestjs/core';
import request from 'supertest';

describe('AssetController', () => {
  let service: AssetService;
  let sequelize: Sequelize;
  let bucketService: BucketService;
  let app: INestApplication;

  const mockBucketService = {
    getSignedUploadUrl: jest.fn().mockResolvedValue('https://mock-upload-url.com/test-file'),
    getSignedDownloadUrl: jest.fn().mockResolvedValue('https://mock-download-url.com/test-file'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        }),
      )
      .overrideProvider(BucketService)
      .useValue(mockBucketService)
      .compile();

    service = module.get<AssetService>(AssetService);
    sequelize = module.get<Sequelize>(Sequelize);
    bucketService = module.get<BucketService>(BucketService);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Asset.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('GET /assets', () => {
    it('should return empty data', async ()=>{
      await request(app.getHttpServer()).get('/assets').expect(200);
      const res: any = await request(app.getHttpServer()).get('/assets').expect(200);
      const {body} = res

      expect(body.data).toHaveLength(0);
      expect(body.meta).toEqual({
        total: 0,
        page: 1,
        lastPage: 0,
      });
    })
    it('should return paginated assets with default pagination', async () => {
      await service.create({ name: 'Folder 1', folder: true });
      await service.create({ name: 'Folder 2', folder: true });
      await service.create({ name: 'File 1', folder: false, filename: 'file1.txt' });

      const res: any = await request(app.getHttpServer()).get('/assets').expect(200);
      const {body} = res


      expect(body.data).toHaveLength(3);
      expect(body.meta).toEqual({
        total: 3,
        page: 1,
        lastPage: 1,
      });
    });

    it('should return paginated assets with custom page size', async () => {
      for (let i = 1; i <= 5; i++) {
        await service.create({ name: `Folder ${i} `, folder: true });
      }

      const res: any = await request(app.getHttpServer()).get('/assets').expect(200);
      const {body} = res

      expect(body.data).toHaveLength(5);
      expect(body.meta).toEqual({
        total: 5,
        page: 1,
        lastPage: 1,
      });
    });

    it('should return second page of results', async () => {
      // Create test assets
      for (let i = 1; i <= 5; i++) {
        await service.create({ name: `Folder ${i}`, folder: true });
      }

      const res: any = await request(app.getHttpServer()).get('/assets').query({ page: 2, page_size: 2 }).expect(200);
      const {body} = res


      expect(body.data).toHaveLength(2);
      expect(body.data[0].name).toBe('Folder 3');
      expect(body.meta.page).toBe(2);
    });

    it('should include child and parent assets', async () => {
      const parent = await service.create({ name: 'Parent Folder', folder: true });
      await service.create({ name: 'Child Folder', folder: true, parentAssetId: parent.id });

      const res: any = await request(app.getHttpServer()).get('/assets').expect(200);
      const {body} = res

      expect(body.data[0].childAssets).toBeDefined();
      expect(body.data[1].parentAsset).toBeDefined();
    });
  });

  describe('POST /assets', () => {
    describe('Creating folders', () => {
      it('should create a folder successfully', async () => {
        const createDto = {
          name: 'My Folder',
          folder: true,
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(201);
        const {body} = res

        expect(body.data.name).toBe('My Folder');
        expect(body.data.folder).toBe(true);
        expect(body.data.uploadUrl).toBeUndefined();
        expect(bucketService.getSignedUploadUrl).not.toHaveBeenCalled();
      });

      it('should create a folder with parent folder', async () => {
        const parent = await Asset.create({ name: 'Parent Folder', folder: true });

        const createDto = {
          name: 'Child Folder',
          folder: true,
          parentAssetId: parent.id,
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(201);
        const {body} = res

        expect(body.data.name).toBe('Child Folder');
        expect(body.data.parentAssetId).toBe(parent.id);
      });

      it('should throw error when folder has filename', async () => {
        const createDto = {
          name: 'Invalid Folder',
          folder: true,
          filename: 'should-not-have.txt',
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(400);
      });

      it('should throw error when parent is not a folder', async () => {
        const fileAsset = await service.create({ name: 'File', folder: false, filename: 'file.txt' });

        const createDto = {
          name: 'Child Folder',
          folder: true,
          parentAssetId: fileAsset.id,
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(400);
      });

      it('should throw error when parent does not exist', async () => {
        const createDto = {
          name: 'Child Folder',
          folder: true,
          parentAssetId: 9999,
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(404);
      });
    });

    describe('Creating files', () => {
      it('should create a file with upload URL', async () => {
        const createDto = {
          name: 'My File',
          folder: false,
          filename: 'myfile.pdf',
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(201);
        const {body} = res

        expect(body.data.name).toBe('My File');
        expect(body.data.folder).toBe(false);
        expect(body.data.uploadUrl).toBe('https://mock-upload-url.com/test-file');
        expect(bucketService.getSignedUploadUrl).toHaveBeenCalledWith('myfile.pdf');
      });

      it('should throw error when file has no filename', async () => {
        const createDto = {
          name: 'Invalid File',
          folder: false,
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(400);
      });

      it('should create a file inside a folder', async () => {
        const parent = await service.create({ name: 'Parent Folder', folder: true });

        const createDto = {
          name: 'File in Folder',
          folder: false,
          filename: 'document.pdf',
          parentAssetId: parent.id,
        };

        const res: any = await request(app.getHttpServer()).post('/assets').send(createDto).expect(201);
        const {body} = res

        expect(body.data.name).toBe('File in Folder');
        expect(body.data.parentAssetId).toBe(parent.id);
        expect(body.data.uploadUrl).toBeDefined();
      });
    });
  });

  describe('PATCH /assets/:id', () => {
    it('should update asset name', async () => {
      const asset = await service.create({ name: 'Original Name', folder: true });

      const updateDto = {
        name: 'Updated Name',
      };

        const res: any = await request(app.getHttpServer()).patch(`/assets/${asset.id}`).send(updateDto).expect(200);
        const {body} = res

      expect(body.data.name).toBe('Updated Name');
    });

    it('should update asset parent', async () => {
      const parent = await Asset.create({ name: 'Parent Folder', folder: true });
      const asset = await Asset.create({ name: 'Child Asset', folder: true });

      const updateDto = {
        name: 'Child Asset',
        parentAssetId: parent.id,
      };

        const res: any = await request(app.getHttpServer()).patch(`/assets/${asset.id}`).send(updateDto).expect(200);
        const {body} = res

      expect(body.data.parentAssetId).toBe(parent.id);
    });

    it('should throw error when asset not found', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

        const res: any = await request(app.getHttpServer()).patch(`/assets/1`).send(updateDto).expect(404);
        const {body} = res
    });

    it('should throw error when parent is not a folder', async () => {
      const fileAsset = await Asset.create({ name: 'File', folder: false, filename: 'file.txt' });
      const asset = await Asset.create({ name: 'Asset', folder: true });

      const updateDto = {
        name: 'Asset',
        parentAssetId: fileAsset.id,
      };

        const res: any = await request(app.getHttpServer()).patch(`/assets/${asset.id}`).send(updateDto).expect(400);
        const {body} = res
    });

    it('should throw error when trying to set self as parent', async () => {
      const asset = await Asset.create({ name: 'Asset', folder: true });

      const updateDto = {
        name: 'Asset',
        parentAssetId: asset.id,
      };

        const res: any = await request(app.getHttpServer()).patch(`/assets/${asset.id}`).send(updateDto).expect(400);
        const {body} = res
    });

    it('should update and return asset with child assets', async () => {
      const parent = await Asset.create({ name: 'Parent', folder: true });
      const child = await Asset.create({ name: 'Child', folder: true, parentAssetId: parent.id });

      const updateDto = {
        name: 'Updated Parent',
      };

        const res: any = await request(app.getHttpServer()).patch(`/assets/${parent.id}`).send(updateDto).expect(200);
        const {body} = res

      expect(body.data.name).toBe('Updated Parent');
      expect(body.data.childAssets).toBeDefined();
      expect(body.data.childAssets).toHaveLength(1);
      expect(body.data.childAssets[0].name).toBe('Child');
    });
  });
});

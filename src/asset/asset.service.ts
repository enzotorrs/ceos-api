import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Asset } from './asset.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAssetDto } from './dtos/create_asset.dto';
import { UpdateAssetDto } from './dtos/update_asset.dto';
import { MediaService } from 'src/media/media.service';
import { AssetResponseDto } from './dtos/asset_response.dto';
import { AssetQueryDTO } from './dtos/asset_query.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset)
    private readonly assetRepository: typeof Asset,
    private readonly mediaService: MediaService,
  ) {}

  async getAll(query: AssetQueryDTO) {
    const { page, page_size, parentAssetId } = query;
    const limit = page_size;
    const offset = (page - 1) * page_size;

    const where = parentAssetId !== undefined ? { parentAssetId } : {parentAssetId: null};

    const { rows: items, count: total } =
      await this.assetRepository.findAndCountAll({
        where,
        include: ['childAssets', 'parentAsset'],
        order: [['id', 'desc']],
        limit,
        offset,
      });

    return {
      items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async get(assetId: number): Promise<Asset> {
    const asset = await this.assetRepository.findByPk(assetId, {
      include: ['childAssets'],
    });
    if (!asset) {
      throw new NotFoundException('asset not found');
    }
    return asset;
  }

  async create(assetPayload: CreateAssetDto): Promise<AssetResponseDto> {
    await this.validateAsset(assetPayload);
    const asset = await this.assetRepository.create({ ...assetPayload });
    if (assetPayload.folder) {
      return asset;
    }
    if (!assetPayload.filename) {
      throw new BadRequestException('asset type file must have filename');
    }
    const uploadUrl = await this.mediaService.getSignedUploadUrl(
      assetPayload.filename,
    );
    return { ...asset.dataValues, uploadUrl };
  }

  async update(assetId: number, assetPayload: UpdateAssetDto): Promise<Asset> {
    await this.validateAsset(assetPayload, assetId);
    const asset = await this.get(assetId);
    await asset.update(assetPayload);
    return asset.reload({ include: ['childAssets'] });
  }

  async delete(assetId: number){
    const asset = await this.get(assetId)
    asset.destroy()
  }

  private async validateAsset(
    assetPayload: CreateAssetDto | UpdateAssetDto,
    assetId?: number,
  ) {
    if (assetPayload.parentAssetId) {
      const parentAsset = await this.get(assetPayload.parentAssetId);
      if (parentAsset.dataValues.folder === false) {
        throw new BadRequestException('parentAsset must be a folder');
      }
    }
    if (
      assetId &&
      assetPayload.parentAssetId &&
      assetId === assetPayload.parentAssetId
    ) {
      throw new BadRequestException('parentAsset cannot be equal to assetId');
    }
    if (
      'folder' in assetPayload &&
      assetPayload.folder &&
      assetPayload.filename
    ) {
      throw new BadRequestException('folder cannot have filename');
    }
    if (
      'folder' in assetPayload &&
      !assetPayload.folder &&
      !assetPayload.filename
    ) {
      throw new BadRequestException('asset type file must have filename');
    }
  }
}

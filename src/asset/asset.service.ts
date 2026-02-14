import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Asset } from './asset.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAssetDto } from './dtos/create_asset.dto';
import { UpdateAssetDto } from './dtos/update_asset.dto';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset)
    private readonly assetRepository: typeof Asset,
  ) { }

  async getAll(pagination: PaginationDTO) {
    const { page, page_size } = pagination;
    const limit = page_size;
    const offset = (page - 1) * page_size;

    const { rows: items, count: total } = await this.assetRepository.findAndCountAll({
      include: ['childAssets', 'parentAsset'],
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

  async create(assetPayload: CreateAssetDto): Promise<Asset> {
    console.log(assetPayload)
    await this.validateAsset(assetPayload)
    return this.assetRepository.create({ ...assetPayload });
  }

  async update(assetId: number, assetPayload: UpdateAssetDto): Promise<Asset> {
    await this.validateAsset(assetPayload, assetId)
    const asset = await this.get(assetId);
    await asset.update(assetPayload);
    return asset.reload({ include: ['childAssets'] });
  }

  private async validateAsset(assetPayload: CreateAssetDto | UpdateAssetDto, assetId?: number) {
    if (assetPayload.parentAssetId) {
      const parentAsset = await this.get(assetPayload.parentAssetId)
      if (parentAsset.folder === false) {
        throw new BadRequestException('parentAsset must be a folder')
      }
    }
    if (assetId && assetPayload.parentAssetId && assetId === assetPayload.parentAssetId) {
      throw new BadRequestException('parentAsset cannot be equal to assetId')
    }
  }
}

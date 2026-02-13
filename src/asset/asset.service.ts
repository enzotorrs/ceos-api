import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Asset } from './asset.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAssetDto } from './dtos/create_asset.dto';
import { UpdateAssetDto } from './dtos/update_asset.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset)
    private readonly assetRepository: typeof Asset,
  ) {}

  async getAll() {
    return this.assetRepository.findAll({
      include: ['childAssets'],
    });
  }

  async get(assetId: number) {
    const asset = await this.assetRepository.findByPk(assetId, {
      include: ['childAssets'],
    });
    if (!asset) {
      throw new NotFoundException('asset not found');
    }
    return asset;
  }

  async create(assetPayload: CreateAssetDto) {
    console.log(assetPayload)
    await this.validateAsset(assetPayload)
    return this.assetRepository.create({ ...assetPayload });
  }

  async update(assetId: number, assetPayload: UpdateAssetDto) {
    await this.validateAsset(assetPayload, assetId)
    const asset = await this.get(assetId);
    await asset.update(assetPayload);
    return asset.reload({include: ['childAssets']});
  }

  private async validateAsset(assetPayload: CreateAssetDto | UpdateAssetDto, assetId?: number){
    if(assetPayload.parentAssetId){
      const parentAsset = await this.get(assetPayload.parentAssetId)
      if(parentAsset.folder === false){
        throw new BadRequestException('parentAsset must be a folder')
      }
    }
    if(assetId && assetPayload.parentAssetId && assetId === assetPayload.parentAssetId){
      throw new BadRequestException('parentAsset cannot be equal to assetId')
    }
  }
}

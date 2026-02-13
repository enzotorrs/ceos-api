import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dtos/create_asset.dto';
import { UpdateAssetDto } from './dtos/update_asset.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}
  @Get()
  async getAll() {
    return this.assetService.getAll();
  }

  @Post()
  async create(@Body() assetPayload: CreateAssetDto) {
    return this.assetService.create(assetPayload);
  }

  @Patch(':id')
  async update(
    @Param('id') assetId: number,
    @Body() assetPayload: UpdateAssetDto,
  ) {
    return this.assetService.update(assetId, assetPayload);
  }
}

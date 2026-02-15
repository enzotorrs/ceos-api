import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dtos/create_asset.dto';
import { UpdateAssetDto } from './dtos/update_asset.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Asset } from './asset.model';
import { ApiDataResponse } from 'src/common/decorators/api-data-response.decorator';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { AssetResponseDto } from './dtos/asset_response.dto';

@UseGuards(AuthGuard)
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) { }
  @Get()
  @ApiPaginatedResponse(Asset)
  async getAll(@Query() pagination: PaginationDTO) {
    return this.assetService.getAll(pagination);
  }

  @Post()
  @ApiDataResponse(AssetResponseDto)
  async create(@Body() assetPayload: CreateAssetDto) {
    return this.assetService.create(assetPayload);
  }

  @Patch(':id')
  @ApiDataResponse(Asset)
  async update(
    @Param('id') assetId: number,
    @Body() assetPayload: UpdateAssetDto,
  ) {
    return this.assetService.update(assetId, assetPayload);
  }
}

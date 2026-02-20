import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dtos/create_asset.dto';
import { UpdateAssetDto } from './dtos/update_asset.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Asset } from './asset.model';
import { ApiDataResponse } from 'src/common/decorators/api-data-response.decorator';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { AssetResponseDto } from './dtos/asset_response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AssetQueryDTO } from './dtos/asset_query.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}
  @Get()
  @ApiPaginatedResponse(Asset)
  async getAll(@Query() pagination: AssetQueryDTO) {
    return this.assetService.getAll(pagination);
  }

  @Get(':id')
  @ApiDataResponse(Asset)
  async get(@Param('id') id: number) {
    return this.assetService.get(id);
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

  @Delete(':id')
  async delete(
    @Param('id') assetId: number,
  ){
    return this.assetService.delete(assetId)
  }
}

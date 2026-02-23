import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class UpdateAssetDto {
  @ApiProperty()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  parentAssetId?: number;

  @ApiProperty({ enum: ['uploading', 'success'] })
  @IsIn(['uploading', 'success'])
  @IsOptional()
  status?: 'uploading' | 'success';
}

import { ApiProperty } from '@nestjs/swagger';

export class AssetResponseDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  folder: boolean = true;

  @ApiProperty()
  parentAssetId: number;
  
  @ApiProperty()
  uploadUrl?: string
}

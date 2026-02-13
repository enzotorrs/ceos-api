import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAssetDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsBoolean()
  folder: boolean = true;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  parentAssetId?: number;
}

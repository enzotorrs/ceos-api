import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CommentQueryDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  assetId: number;
}

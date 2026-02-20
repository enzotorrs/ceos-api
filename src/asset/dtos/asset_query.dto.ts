import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";
import { PaginationDTO } from "src/common/dtos/pagination.dto";

export class AssetQueryDTO extends PaginationDTO {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parentAssetId?: number
}

import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'asset',
})
export class Asset extends Model {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  folder: boolean;

  @ApiProperty()
  @ForeignKey(() => Asset)
  @Column({
    type: DataType.INTEGER,
    field: 'parent_asset_id',
  })
  parentAssetId: number;

  @ApiProperty()
  @BelongsTo(() => Asset, { as: 'parentAsset' })
  parentAsset: Asset;

  @ApiProperty()
  @HasMany(() => Asset, { as: 'childAssets' })
  childAssets: Asset[];
}

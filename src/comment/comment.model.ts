import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Asset } from 'src/asset/asset.model';
import { User } from 'src/auth/user/user.model';

@Table({ tableName: 'comment' })
export class Comment extends Model {
  @ApiProperty()
  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @ApiProperty()
  @ForeignKey(() => Asset)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'asset_id' })
  assetId: number;

  @BelongsTo(() => Asset)
  asset: Asset;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'user_id' })
  userId: number;

  @BelongsTo(() => User)
  user: User;
}

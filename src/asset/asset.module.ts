import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Asset } from './asset.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Asset]),
    AuthModule
  ],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}

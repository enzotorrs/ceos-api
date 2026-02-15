import { BucketModule } from './bucket/bucket.module';
import { Module } from '@nestjs/common';
import { AssetModule } from './asset/asset.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    BucketModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AssetModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

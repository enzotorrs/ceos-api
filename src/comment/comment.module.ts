import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Asset } from 'src/asset/asset.model';
import { Comment } from './comment.model';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Asset]), AuthModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}

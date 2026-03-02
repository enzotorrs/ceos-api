import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './comment.model';
import { Asset } from 'src/asset/asset.model';
import { User } from 'src/auth/user/user.model';
import { CreateCommentDto } from './dtos/create_comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment)
    private readonly commentRepository: typeof Comment,
    @InjectModel(Asset)
    private readonly assetRepository: typeof Asset,
  ) {}

  async create(dto: CreateCommentDto, userId: number): Promise<Comment> {
    const comment = await this.commentRepository.create({
      content: dto.content,
      assetId: dto.assetId,
      userId,
    });
    return comment.reload({
      include: [{ association: 'user', attributes: ['id', 'username', 'avatarFilename'] }],
    });
  }

  async findByAsset(assetId: number): Promise<Comment[]> {
    return this.commentRepository.findAll({
      where: { assetId },
      include: [{ association: 'user', attributes: ['id', 'username', 'avatarFilename'] }],
      order: [['createdAt', 'ASC']],
    });
  }

  async delete(commentId: number, requesterId: number): Promise<void> {
    const comment = await this.commentRepository.findByPk(commentId, {
      include: [{ association: 'asset', attributes: ['userId'] }],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const isOwnComment = comment.userId === requesterId;
    const isAssetOwner = (comment.asset as Asset).userId === requesterId;
    if (!isOwnComment && !isAssetOwner) {
      throw new ForbiddenException('Not allowed to delete this comment');
    }
    await comment.destroy();
  }
}

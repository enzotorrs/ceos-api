import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiDataResponse } from 'src/common/decorators/api-data-response.decorator';
import { Comment } from './comment.model';
import { CommentService } from './comment.service';
import { CommentQueryDto } from './dtos/comment_query.dto';
import { CreateCommentDto } from './dtos/create_comment.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiDataResponse([Comment])
  async findByAsset(@Query() query: CommentQueryDto) {
    return this.commentService.findByAsset(query.assetId);
  }

  @Post()
  @ApiDataResponse(Comment)
  async create(@Body() dto: CreateCommentDto, @Request() req) {
    return this.commentService.create(dto, req.user.sub);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Request() req) {
    return this.commentService.delete(id, req.user.sub);
  }
}

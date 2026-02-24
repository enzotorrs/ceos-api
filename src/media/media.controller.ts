import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('multipart/create')
  async createMultipartUpload(@Body() body: { key: string }) {
    return this.mediaService.createMultipartUpload(body.key);
  }

  @Get('multipart/presign')
  async getPartUrl(
    @Query('key') key: string,
    @Query('uploadId') uploadId: string,
    @Query('partNumber') partNumber: string,
  ) {
    return { url: await this.mediaService.getSignedPartUrl(key, uploadId, Number(partNumber)) };
  }

  @Post('multipart/complete')
  async completeMultipart(
    @Body() body: { key: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] },
  ) {
    await this.mediaService.completeMultipartUpload(body.key, body.uploadId, body.parts);
  }

  @Post('multipart/abort')
  async abortMultipart(@Body() body: { key: string; uploadId: string }) {
    await this.mediaService.abortMultipartUpload(body.key, body.uploadId);
  }

  @Get(':filename')
  async getSignedUrl(@Param('filename') filename: string) {
    return this.mediaService.getSignedDownloadUrl(filename);
  }
}

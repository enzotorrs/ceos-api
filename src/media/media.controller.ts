import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':filename')
  async getSignedUrl(@Param('filename') filename: string) {
    return this.mediaService.getSignedDownloadUrl(filename);
  }
}

import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDTO } from './dtos/user_response.dto';

@Controller('auth/user')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Request() req): Promise<UserResponseDTO> {
    return this.userService.getMe(req.user.username);
  }

  @Post('me/avatar')
  async getAvatarUploadUrl(@Request() req): Promise<{ uploadUrl: string }> {
    return this.userService.getAvatarUploadUrl(req.user.username);
  }
}

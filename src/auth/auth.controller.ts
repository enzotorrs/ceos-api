import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dtos/login.dto';
import { LoginResponseDTO } from './dtos/login_response.dto';
import { RefreshTokenDTO } from './dtos/refresh_token.dto';
import { ApiDataResponse } from 'src/common/decorators/api-data-response.decorator';
import { IgnoreTransform } from 'src/common/decorators/ignore-transform.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: LoginResponseDTO })
  @HttpCode(HttpStatus.OK)
  @IgnoreTransform()
  async login(@Body() loginPayload: LoginDTO): Promise<LoginResponseDTO> {
    return this.authService.login(loginPayload.username, loginPayload.password);
  }

  @Post('refresh')
  @ApiOkResponse({ type: LoginResponseDTO })
  @HttpCode(HttpStatus.OK)
  @IgnoreTransform()
  async refresh(@Body() body: RefreshTokenDTO): Promise<LoginResponseDTO> {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req): Promise<void> {
    await this.authService.logout(req.user.username);
  }
}

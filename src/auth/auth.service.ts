import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginResponseDTO } from './dtos/login_response.dto';
import { CreateUserDTO } from './user/dtos/create_user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(username: string, pass: string): Promise<LoginResponseDTO> {
    const user = await this.userService.findOne(username);

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user.id, username);
    await this.userService.saveRefreshToken(username, tokens.refreshToken);
    return tokens;
  }

  async refresh(token: string): Promise<LoginResponseDTO> {
    let payload: { sub: number; username: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(payload.username);

    if (!user.refreshToken) {
      throw new UnauthorizedException();
    }

    const tokenMatches = await bcrypt.compare(token, user.refreshToken);
    if (!tokenMatches) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user.id, payload.username);
    await this.userService.saveRefreshToken(payload.username, tokens.refreshToken);
    return tokens;
  }

  async signup(payload: CreateUserDTO){
    const user_exists = await this.userService.username_exists(payload.username);
    if (user_exists){
      throw new BadRequestException('user with this username already exists')
    }
    const user = await this.userService.create(payload)
    const tokens = await this.generateTokens((user as any).id, user.username)
    await this.userService.saveRefreshToken(user.username, tokens.refreshToken)
    return tokens
  }

  async logout(username: string): Promise<void> {
    await this.userService.clearRefreshToken(username);
  }

  private async generateTokens(userId: number, username: string): Promise<LoginResponseDTO> {
    const jwtPayload = { sub: userId, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}

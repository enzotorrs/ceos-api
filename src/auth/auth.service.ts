import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginResponseDTO } from './dtos/login_response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, pass: string): Promise<LoginResponseDTO> {
    const user = await this.userService.findOne(username);

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const jwtPayload = {
      username: user.username,
    };
    const acessToken = await this.jwtService.signAsync(jwtPayload);
    return { acessToken };
  }
}

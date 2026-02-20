import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create_user.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDTO } from './dtos/user_response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
  ) {}

  async findOne(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
      raw: true,
    });

    if (!user) {
      throw new ForbiddenException();
    }

    return user;
  }

  async create(userPayload: CreateUserDTO): Promise<UserResponseDTO> {
    const passwordHashed = await bcrypt.hash(userPayload.password, 10);
    const user = await this.userRepository.create({
      username: userPayload.username,
      password: passwordHashed,
    });
    const { password, ...result } = user.get({ plain: true });
    return result;
  }

  async saveRefreshToken(username: string, token: string): Promise<void> {
    const hashed = await bcrypt.hash(token, 10);
    await this.userRepository.update(
      { refreshToken: hashed },
      { where: { username } },
    );
  }

  async clearRefreshToken(username: string): Promise<void> {
    await this.userRepository.update(
      { refreshToken: null },
      { where: { username } },
    );
  }
}

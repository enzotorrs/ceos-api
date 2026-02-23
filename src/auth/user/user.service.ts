import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create_user.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDTO } from './dtos/user_response.dto';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
    private readonly mediaService: MediaService,
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

  async username_exists(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
      raw: true,
    });

    return !!user;
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

  async getMe(username: string): Promise<UserResponseDTO> {
    const user = await this.findOne(username);
    let avatarUrl: string | null = null;
    if (user.avatarFilename) {
      avatarUrl = await this.mediaService.getSignedDownloadUrl(user.avatarFilename);
    }
    return { username: user.username, avatarUrl };
  }

  async getAvatarUploadUrl(username: string): Promise<{ uploadUrl: string }> {
    const key = `${username}`;
    await this.userRepository.update(
      { avatarFilename: key },
      { where: { username } },
    );
    const uploadUrl = await this.mediaService.getSignedUploadUrl(key);
    return { uploadUrl };
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

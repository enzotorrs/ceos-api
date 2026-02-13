import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';

@Module(
  {
    imports: [
      UserModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: '15M'
          },
        }),
        inject: [ConfigService],
      }),
    ],
    providers: [AuthService, AuthGuard],
    controllers: [AuthController],
    exports: [AuthGuard, JwtModule]
  }
)
export class AuthModule { }

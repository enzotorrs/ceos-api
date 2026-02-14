import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dtos/login.dto";
import { LoginResponseDTO } from "./dtos/login_response.dto";
import { ApiDataResponse } from "src/common/decorators/api-data-response.decorator";
import { IgnoreTransform } from "src/common/decorators/ignore-transform.decorator";
import { ApiOkResponse } from "@nestjs/swagger";

@Controller('auth')
export class AuthController{
  constructor(private readonly authService: AuthService){}

  @Post('login')
  @ApiOkResponse({ type: LoginResponseDTO })
  @HttpCode(HttpStatus.OK)
  @IgnoreTransform()
  async login(@Body() loginPayload: LoginDTO): Promise<LoginResponseDTO>{
    return this.authService.login(loginPayload.username, loginPayload.password)
  }
}

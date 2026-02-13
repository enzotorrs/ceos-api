import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dtos/login.dto";

@Controller('auth')
export class AuthController{
  constructor(private readonly authService: AuthService){}

  @Post('login')
  async login(@Body() loginPayload: LoginDTO){
    return this.authService.login(loginPayload.username, loginPayload.password)
  }
}

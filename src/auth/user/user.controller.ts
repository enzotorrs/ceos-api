import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./dtos/create_user.dto";

@Controller('auth/user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ){}

  @Post()
  async create(@Body() userPayload: CreateUserDTO){
    return this.userService.create(userPayload)
  }
}

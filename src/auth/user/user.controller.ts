import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./dtos/create_user.dto";
import { ApiCreatedResponse } from "@nestjs/swagger";
import { UserResponseDTO } from "./dtos/user_response.dto";

@Controller('auth/user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ){}

  @Post()
  @ApiCreatedResponse({type: UserResponseDTO})
  async create(@Body() userPayload: CreateUserDTO){
    return this.userService.create(userPayload)
  }
}

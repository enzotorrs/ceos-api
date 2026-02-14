import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./dtos/create_user.dto";

import { UserResponseDTO } from "./dtos/user_response.dto";
import { ApiDataResponse } from "../../common/decorators/api-data-response.decorator";

@Controller('auth/user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Post()
  @ApiDataResponse(UserResponseDTO)
  async create(@Body() userPayload: CreateUserDTO) {
    return this.userService.create(userPayload)
  }
}

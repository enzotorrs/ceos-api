import { ApiProperty } from "@nestjs/swagger"

export class UserResponseDTO {
  @ApiProperty()
  username: string
}

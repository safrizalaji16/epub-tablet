import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { LoginUserDto, RegisterUserDto, UserDto } from 'src/dto/user.dto';
import { UserService } from './user.service';
import { RoleGuard } from 'src/common/roleGuard/role.guard';
import { Roles } from 'src/common/roleGuard/roles.decorator';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @HttpCode(200)
  @UseGuards(RoleGuard)
  @Roles(['admin'])
  async getUsers(): Promise<ResponseDto<UserDto[]>> {
    const users = await this.userService.getUsers();
    return { data: users };
  }

  @Post('/register')
  @HttpCode(201)
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<ResponseDto<UserDto>> {
    const user = await this.userService.register(registerUserDto);
    return { data: user };
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<ResponseDto<UserDto>> {
    const user = await this.userService.login(loginUserDto);
    return { data: user };
  }
}

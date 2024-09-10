import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PwdLoginDto } from './dto/pwd-login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createByEmail(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUserByEmail(createUserDto);
  }

  @Get('find')
  async find(@Query('username') username: string) {
    return await this.userService.findOne(username);
  }

  @Post('login-pwd')
  async loginByPwd(@Body() pwdLoginDto: PwdLoginDto) {
    return await this.userService.loginByPwd(pwdLoginDto);
  }
}

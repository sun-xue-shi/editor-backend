import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PwdLoginDto } from './dto/pwd-login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PhoneLoginDto } from './dto/phone-login.dto';

@Controller('user')
export class UserController {
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(ConfigService)
  private configService: ConfigService;

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

  @Post('login-phone')
  async loginByPhone(@Body() phoneLoginDto: PhoneLoginDto) {
    return await this.userService.loginByPhone(phoneLoginDto);
  }

  @Post('phone-code')
  async sendPhoneCode(@Query('phoneNumber') phoneNumber: string) {
    return await this.userService.sendPhoneCode(phoneNumber);
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') token: string) {
    try {
      const data = this.jwtService.verify(token);
      const user = await this.userService.findOneById(data.userId);
      const accessToken = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
        },
        {
          expiresIn: this.configService.get('jwt_access_token_time') || '3d',
        },
      );
      const refreshToken = this.jwtService.sign(
        {
          userId: user.id,
        },
        { expiresIn: this.configService.get('jwt_refresh_token_time') || '7d' },
      );
      return {
        accessToken,
        refreshToken,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }
}

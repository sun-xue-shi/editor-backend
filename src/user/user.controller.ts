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
    const vo = await this.userService.loginByPwd(pwdLoginDto);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_time') || '3d',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      { expiresIn: this.configService.get('jwt_refresh_token_time') || '7d' },
    );
    return vo;
  }

  @Get('refresh')
  async refresh(@Query('token') token: string) {
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
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }
}

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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { UserType } from './types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  //邮箱 / 手机号注册验证码
  @Post('register-code')
  async registerCode(
    @Query('receiver') receiver: string,
    @Query('type') type: UserType,
  ) {
    return await this.userService.sendRegisterCode(receiver, type);
  }

  //邮箱 / 手机号登录验证码
  @Get('login-code')
  async loginCode(
    @Query('receiver') receiver: string,
    @Query('type') type: UserType,
  ) {
    return await this.userService.sendLoginCode(receiver, type);
  }

  //邮箱 / 手机号注册
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
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
          _id: user._id,
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

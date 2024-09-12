import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.entities';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { CryptoService } from 'src/crypto/crypto.service';
import { PwdLoginDto } from './dto/pwd-login.dto';
import { CountersService } from 'src/counters/counters.service';
import { LoginUserVo } from './schema/loginUser.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  @InjectModel(User.name)
  private userModel: Model<User>;

  @Inject(CryptoService)
  private cryptoService: CryptoService;

  @Inject(CountersService)
  private countersService: CountersService;

  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(RedisService)
  private redisService: RedisService;

  async createUserByEmail(createUserDto: CreateUserDto) {
    const findUser = await this.userModel.findOne({
      username: createUserDto.username,
    });

    if (findUser) {
      throw new HttpException('该用户已存在', HttpStatus.BAD_REQUEST);
    }

    createUserDto.password = await this.cryptoService.hashPassword(
      createUserDto.password,
    );

    createUserDto.id = await this.countersService.getNextSequenceValue('users');
    if (!createUserDto.nickName) {
      createUserDto.nickName = `editor-user-${createUserDto.phoneNumber.slice(-4)}`;
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async loginByPwd(pwdLoginDto: PwdLoginDto) {
    const findUser = await this.userModel.findOne({
      username: pwdLoginDto.username,
    });

    if (!findUser) {
      throw new HttpException('该用户不存在', HttpStatus.BAD_REQUEST);
    }

    const isPass = await this.cryptoService.validatePassword(
      findUser.password,
      pwdLoginDto.password,
    );

    if (!isPass) {
      throw new HttpException('密码错误,请重新输入', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();

    vo.userInfo = {
      id: findUser.id,
      username: findUser.username,
      email: findUser.email,
      phoneNumber: findUser.phoneNumber,
      avatar: findUser.avatar,
    };

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

  async loginByPhone(phoneLoginDto: PhoneLoginDto) {
    const findUser = await this.userModel.findOne({
      username: phoneLoginDto.username,
    });

    if (!findUser) {
      throw new HttpException('该用户不存在', HttpStatus.BAD_REQUEST);
    }

    const code = await this.redisService.get(
      `phone_code_${phoneLoginDto.phoneNumber}`,
    );

    if (!code) {
      throw new HttpException('验证码失效!', HttpStatus.BAD_REQUEST);
    }

    if (code !== phoneLoginDto.code) {
      throw new HttpException('验证码错误!', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();

    vo.userInfo = {
      id: findUser.id,
      username: findUser.username,
      email: findUser.email,
      phoneNumber: findUser.phoneNumber,
      avatar: findUser.avatar,
    };

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

  findOne(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async findOneById(userId: number) {
    const user = await this.userModel.findOne({
      id: userId,
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
    };
  }

  async sendPhoneCode(phoneNumber: string) {
    let code = await this.redisService.get(`phone_code_${phoneNumber}`);

    if (code) {
      throw new HttpException('请勿频繁发送', HttpStatus.BAD_REQUEST);
    } else {
      code = Math.random().toString().slice(2, 6);
      await this.redisService.set(`phone_code_${phoneNumber}`, code, 5 * 60);
      return '发送成功';
    }
  }
}

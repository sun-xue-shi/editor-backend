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
}

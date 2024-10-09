import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.entities';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { CryptoService } from 'src/crypto/crypto.service';
import { LoginDto } from './dto/login.dto';
import { CountersService } from 'src/counters/counters.service';
import { LoginUserVo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { MessageService } from 'src/message/message.service';
import { UserType, UserTypeEnum } from './types';

@Injectable()
export class UserService {
  @InjectModel(User.name)
  private userModel: Model<User>;

  @Inject(MessageService)
  private messageService: MessageService;

  @Inject(CryptoService)
  private cryptoService: CryptoService;

  @Inject(CountersService)
  private countersService: CountersService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(RedisService)
  private redisService: RedisService;

  async createUser(createUserDto: CreateUserDto) {
    const { type, email, phoneNumber } = createUserDto;
    const code = await this.redisService.get(
      `${type}_registerCode_${type === UserTypeEnum.EMAIL ? email : phoneNumber}`,
    );

    if (!code) {
      throw new HttpException('验证码失效!', HttpStatus.BAD_REQUEST);
    }

    if (code !== createUserDto.code) {
      throw new HttpException('验证码错误!', HttpStatus.BAD_REQUEST);
    }

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
      createUserDto.nickName = `editor-user-${Math.random().toString().slice(2, 8)}`;
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async login(loginDto: LoginDto) {
    const findUser = await this.userModel.findOne({
      username: loginDto.username,
    });

    if (!findUser) {
      throw new HttpException('该用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (loginDto.type === UserTypeEnum.PWD) {
      const isPass = await this.cryptoService.validatePassword(
        findUser.password,
        loginDto.password,
      );

      if (!isPass) {
        throw new HttpException('密码错误,请重新输入', HttpStatus.BAD_REQUEST);
      }
    } else if (loginDto.type === UserTypeEnum.EMAIL) {
      if (findUser.type === UserTypeEnum.PHONE) {
        throw new HttpException(
          '该用户未绑定手机号,请选择邮箱或密码登录',
          HttpStatus.BAD_REQUEST,
        );
      }

      const code = await this.redisService.get(`1_loginCode_${loginDto.email}`);

      if (!code) {
        throw new HttpException('验证码失效!', HttpStatus.BAD_REQUEST);
      }

      if (code !== loginDto.code) {
        throw new HttpException('验证码错误!', HttpStatus.BAD_REQUEST);
      }
    } else {
      if (findUser.type === UserTypeEnum.EMAIL) {
        throw new HttpException(
          '该用户未绑定邮箱,请选择手机号或密码登录',
          HttpStatus.BAD_REQUEST,
        );
      }

      const code = await this.redisService.get(
        `0_loginCode_${loginDto.phoneNumber}`,
      );

      if (!code) {
        throw new HttpException('验证码失效!', HttpStatus.BAD_REQUEST);
      }

      if (code !== loginDto.code) {
        throw new HttpException('验证码错误!', HttpStatus.BAD_REQUEST);
      }
    }

    const vo = new LoginUserVo();

    vo.userInfo = {
      id: findUser.id,
      username: findUser.username,
      email: findUser?.email,
      phoneNumber: findUser?.phoneNumber,
      avatar: findUser.avatar,
      type: findUser.type,
      _id: findUser._id,
    };

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        _id: vo.userInfo._id,
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
      _id: user._id,
    };
  }

  async sendRegisterCode(receiver: string, type: UserType) {
    if (!receiver) {
      throw new HttpException('请输入邮箱或手机号', HttpStatus.BAD_REQUEST);
    }

    if (!type) {
      throw new HttpException('请选择发送验证码类型', HttpStatus.BAD_REQUEST);
    }

    let code = await this.redisService.get(`${type}_registerCode_${receiver}`);

    if (code) {
      throw new HttpException('请勿频繁发送', HttpStatus.BAD_REQUEST);
    } else {
      code = Math.random().toString().slice(2, 8);
      await this.redisService.set(
        `${type}_registerCode_${receiver}`,
        code,
        5 * 60,
      );

      if (type === UserTypeEnum.EMAIL) {
        await this.emailService.sendMail({
          to: receiver,
          subject: 'editor-register',
          html: `<p>Your register code is ${code}</p>`,
        });
      } else {
        //短信验证码发送逻辑
        // await this.messageService.sendMessage(receiver, code);
      }
      return '发送成功';
    }
  }

  async sendLoginCode(receiver: string, type: UserType) {
    let code = await this.redisService.get(`${type}_loginCode_${receiver}`);

    if (code) {
      throw new HttpException('请勿频繁发送', HttpStatus.BAD_REQUEST);
    } else {
      code = Math.random().toString().slice(2, 8);
      await this.redisService.set(
        `${type}_loginCode_${receiver}`,
        code,
        5 * 60,
      );

      if (type === UserTypeEnum.EMAIL) {
        await this.emailService.sendMail({
          to: receiver,
          subject: 'editor-login',
          html: `<p>Your login code is ${code}</p>`,
        });
      } else {
        //短信验证码发送逻辑
        // await this.messageService.sendMessage(receiver, code);
      }
      return '发送成功';
    }
  }

  //更新用户类型
  async updateUserType(receiver: string, username: string, type: 1 | 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    type === UserTypeEnum.EMAIL
      ? await this.userModel.updateOne(
          { username },
          { $set: { phoneNumber: receiver, type: 3 } },
        )
      : await this.userModel.updateOne(
          { username },
          { $set: { email: receiver, type: 3 } },
        );
  }
}

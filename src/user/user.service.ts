import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entities';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  @InjectModel(User.name)
  private userModel: Model<User>;

  async createUser(createUserDto: CreateUserDto) {
    const findUser = await this.userModel.findOne({
      username: createUserDto.username,
    });

    if (findUser) {
      throw new HttpException('该用户已存在', HttpStatus.BAD_GATEWAY);
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  findOne(username: string) {
    return this.userModel.findOne({ username }).exec();
  }
}

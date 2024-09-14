import { Inject, Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { Work } from './schema/work.entities';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';
import { UserInfoType } from 'src/user/vo/login-user.vo';
import { CountersService } from 'src/counters/counters.service';

@Injectable()
export class WorkService {
  @InjectModel(Work.name)
  private userModel: Model<Work>;

  @Inject(CountersService)
  private countersService: CountersService;

  async createWork(createWorkDto: CreateWorkDto, userInfo: UserInfoType) {
    const { _id, username } = userInfo;

    const uuid = nanoid(6);

    createWorkDto.id = await this.countersService.getNextSequenceValue('works');

    const newWork = {
      uuid,
      author: username,
      user: new Types.ObjectId(_id),
      ...createWorkDto,
    };

    return await this.userModel.create(newWork);
  }
}

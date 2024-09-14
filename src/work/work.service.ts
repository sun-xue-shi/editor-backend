import { Inject, Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { Work } from './schema/work.entities';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';
import { UserInfoType } from 'src/user/vo/login-user.vo';
import { CountersService } from 'src/counters/counters.service';
import { QueryListDto } from './dto/query-list.dto';

@Injectable()
export class WorkService {
  @InjectModel(Work.name)
  private workModel: Model<Work>;

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

    return await this.workModel.create(newWork);
  }

  async workList(userInfo: UserInfoType, queryListDto: QueryListDto) {
    // eslint-disable-next-line prefer-const
    let { pageIndex, pageSize, title, isTemplate } = queryListDto;

    pageIndex = pageIndex ? pageIndex : 0;
    pageSize = pageSize ? pageSize : 10;
    // title = title ? title : '';

    const findConditon = {
      user: new Types.ObjectId(userInfo._id),
      ...(title && { title: { $regex: title, $options: 'i' } }),
      ...(isTemplate && { isTemplate: !!parseInt(isTemplate) }),
    };

    const list = await this.workModel
      .find(findConditon)
      .select('id author isHot coverImg copiedCount title desc createAt')
      .populate({ path: 'user', select: 'username nickName avatar' })
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createAt: -1 })
      .lean();

    const count = await this.workModel.find(findConditon).countDocuments();

    return { count, list, pageIndex, pageSize };
  }

  async templateList(userInfo: UserInfoType, queryListDto: QueryListDto) {
    // eslint-disable-next-line prefer-const
    let { pageIndex, pageSize } = queryListDto;

    pageIndex = pageIndex ? pageIndex : 0;
    pageSize = pageSize ? pageSize : 10;

    const list = await this.workModel
      .find({ isPublish: true, isTemplate: true })
      .select('id author isHot coverImg copiedCount title desc createAt')
      .populate({ path: 'user', select: 'username nickName avatar' })
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createAt: -1 })
      .lean();

    const count = await this.workModel
      .find({ isPublish: true, isTemplate: true })
      .countDocuments();

    return { count, list, pageIndex, pageSize };
  }
}

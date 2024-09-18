import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { Work } from './schema/work.entities';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';
import { UserInfoType } from 'src/user/vo/login-user.vo';
import { CountersService } from 'src/counters/counters.service';
import { QueryListDto } from './dto/query-list.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { StatusEnum } from './types';
import { ConfigService } from '@nestjs/config';
import { createSSRApp } from 'vue';
import { RenderQueryDto } from './dto/render-query.dto';
import { renderToString } from 'vue/server-renderer';
import { TextComp } from 'editor-components-sw';
import { formatStyle, pxTovw } from './utils';

@Injectable()
export class WorkService {
  @InjectModel(Work.name)
  private workModel: Model<Work>;

  @Inject(CountersService)
  private countersService: CountersService;

  @Inject(ConfigService)
  private configService: ConfigService;

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

  async update(id: string, user_id: string, updateWorkDto: UpdateWorkDto) {
    const work = await this.workModel.findOne({ id });

    if (!work) {
      throw new HttpException('该作品不存在!', HttpStatus.BAD_REQUEST);
    }

    if (work.user.toString() !== user_id) {
      throw new HttpException('没有该作品的操作权限!', HttpStatus.BAD_REQUEST);
    }

    return await this.workModel
      .findOneAndUpdate({ id }, updateWorkDto, {
        new: true,
      })
      .lean();
  }

  async delete(id: string, user_id: string) {
    const work = await this.workModel.findOne({ id });

    if (!work) {
      throw new HttpException('该作品不存在!', HttpStatus.BAD_REQUEST);
    }

    if (work.user.toString() !== user_id) {
      throw new HttpException('没有该作品的操作权限!', HttpStatus.BAD_REQUEST);
    }

    return await this.workModel
      .findOneAndDelete({ id })
      .select('id _id title')
      .lean();
  }

  async publish(id: string, user_id: string, isTemplate = false) {
    const work = await this.workModel.findOne({ id });

    if (!work) {
      throw new HttpException('该作品不存在!', HttpStatus.BAD_REQUEST);
    }

    if (work.user.toString() !== user_id) {
      throw new HttpException('没有该作品的操作权限!', HttpStatus.BAD_REQUEST);
    }

    const data: Partial<UpdateWorkDto> = {
      status: StatusEnum.PUBLISH,
      latestPublishAt: new Date(),
      ...(isTemplate && { isTemplate: true }),
    };

    const res = await this.workModel.findOneAndUpdate({ id }, data, {
      new: true,
    });

    return {
      url: `${this.configService.get('h5_base_url')}/p/${id}-${res.uuid}`,
    };
  }

  async renderH5Page(renderQueryDto: RenderQueryDto) {
    const work = await this.workModel.findOne(renderQueryDto).lean();

    if (!work) {
      throw new HttpException('该作品不存在!', HttpStatus.BAD_REQUEST);
    }

    const { title, content, desc } = work;
    pxTovw(content && content.components);
    const vueApp = createSSRApp({
      data: () => {
        return {
          components: (content && content.components) || [],
        };
      },
      template: `<div v-for="component in components" :key="component.name">
      <TextComp :tag="component.name"  v-bind="component.props"/></div>`,
    });

    vueApp.component('TextComp', TextComp);
    const html = await renderToString(vueApp);
    const bodyStyle = formatStyle(content && content.props);

    return { html, bodyStyle, title, desc };
  }
}

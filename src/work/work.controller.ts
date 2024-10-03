import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  Delete,
  Patch,
  Inject,
} from '@nestjs/common';
import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UserInfoType } from 'src/user/vo/login-user.vo';
import { QueryListDto } from './dto/query-list.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { RenderQueryDto } from './dto/render-query.dto';
import * as ejs from 'ejs';
import * as fs from 'fs';
import { MinioService } from 'src/minio/minio.service';
import * as path from 'path';

@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Inject(MinioService)
  private minioService: MinioService;

  @Post('create')
  @RequireLogin()
  async createWork(
    @Body() createWorkDto: CreateWorkDto,
    @UserInfo() userInfo: UserInfoType,
  ) {
    return await this.workService.createWork(createWorkDto, userInfo);
  }

  @Get('work-list')
  @RequireLogin()
  async workList(
    @UserInfo() userInfo: UserInfoType,
    @Query() queryListDto: QueryListDto,
  ) {
    return await this.workService.workList(userInfo, queryListDto);
  }

  @Get('template-list')
  @RequireLogin()
  async templateList(
    @UserInfo() userInfo: UserInfoType,
    @Query() queryListDto: QueryListDto,
  ) {
    return await this.workService.templateList(userInfo, queryListDto);
  }

  @Patch('update/:id')
  @RequireLogin()
  async update(
    @Param('id') id: string,
    @UserInfo('_id') _id: string,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    return await this.workService.update(id, _id, updateWorkDto);
  }

  @Delete('delete/:id')
  @RequireLogin()
  async delete(@Param('id') id: string, @UserInfo('_id') _id: string) {
    return await this.workService.delete(id, _id);
  }

  @Get(':id')
  @RequireLogin()
  async getwork(@Param('id') id: string, @UserInfo('_id') _id: string) {
    return await this.workService.getWork(id, _id);
  }

  @Patch('publish/:id')
  @RequireLogin()
  async publishWork(@Param('id') id: string, @UserInfo('_id') _id: string) {
    return await this.workService.publish(id, _id, false);
  }

  @Patch('publish-template/:id')
  @RequireLogin()
  async publishTemplate(@Param('id') id: string, @UserInfo('_id') _id: string) {
    return await this.workService.publish(id, _id, true);
  }

  @Get('render')
  async render(@Query() renderQueryDto: RenderQueryDto) {
    const { html, bodyStyle, desc, title } =
      await this.workService.renderH5Page(renderQueryDto);
    const renderData = {
      title,
      desc,
      html,
      bodyStyle,
    };

    const templatePath = path.join(
      __dirname.replace('\\dist', ''),
      '..',
      'views/index.html',
    );

    const templateContent = await fs.promises.readFile(templatePath, 'utf8');

    const page = ejs.render(templateContent, { ...renderData });

    fs.writeFileSync(
      path.join(__dirname.replace('\\dist', ''), '..', 'public/index.html'),
      page,
    );
    const ssrUrl = await this.minioService.uploadFile();

    return ssrUrl;
  }
}

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UserInfoType } from 'src/user/vo/login-user.vo';
import { QueryListDto } from './dto/query-list.dto';

@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

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
}

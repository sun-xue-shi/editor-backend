import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateWorkDto {
  id: number;

  uuid: string;

  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '描述不能为空' })
  @IsString()
  desc: string;

  @IsOptional()
  coverImg: string;

  content: Record<string, any>;

  isTemplate: boolean;

  isPublic: boolean;

  @IsOptional()
  isHot: boolean;

  author: string;

  @IsNotEmpty({ message: 'copiedCount不能为空' })
  @IsNumber()
  copiedCount: number;

  status: 0 | 1 | 2;

  user: Types.ObjectId;
}

import { IsOptional } from 'class-validator';
import { StatusType } from '../types/index';
export class UpdateWorkDto {
  @IsOptional()
  title: string;

  @IsOptional()
  desc: string;

  @IsOptional()
  coverImg: string;

  @IsOptional()
  content: Record<string, any>;

  @IsOptional()
  isTemplate: boolean;

  @IsOptional()
  isPublic: boolean;

  @IsOptional()
  isHot: boolean;

  @IsOptional()
  status: StatusType;

  @IsOptional()
  latestPublishAt: Date;
}

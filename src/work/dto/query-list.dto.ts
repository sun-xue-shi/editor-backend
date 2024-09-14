import { IsOptional } from 'class-validator';

export class QueryListDto {
  @IsOptional()
  pageIndex: number;

  @IsOptional()
  pageSize: number;

  @IsOptional()
  title: string;

  @IsOptional()
  isTemplate: string;

  @IsOptional()
  customSort: Record<string, any>;
}

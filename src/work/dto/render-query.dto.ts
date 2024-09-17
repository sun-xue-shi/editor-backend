import { IsNotEmpty, IsString } from 'class-validator';

export class RenderQueryDto {
  @IsNotEmpty({ message: 'id不能为空' })
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'uuid不能为空' })
  uuid: string;
}

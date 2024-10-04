import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteChannelDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  workId: string;
}

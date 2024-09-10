import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(30)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  email: string;

  @IsString()
  avatar: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  nickName: string;
}

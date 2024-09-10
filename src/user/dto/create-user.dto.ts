import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  id: number;

  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  avatar: string;

  phoneNumber: string;

  nickName: string;
}

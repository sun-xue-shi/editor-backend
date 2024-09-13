import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  id: number;

  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;

  email: string;

  avatar: string;

  phoneNumber: string;

  @IsNotEmpty({ message: '用户创建类型不能为空' })
  type: 'email' | 'phone';

  nickName: string;
}

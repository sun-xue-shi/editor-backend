import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsNotEmpty({ message: '手机号不能为空' })
  phoneNumber: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;
}

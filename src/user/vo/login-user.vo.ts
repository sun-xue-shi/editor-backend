import { Types } from 'mongoose';

export interface UserInfoType {
  _id: Types.ObjectId;

  id: string;

  username: string;

  email: string;

  phoneNumber: string;

  avatar: string;

  type: 'all' | 'email' | 'phone';
}

export class LoginUserVo {
  userInfo: UserInfoType;
  accessToken: string;
  refreshToken: string;
}

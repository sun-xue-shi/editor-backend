import { Types } from 'mongoose';
import { UserType } from '../types';

export interface UserInfoType {
  _id: Types.ObjectId;

  id: string;

  username: string;

  email: string;

  phoneNumber: string;

  avatar: string;

  type: UserType;
}

export class LoginUserVo {
  userInfo: UserInfoType;
  accessToken: string;
  refreshToken: string;
}

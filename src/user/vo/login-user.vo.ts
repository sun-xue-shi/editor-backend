import { Types } from 'mongoose';

interface User {
  _id: Types.ObjectId;

  id: string;

  username: string;

  email: string;

  phoneNumber: string;

  avatar: string;

  type: 'all' | 'email' | 'phone';
}

export class LoginUserVo {
  userInfo: User;
  accessToken: string;
  refreshToken: string;
}

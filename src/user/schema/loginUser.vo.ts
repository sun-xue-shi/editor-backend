interface User {
  id: string;

  username: string;

  email: string;

  phoneNumber: string;

  avatar: string;
}

export class LoginUserVo {
  userInfo: User;
  accessToken: string;
  refreshToken: string;
}

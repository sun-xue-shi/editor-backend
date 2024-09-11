import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CryptoService {
  // 加密密码
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // 生成盐值，10是盐的复杂度
    return bcrypt.hash(password, salt); // 使用盐值和密码生成哈希
  }

  // 验证密码（比较哈希值）
  async validatePassword(
    hashedPassword: string,
    inputPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword); // 比较输入的密码和存储的哈希值
  }
}

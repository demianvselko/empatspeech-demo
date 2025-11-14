import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AppRole, JwtPayload } from '@infrastructure/auth/jwt.types';
import { emailToUserId } from '@infrastructure/auth/email-user-id.util';

type LoginBody = {
  email: string;
  role: AppRole;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  async login(@Body() body: LoginBody): Promise<{ accessToken: string }> {
    const userId = emailToUserId(body.email);

    const payload: JwtPayload = {
      sub: userId,
      role: body.role,
      email: body.email,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}

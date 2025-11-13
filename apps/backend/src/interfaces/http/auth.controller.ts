import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwtTypes from '@infrastructure/auth/jwt.types';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: jwtTypes.JwtLoginInput): { accessToken: string } {
    const payload: jwtTypes.JwtPayload = {
      sub: body.userId,
      role: body.role,
      email: body.email,
    };
    const accessToken = this.jwt.sign(payload);
    return { accessToken };
  }
}

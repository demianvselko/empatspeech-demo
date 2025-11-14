import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from '@interfaces/http/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dont_hack_me_please',
      signOptions: {
        expiresIn: (() => {
          const env = process.env.JWT_EXPIRATION_TIME || '3600';
          const parsed = env.endsWith('s')
            ? Number.parseInt(env.slice(0, -1), 10)
            : Number.parseInt(env, 10);
          return Number.isNaN(parsed) ? 3600 : parsed;
        })(),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}

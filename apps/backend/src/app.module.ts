import { HealthModule } from '@interfaces/http/health.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.STAGE ?? 'local'}`,
    }),
    HealthModule,
  ],
})
export class AppModule {}

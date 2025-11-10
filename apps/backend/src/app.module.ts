import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './shared/health.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsHttpModule } from './interfaces/http/students.http.module';
import { SessionsHttpModule } from './interfaces/http/sessions.http.module';
import { HealthModule } from './shared/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mvp'),
    HealthModule,
    StudentsHttpModule,
    SessionsHttpModule,
  ],
})
export class AppModule { }

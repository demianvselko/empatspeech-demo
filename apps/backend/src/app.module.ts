import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './interfaces/http/health.module';
import { SessionsModule } from './interfaces/http/sessions.module';

import { APP_LOGGER } from './core/logging/logger.tokens';
import type { LoggerPort } from './core/logging/logger.port';
import { PinoLoggerAdapter } from './infrastructure/logger/pino-logger.adapter';
import { AllExceptionsFilter } from './core/http/filters/all-exceptions.filter';
import { HttpLoggingInterceptor } from './core/http/interceptors/http-logging.interceptor';
import { RequestIdMiddleware } from './core/middleware/request-id.middleware';
import { MongoPersistenceModule } from './infrastructure/persistence/database/mongoose/mongoose.module';
import { SessionsWsModule } from '@interfaces/ws/sessions-ws.module';
import { AuthModule } from '@infrastructure/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.STAGE ?? 'local'}`,
    }),
    MongoPersistenceModule,
    HealthModule,
    SessionsModule,
    SessionsWsModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_LOGGER,
      useFactory: (): LoggerPort => new PinoLoggerAdapter(),
    },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

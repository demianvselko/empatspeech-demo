import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import pino from 'pino';

const logger = pino({
  level: process.env.STAGE === 'prod' ? 'info' : 'debug',
  transport:
    process.env.STAGE === 'prod' ? undefined : { target: 'pino-pretty' },
});

@Injectable()
export class LoggingInterceptor<T = unknown> implements NestInterceptor<T, T> {
  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const req = ctx.switchToHttp().getRequest();
    const start = Date.now();
    const rid = req.id || req.headers['x-request-id'];

    logger.debug({ rid, method: req.method, url: req.url }, 'incoming request');

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        logger.debug({ rid, ms }, 'request completed');
      }),
    );
  }
}

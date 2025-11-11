import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { APP_LOGGER } from '../../logging/logger.tokens';
import type { LoggerPort } from '../../logging/logger.port';
import { extractRequestInfo } from 'src/core/request-info.extractor';

@Injectable()
export class HttpLoggingInterceptor<T> implements NestInterceptor<T, T> {
  constructor(@Inject(APP_LOGGER) private readonly logger: LoggerPort) {}

  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const info = extractRequestInfo(ctx);
    const start = Date.now();

    this.logger.debug('http: incoming', {
      rid: info.rid,
      method: info.method,
      url: info.url,
    });

    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.debug('http: completed', {
            rid: info.rid,
            ms: Date.now() - start,
          }),
        error: (err: unknown) =>
          this.logger.error(
            'http: failed',
            { rid: info.rid, ms: Date.now() - start },
            err,
          ),
      }),
    );
  }
}

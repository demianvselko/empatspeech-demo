import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { APP_LOGGER } from '../../logging/logger.tokens';
import type { LoggerPort } from '../../logging/logger.port';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(APP_LOGGER) private readonly logger: LoggerPort,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<{ url?: string; [k: string]: unknown }>();
    const response = ctx.getResponse<unknown>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    const payload = {
      ok: false,
      statusCode: status,
      path: request?.url ?? '',
      timestamp: new Date().toISOString(),
      message: body,
    };

    this.logger.error(
      'http: exception',
      { statusCode: status, path: payload.path },
      exception,
    );

    httpAdapter.reply(response, payload, status);
  }
}

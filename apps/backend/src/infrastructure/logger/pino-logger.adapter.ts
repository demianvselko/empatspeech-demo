import pino, { type Logger as Pino } from 'pino';
import type { LoggerPort, LogMeta } from '../../core/logging/logger.port';

export class PinoLoggerAdapter implements LoggerPort {
  private readonly logger: Pino;

  constructor(
    level: 'info' | 'debug' = process.env.STAGE === 'prod' ? 'info' : 'debug',
  ) {
    this.logger = pino({
      level,
      transport:
        process.env.STAGE === 'prod' ? undefined : { target: 'pino-pretty' },
    });
  }

  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(meta ?? {}, message);
  }
  info(message: string, meta?: LogMeta): void {
    this.logger.info(meta ?? {}, message);
  }
  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(meta ?? {}, message);
  }
  error(message: string, meta?: LogMeta, err?: unknown): void {
    this.logger.error({ ...(meta ?? {}), err }, message);
  }
}

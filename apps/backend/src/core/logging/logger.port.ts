export interface LogMeta {
  rid?: string;
  [k: string]: unknown;
}

export interface LoggerPort {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta, err?: unknown): void;
}

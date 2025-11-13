import type { ExecutionContext } from '@nestjs/common';

export interface RequestInfo {
  method?: string;
  url?: string;
  ip?: string;
  rid?: string;
  headers: Record<string, unknown>;
}

export function extractRequestInfo(ctx: ExecutionContext): RequestInfo {
  const http = ctx.switchToHttp();
  const req = http.getRequest<{
    method?: string;
    url?: string;
    ip?: string;
    headers?: Record<string, unknown>;
    id?: string;
    socket?: { remoteAddress?: string };
    [k: string]: unknown;
  }>();

  const headers = req?.headers ?? {};
  const rid = req?.id || (headers['x-request-id'] as string | undefined);
  const ip = req?.ip ?? req?.socket?.remoteAddress;

  return {
    method: req?.method,
    url: req?.url,
    ip,
    rid,
    headers,
  };
}

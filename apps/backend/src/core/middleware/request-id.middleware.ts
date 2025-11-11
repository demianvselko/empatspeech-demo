import type { NestMiddleware } from '@nestjs/common';

export class RequestIdMiddleware implements NestMiddleware {
  use(
    req: { headers: Record<string, unknown>; [k: string]: unknown },
    _res: unknown,
    next: () => void,
  ): void {
    const existing =
      (req.headers['x-request-id'] as string | undefined) ??
      (req as { id?: string }).id;
    const rid =
      existing ??
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random()}`;
    req.headers['x-request-id'] = rid;
    (req as { id?: string }).id = rid;
    next();
  }
}

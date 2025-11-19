import type { Socket } from 'socket.io';
import type { BaseError } from '@domain/shared/error/base.error';

export function emitDomainError(
  client: Socket,
  error: BaseError | BaseError[],
): void {
  const errors = Array.isArray(error) ? error : [error];

  client.emit('error', {
    errors: errors.map((e) => ({
      code: e.code,
      message: e.message,
      context: e.context ?? undefined,
    })),
  });
}

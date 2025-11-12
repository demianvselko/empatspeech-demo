import { BaseError } from '@domain/shared/error/base.error';

export class InfrastructureError extends BaseError {
  constructor(
    message: string,
    code = 'INFRASTRUCTURE_ERROR',
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
  }
}

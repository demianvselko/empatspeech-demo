import { BaseError } from '@domain/shared/error/base.error';

export class TestRepoError extends BaseError {
  constructor(
    code: string,
    message = 'repo error',
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
  }
}

export const makeRepoError = (code: string, message = 'boom') =>
  new TestRepoError(code, message);

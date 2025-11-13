import { Result } from '@domain/shared/result/result';
import type { BaseError } from '@domain/shared/error/base.error';

export const okVoid = (): Result<void, BaseError> =>
  Result.ok(undefined) as unknown as Result<void, BaseError>;

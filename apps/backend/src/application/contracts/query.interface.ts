import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';

export interface Query<I, O> {
  execute(input: I): Promise<Result<O, BaseError>>;
}

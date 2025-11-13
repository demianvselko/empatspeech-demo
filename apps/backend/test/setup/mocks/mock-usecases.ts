import { Result } from '@domain/shared/result/result';
import type { BaseError } from '@domain/shared/error/base.error';

export const ucOk = <T>(value: T) =>
  Result.ok<T>(value) as unknown as Result<T, BaseError>;
export const ucFail = (err: BaseError | BaseError[]) => Result.fail(err);

export const makeUc = <I, O>() => ({
  execute: jest.fn<Promise<Result<O, BaseError>>, [I]>(),
});
export type MockUC<I, O> = ReturnType<typeof makeUc<I, O>>;

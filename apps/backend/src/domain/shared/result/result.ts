import { BaseError } from '../error/base.error';

export type ErrorList<E extends BaseError> = E[];

export class Result<T, E extends BaseError = BaseError> {
  private constructor(
    private readonly okInternal: boolean,
    private readonly valueInternal?: T,
    private readonly errorsInternal?: ErrorList<E>,
    private readonly messageInternal?: string,
  ) {}

  static ok<T>(value: T, message?: string): Result<T, never> {
    return new Result<T, never>(true, value, undefined, message);
  }

  static fail<E extends BaseError>(
    errors: ErrorList<E> | E,
    message?: string,
  ): Result<never, E> {
    const list = Array.isArray(errors) ? errors : [errors];
    return new Result<never, E>(false, undefined, list, message);
  }

  isSuccess(): boolean {
    return this.okInternal;
  }
  isFailure(): boolean {
    return !this.okInternal;
  }

  getValue(): T {
    if (!this.okInternal)
      throw new Error('Tried to get value from a failed Result');
    return this.valueInternal as T;
  }

  getErrors(): ErrorList<E> {
    if (this.okInternal)
      throw new Error('Tried to get errors from a successful Result');
    return this.errorsInternal as ErrorList<E>;
  }

  get message(): string | undefined {
    return this.messageInternal;
  }
}

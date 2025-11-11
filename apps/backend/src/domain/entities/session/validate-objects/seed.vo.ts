import { Result } from '@domain/shared/result/result';
import {
  ValidationError,
  ValidationErrorCode,
} from '@domain/shared/error/validation.error';

export class SeedVO {
  private constructor(private readonly value: number) {}

  static fromNumber(n: number): Result<SeedVO, ValidationError> {
    if (!Number.isFinite(n)) {
      return Result.fail(
        new ValidationError(
          ValidationErrorCode.INVALID_FORMAT,
          'seed must be finite number',
        ),
      );
    }
    if (!Number.isInteger(n) || n < 0) {
      return Result.fail(
        new ValidationError(
          ValidationErrorCode.INVALID_FORMAT,
          'seed must be integer >= 0',
        ),
      );
    }
    return Result.ok(new SeedVO(n));
  }

  static random(max = 1_000_000): SeedVO {
    const v = Math.floor(Math.random() * Math.max(1, max));
    return new SeedVO(v);
  }

  get valueAsNumber(): number {
    return this.value;
  }
}

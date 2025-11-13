import {
  ValidationError,
  ValidationErrorCode,
} from '@domain/shared/error/validation.error';
import { Result } from '@domain/shared/result/result';
import { CreatedAtVO } from '@domain/shared/valid-objects';

export class FinishedAtVO {
  private constructor(private readonly value: Date) {}

  static from(
    date: Date | number | string,
    _mustBeAfter: CreatedAtVO,
  ): Result<FinishedAtVO, ValidationError> {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) {
      return Result.fail(
        new ValidationError(
          ValidationErrorCode.INVALID_FORMAT,
          'finishedAt invalid date',
        ),
      );
    }
    const now = Date.now();
    if (d.getTime() > now) {
      return Result.fail(
        new ValidationError(
          ValidationErrorCode.FUTURE_DATE,
          'finishedAt cannot be in the future',
        ),
      );
    }
    return Result.ok(new FinishedAtVO(d));
  }

  static now(mustBeAfter: CreatedAtVO): Result<FinishedAtVO, ValidationError> {
    return FinishedAtVO.from(Date.now(), mustBeAfter);
  }

  get valueAsDate(): Date {
    return this.value;
  }
  get valueAsIsoString(): string {
    return this.value.toISOString();
  }
  get valueAsEpochMs(): number {
    return this.value.getTime();
  }
}

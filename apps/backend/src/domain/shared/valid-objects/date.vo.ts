import { Result } from '../result/result';
import { InvalidDateError } from '../error/vo/date.error';
import { ValidationErrorCode } from '../error/validation.error';
import { Clock, SystemClock } from '@domain/types/clock';

export class CreatedAtVO {
  private constructor(private readonly dateValue: Date) {}

  static now(clock: Clock = new SystemClock()): CreatedAtVO {
    return new CreatedAtVO(clock.now());
  }

  static from(
    input: Date | string | number,
    clock: Clock = new SystemClock(),
    toleranceSeconds = 120,
  ): Result<CreatedAtVO, InvalidDateError> {
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) {
      return Result.fail(
        new InvalidDateError(ValidationErrorCode.INVALID_FORMAT),
      );
    }
    const futureLimit = new Date(
      clock.now().getTime() + toleranceSeconds * 1000,
    );
    if (date.getTime() > futureLimit.getTime()) {
      return Result.fail(
        new InvalidDateError(ValidationErrorCode.FUTURE_DATE, { input }),
      );
    }
    return Result.ok(new CreatedAtVO(new Date(date)));
  }

  static unsafeFrom(input: Date | string | number): CreatedAtVO {
    const r = this.from(input);
    if (r.isFailure()) throw r.getErrors()[0];
    return r.getValue();
  }

  get valueAsDate(): Date {
    return this.dateValue;
  }
  get valueAsEpochMs(): number {
    return this.dateValue.getTime();
  }
  get valueAsIsoString(): string {
    return this.dateValue.toISOString();
  }
}

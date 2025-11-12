import { Result } from '@domain/shared/result/result';
import { CreatedAtVO } from '@domain/shared/valid-objects';
import {
  ValidationError,
  ValidationErrorCode,
} from '@domain/shared/error/validation.error';

export type TrialPrimitives = Readonly<{
  correct: boolean;
  ts?: Date | string | number;
}>;

export class TrialVO {
  private constructor(
    private readonly correct: boolean,
    private readonly ts: CreatedAtVO,
  ) {}

  static create(
    correct: boolean,
    ts?: Date | string | number,
  ): Result<TrialVO, ValidationError> {
    if (typeof correct !== 'boolean')
      return Result.fail(
        new ValidationError(
          ValidationErrorCode.INVALID_FORMAT,
          'trial.correct must be boolean',
        ),
      );
    const tsRes =
      ts === undefined ? Result.ok(CreatedAtVO.now()) : CreatedAtVO.from(ts);
    if (tsRes.isFailure()) return Result.fail(tsRes.getErrors());
    return Result.ok(new TrialVO(correct, tsRes.getValue()));
  }

  static fromPrimitives(p: TrialPrimitives): Result<TrialVO, ValidationError> {
    return TrialVO.create(p.correct, p.ts);
  }

  get isCorrect(): boolean {
    return this.correct;
  }
  get timestamp(): CreatedAtVO {
    return this.ts;
  }

  toPrimitives(): Readonly<{
    correct: boolean;
    tsIso: string;
    tsEpochMs: number;
  }> {
    return Object.freeze({
      correct: this.correct,
      tsIso: this.ts.valueAsIsoString,
      tsEpochMs: this.ts.valueAsEpochMs,
    });
  }
}

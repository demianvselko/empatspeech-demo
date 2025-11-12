import { Result } from '../result/result';
import { ValidationErrorCode } from '../error/validation.error';
import { InvalidStringError } from '../error/vo/string.error';

export type StringVOOptions = Readonly<{
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  trim?: boolean;
  lowercase?: boolean;
  fieldName?: string;
}>;

export class StringVO {
  private constructor(private readonly value: string) {}

  static from(
    raw: string,
    options: StringVOOptions = {},
  ): Result<StringVO, InvalidStringError> {
    const {
      minLength = 1,
      maxLength = Number.POSITIVE_INFINITY,
      pattern,
      trim = true,
      lowercase = false,
      fieldName = 'value',
    } = options;

    let normalized = raw ?? '';
    if (trim) normalized = normalized.trim();
    if (lowercase) normalized = normalized.toLowerCase();

    if (!normalized) {
      return Result.fail(
        new InvalidStringError(ValidationErrorCode.EMPTY, { fieldName }),
      );
    }
    if (normalized.length < minLength) {
      return Result.fail(
        new InvalidStringError(ValidationErrorCode.MIN_LENGTH, {
          fieldName,
          minLength,
          length: normalized.length,
        }),
      );
    }
    if (normalized.length > maxLength) {
      return Result.fail(
        new InvalidStringError(ValidationErrorCode.MAX_LENGTH, {
          fieldName,
          maxLength,
          length: normalized.length,
        }),
      );
    }
    if (pattern && !pattern.test(normalized)) {
      return Result.fail(
        new InvalidStringError(ValidationErrorCode.INVALID_FORMAT, {
          fieldName,
        }),
      );
    }

    return Result.ok(new StringVO(normalized));
  }

  get valueAsString(): string {
    return this.value;
  }
}

import { Result } from '../result/result';
import { ValidationErrorCode } from '../error/validation.error';
import { InvalidEmailError } from '../error/vo/email.error';

export class EmailVO {
  private constructor(private readonly email: string) {}

  static fromString(value: string): Result<EmailVO, InvalidEmailError> {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
      return Result.fail(new InvalidEmailError(ValidationErrorCode.EMPTY));
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(normalized)) {
      return Result.fail(
        new InvalidEmailError(ValidationErrorCode.INVALID_FORMAT),
      );
    }
    return Result.ok(new EmailVO(normalized));
  }

  get valueAsString(): string {
    return this.email;
  }
}

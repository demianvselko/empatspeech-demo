import { Result } from '../result/result';
import {
  v4 as uuidv4,
  validate as uuidValidate,
  version as uuidVersion,
} from 'uuid';
import { InvalidUuidError } from '../error/vo/uuid.error';
import { ValidationErrorCode } from '../error/validation.error';

export class UuidVO {
  private constructor(private readonly uuidAsString: string) {}

  static generate(): UuidVO {
    return new UuidVO(uuidv4());
  }

  static fromString(value: string): Result<UuidVO, InvalidUuidError> {
    const trimmed = value?.trim();
    if (!trimmed)
      return Result.fail(new InvalidUuidError(ValidationErrorCode.EMPTY));
    if (!uuidValidate(trimmed))
      return Result.fail(
        new InvalidUuidError(ValidationErrorCode.INVALID_FORMAT),
      );
    if (uuidVersion(trimmed) !== 4)
      return Result.fail(
        new InvalidUuidError(ValidationErrorCode.INVALID_FORMAT),
      );
    return Result.ok(new UuidVO(trimmed));
  }

  static unsafeFromString(value: string): UuidVO {
    const r = UuidVO.fromString(value);
    if (r.isFailure()) throw r.getErrors()[0];
    return r.getValue();
  }

  get valueAsString(): string {
    return this.uuidAsString;
  }
}

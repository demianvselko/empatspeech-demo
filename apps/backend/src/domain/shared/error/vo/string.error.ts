import { ValidationError, ValidationErrorCode } from '../validation.error';

export class InvalidStringError extends ValidationError {
  constructor(code: ValidationErrorCode, context?: Record<string, unknown>) {
    super(code, `Invalid string: ${code}`, context);
  }
}

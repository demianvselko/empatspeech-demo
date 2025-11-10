import { ValidationError, ValidationErrorCode } from '../validation.error';

export class InvalidDateError extends ValidationError {
  constructor(code: ValidationErrorCode, context?: Record<string, unknown>) {
    super(code, `Invalid date: ${code}`, context);
  }
}

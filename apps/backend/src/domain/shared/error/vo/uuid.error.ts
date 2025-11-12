import { ValidationError, ValidationErrorCode } from '../validation.error';

export class InvalidUuidError extends ValidationError {
  constructor(code: ValidationErrorCode, context?: Record<string, unknown>) {
    super(code, `Invalid UUID: ${code}`, context);
  }
}

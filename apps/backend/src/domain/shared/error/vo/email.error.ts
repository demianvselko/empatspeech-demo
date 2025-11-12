import { ValidationError, ValidationErrorCode } from '../validation.error';

export class InvalidEmailError extends ValidationError {
  constructor(code: ValidationErrorCode, context?: Record<string, unknown>) {
    super(code, `Invalid email: ${code}`, context);
  }
}

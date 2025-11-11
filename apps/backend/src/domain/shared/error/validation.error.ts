import { BaseError } from './base.error';

export enum ValidationErrorCode {
  EMPTY = 'EMPTY',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  FUTURE_DATE = 'FUTURE_DATE',
}

export class ValidationError extends BaseError {
  constructor(
    code: ValidationErrorCode,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
  }
}

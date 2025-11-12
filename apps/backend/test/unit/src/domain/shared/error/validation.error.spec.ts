import {
  ValidationError,
  ValidationErrorCode,
} from '@domain/shared/error/validation.error';

describe('ValidationError', () => {
  it('sets message, code, name y context', () => {
    const err = new ValidationError(ValidationErrorCode.EMPTY, 'Empty!', {
      field: 'email',
    });
    expect(err.name).toBe('ValidationError');
    expect(err.message).toBe('Empty!');
    expect(err.code).toBe(ValidationErrorCode.EMPTY);
    expect(err.context).toEqual({ field: 'email' });
    expect(err).toBeInstanceOf(Error);
  });
});

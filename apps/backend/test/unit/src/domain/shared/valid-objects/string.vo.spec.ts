import { StringVO } from '@domain/shared/valid-objects';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('StringVO', () => {
  it('normaliza por default con trim y puede lowerCase', () => {
    const r = StringVO.from('  Hola  ', { lowercase: true });
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue().valueAsString).toBe('hola');
  });

  it('valida vacío, min, max y regex', () => {
    const empty = StringVO.from('   ', { fieldName: 'name' });
    expect(empty.isFailure()).toBe(true);
    expect(empty.getErrors()[0].code).toBe(ValidationErrorCode.EMPTY);

    const min = StringVO.from('ab', { minLength: 3, fieldName: 'code' });
    expect(min.isFailure()).toBe(true);
    expect(min.getErrors()[0].code).toBe(ValidationErrorCode.MIN_LENGTH);

    const max = StringVO.from('abcdef', { maxLength: 5, fieldName: 'code' });
    expect(max.isFailure()).toBe(true);
    expect(max.getErrors()[0].code).toBe(ValidationErrorCode.MAX_LENGTH);

    const pattern = StringVO.from('abc-123', {
      pattern: /^[a-z]+$/,
      fieldName: 'slug',
    });
    expect(pattern.isFailure()).toBe(true);
    expect(pattern.getErrors()[0].code).toBe(
      ValidationErrorCode.INVALID_FORMAT,
    );
  });
});

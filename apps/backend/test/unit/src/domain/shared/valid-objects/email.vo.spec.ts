import { EmailVO } from '@domain/shared/valid-objects';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('EmailVO', () => {
  it('acepta emails válidos y normaliza a minúsculas', () => {
    const r = EmailVO.fromString('  Test.User@Example.COM ');
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue().valueAsString).toBe('test.user@example.com');
  });

  it('falla con vacío o formato inválido', () => {
    const empty = EmailVO.fromString('  ');
    expect(empty.isFailure()).toBe(true);
    expect(empty.getErrors()[0].code).toBe(ValidationErrorCode.EMPTY);

    const bad = EmailVO.fromString('no-at-symbol');
    expect(bad.isFailure()).toBe(true);
    expect(bad.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });
});

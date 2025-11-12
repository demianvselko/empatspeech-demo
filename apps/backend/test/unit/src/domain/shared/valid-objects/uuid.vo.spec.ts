import { UuidVO } from '@domain/shared/valid-objects';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('UuidVO', () => {
  it('generate produces v4 uuid válido', () => {
    const u = UuidVO.generate();
    expect(u.valueAsString).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('fromString acepta uuid v4 válido', () => {
    const ok = UuidVO.fromString('550e8400-e29b-41d4-a716-446655440000');
    expect(ok.isSuccess()).toBe(true);
    expect(ok.getValue().valueAsString).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('fromString falla con vacío o formato inválido', () => {
    const r1 = UuidVO.fromString('   ');
    expect(r1.isFailure()).toBe(true);
    expect(r1.getErrors()[0].code).toBe(ValidationErrorCode.EMPTY);

    const r2 = UuidVO.fromString('not-a-uuid');
    expect(r2.isFailure()).toBe(true);
    expect(r2.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);

    const r3 = UuidVO.fromString('00000000-0000-0000-0000-000000000000');
    expect(r3.isFailure()).toBe(true);
    expect(r3.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('unsafeFromString lanza error ante inválido', () => {
    expect(() => UuidVO.unsafeFromString('bad')).toThrow();
  });
});

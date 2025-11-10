import { basePropsFromPrimitives } from '@domain/base/base-props.factory';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('Integration: basePropsFromPrimitives', () => {
  it('rechaza múltiples errores (uuid inválido y fecha inválida)', () => {
    const r1 = basePropsFromPrimitives({
      entityId: 'bad',
      createdAt: 'also-bad',
    });
    expect(r1.isFailure()).toBe(true);
    const codes = r1.getErrors().map((e) => e.code);
    expect(codes).toContain(ValidationErrorCode.INVALID_FORMAT);
  });

  it('acepta input mínimo y aplica defaults coherentes', () => {
    const ok = basePropsFromPrimitives({ isActive: false });
    expect(ok.isSuccess()).toBe(true);
    const p = ok.getValue();
    expect(p.isActive).toBe(false);
    expect(p.entityId.valueAsString).toMatch(/^[0-9a-f-]{36}$/i);
    expect(p.createdAt.valueAsIsoString).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

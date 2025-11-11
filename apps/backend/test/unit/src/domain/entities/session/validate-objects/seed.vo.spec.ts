import { SeedVO } from '@domain/entities/session/validate-objects/seed.vo';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('SeedVO', () => {
  it('fromNumber: acepta enteros >= 0', () => {
    const ok = SeedVO.fromNumber(123);
    expect(ok.isSuccess()).toBe(true);
    expect(ok.getValue().valueAsNumber).toBe(123);
  });

  it('fromNumber: rechaza NaN, infinitos, negativos y no enteros', () => {
    for (const n of [Number.NaN, Infinity, -1, 1.5] as unknown as number[]) {
      const r = SeedVO.fromNumber(n);
      expect(r.isFailure()).toBe(true);
      expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
    }
  });

  it('random: genera entero válido >=0', () => {
    const s = SeedVO.random(10);
    expect(Number.isInteger(s.valueAsNumber)).toBe(true);
    expect(s.valueAsNumber).toBeGreaterThanOrEqual(0);
    expect(s.valueAsNumber).toBeLessThan(10);
  });
});

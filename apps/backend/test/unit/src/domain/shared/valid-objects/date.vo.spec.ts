import { CreatedAtVO } from '@domain/shared/valid-objects';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';
import { Clock } from '@domain/types/clock';

class FixedClock implements Clock {
  constructor(private readonly fixed: Date) {}
  now(): Date {
    return new Date(this.fixed);
  }
}

describe('CreatedAtVO', () => {
  it('now utiliza el clock provisto', () => {
    const fixed = new Date('2025-01-01T00:00:00.000Z');
    const vo = CreatedAtVO.now(new FixedClock(fixed));
    expect(vo.valueAsIsoString).toBe('2025-01-01T00:00:00.000Z');
  });

  it('from acepta fecha válida (Date/string/number) y copia defensivamente', () => {
    const r = CreatedAtVO.from('2025-01-02T03:04:05.000Z');
    expect(r.isSuccess()).toBe(true);
    const d = r.getValue().valueAsDate;
    expect(d.toISOString()).toBe('2025-01-02T03:04:05.000Z');

    const n = Date.parse('2025-01-03T00:00:00.000Z');
    const r2 = CreatedAtVO.from(n);
    expect(r2.isSuccess()).toBe(true);
  });

  it('from falla con formato inválido', () => {
    const r = CreatedAtVO.from('bad-date');
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('from falla si está demasiado en el futuro según toleranceSeconds', () => {
    const base = new Date('2025-01-01T00:00:00.000Z');
    const clock = new FixedClock(base);
    const future = new Date(base.getTime() + 10_000); // +10s
    const r = CreatedAtVO.from(future, clock, 5); // tolerancia 5s
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.FUTURE_DATE);
  });

  it('unsafeFrom lanza si inválido', () => {
    expect(() => CreatedAtVO.unsafeFrom('bad-date')).toThrow();
  });
});

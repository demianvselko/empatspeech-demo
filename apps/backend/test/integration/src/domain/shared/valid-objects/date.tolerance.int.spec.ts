import { CreatedAtVO } from '@domain/shared/valid-objects';
import { Clock } from '@domain/types/clock';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

class FixedClock implements Clock {
  constructor(private readonly d: Date) {}
  now(): Date {
    return new Date(this.d);
  }
}

describe('Integration: CreatedAtVO tolerance', () => {
  it('acepta fechas levemente futuras dentro del toleranceSeconds', () => {
    const base = new Date('2025-01-01T00:00:00.000Z');
    const clock = new FixedClock(base);
    const slightlyFuture = new Date(base.getTime() + 1000);
    const r = CreatedAtVO.from(slightlyFuture, clock, 2);
    expect(r.isSuccess()).toBe(true);
  });

  it('rechaza fechas demasiado futuras', () => {
    const base = new Date('2025-01-01T00:00:00.000Z');
    const clock = new FixedClock(base);
    const farFuture = new Date(base.getTime() + 5000);
    const r = CreatedAtVO.from(farFuture, clock, 2);
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.FUTURE_DATE);
  });
});

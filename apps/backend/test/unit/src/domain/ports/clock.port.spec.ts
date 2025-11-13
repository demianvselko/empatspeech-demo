import { SystemClock } from '@domain/ports/clock.port';

describe('SystemClock', () => {
  it('nowEpochMs devuelve un epoch numérico cercano a Date.now()', () => {
    const before = Date.now();
    const v = SystemClock.nowEpochMs();
    const after = Date.now();
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThanOrEqual(before - 5);
    expect(v).toBeLessThanOrEqual(after + 5);
  });
});

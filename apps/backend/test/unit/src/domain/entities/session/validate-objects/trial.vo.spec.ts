import { TrialVO } from '@domain/entities/session/validate-objects/trial.vo';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('TrialVO', () => {
  it('create: por defecto usa now() si no se pasa ts', () => {
    const before = Date.now();
    const r = TrialVO.create(true);
    expect(r.isSuccess()).toBe(true);
    const t = r.getValue().toPrimitives();
    const after = Date.now();

    expect(t.correct).toBe(true);
    expect(typeof t.tsEpochMs).toBe('number');
    expect(t.tsEpochMs).toBeGreaterThanOrEqual(before - 5);
    expect(t.tsEpochMs).toBeLessThanOrEqual(after + 5);
    expect(typeof t.tsIso).toBe('string');
  });

  it('create: valida correct boolean y fecha válida', () => {
    const r1 = TrialVO.create(null as unknown as boolean);
    expect(r1.isFailure()).toBe(true);
    expect(r1.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);

    const r2 = TrialVO.create(true, 'not-a-date');
    expect(r2.isFailure()).toBe(true);
    expect(r2.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('fromPrimitives: delega en create', () => {
    const r = TrialVO.fromPrimitives({
      correct: false,
      ts: '2025-01-02T00:00:00.000Z',
    });
    expect(r.isSuccess()).toBe(true);
    const p = r.getValue().toPrimitives();
    expect(p.correct).toBe(false);
    expect(p.tsIso).toBe('2025-01-02T00:00:00.000Z');
  });
});

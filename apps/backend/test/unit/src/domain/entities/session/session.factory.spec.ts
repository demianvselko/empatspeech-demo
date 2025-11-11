/* eslint-disable  @typescript-eslint/no-explicit-any */
import { SessionFactory } from '@domain/entities/session/session.factory';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

const SLP = '550e8400-e29b-41d4-a716-446655440000';
const STU = '550e8400-e29b-41d4-a716-446655440001';

describe('SessionFactory.newQuick', () => {
  it('crea sesión con defaults (seed aleatorio, trials vacíos, notes opcional)', () => {
    const r = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
      notes: '  hello ',
    });
    expect(r.isSuccess()).toBe(true);
    const s = r.getValue();
    expect(s.sessionId.valueAsString).toMatch(/^[0-9a-f-]{36}$/i);
    expect(typeof s.seed).toBe('number');
    expect(s.seed).toBeGreaterThanOrEqual(0);
    expect(s.seed).toBeLessThan(1_000_000);
    expect(s.trials).toEqual([]);
    expect(s.notes?.valueAsString).toBe('hello');
  });

  it('rechaza uuids inválidos', () => {
    const bad1 = SessionFactory.newQuick({ slpId: 'bad', studentId: STU });
    expect(bad1.isFailure()).toBe(true);
    expect(bad1.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);

    const bad2 = SessionFactory.newQuick({ slpId: SLP, studentId: 'bad' });
    expect(bad2.isFailure()).toBe(true);
    expect(bad2.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });
  it('sin notes (omitido) => success con notes undefined', () => {
    const r = SessionFactory.newQuick({ slpId: SLP, studentId: STU });
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue().notes).toBeUndefined();
  });

  it('notes vacías => fail (EMPTY de StringVO)', () => {
    const r = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
      notes: '   ',
    });
    expect(r.isFailure()).toBe(true);
  });
});

describe('SessionFactory.fromPrimitives', () => {
  it('crea sesión completa con finishedAt y trials normalizados', () => {
    const r = SessionFactory.fromPrimitives({
      id: SLP,
      active: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      slpId: SLP,
      studentId: STU,
      seed: 12345,
      finishedAt: '2025-01-01T01:00:00.000Z',
      notes: '  note ',
      trials: [
        { correct: true, tsEpochMs: 1000.9 as unknown as number },
        { correct: false, tsEpochMs: 2001 },
      ] as any,
    });

    expect(r.isSuccess()).toBe(true);
    const s = r.getValue();

    expect(s.sessionId.valueAsString).toBe(SLP);
    expect(s.slpId.valueAsString).toBe(SLP);
    expect(s.studentId.valueAsString).toBe(STU);
    expect(s.seed).toBe(12345);
    expect(s.finishedAt?.valueAsIsoString).toBe('2025-01-01T01:00:00.000Z');
    expect(s.notes?.valueAsString).toBe('note');

    expect(s.trials).toEqual([
      { correct: true, tsEpochMs: 1000 },
      { correct: false, tsEpochMs: 2001 },
    ]);
    expect(s.accuracyPercent).toBe(50);

    const p = s.toPrimitives();
    expect(p.trials).toEqual([
      { correct: true, tsEpochMs: 1000 },
      { correct: false, tsEpochMs: 2001 },
    ]);
    expect(p.accuracyPercent).toBe(50);
  });

  it('rechaza uuids inválidos y finishedAt inválido', () => {
    const r1 = SessionFactory.fromPrimitives({
      slpId: 'bad',
      studentId: STU,
      seed: 1,
    } as any);
    expect(r1.isFailure()).toBe(true);
    expect(r1.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);

    const r2 = SessionFactory.fromPrimitives({
      slpId: SLP,
      studentId: STU,
      seed: 1,
      finishedAt: 'not-a-date',
    } as any);
    expect(r2.isFailure()).toBe(true);
    expect(r2.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });
});

import { Session } from '@domain/entities/session/session.entity';
import { SessionProps } from '@domain/entities/session/session.props';
import { UuidVO, CreatedAtVO } from '@domain/shared/valid-objects';
import { FinishedAtVO } from '@domain/entities/session/validate-objects/finished-at.vo';

function baseProps(): SessionProps {
  return Object.freeze({
    entityId: UuidVO.generate(),
    isActive: true,
    createdAt: CreatedAtVO.now(),
    slpId: UuidVO.generate(),
    studentId: UuidVO.generate(),
    seed: 123,
    trials: [],
  });
}

describe('Session entity', () => {
  it('getters básicos y toPrimitives', () => {
    const props = baseProps();
    const s = new Session(props);
    const p = s.toPrimitives();
    expect(p.id).toBe(s.sessionId.valueAsString);
    expect(p.slpId).toBe(s.slpId.valueAsString);
    expect(p.studentId).toBe(s.studentId.valueAsString);
    expect(p.seed).toBe(123);
    expect(p.trials).toEqual([]);
    expect(p.accuracyPercent).toBe(0);
    expect(Object.isFrozen(p)).toBe(true);
  });

  it('withTrial agrega y trunca epochMs; accuracyPercent', () => {
    const s1 = new Session(baseProps());
    const s2 = s1
      .withTrial(true, 1000.9)
      .withTrial(false, 2000.1)
      .withTrial(true, 3000.5);
    expect(s2.trials).toHaveLength(3);
    expect(s2.trials[0].tsEpochMs).toBe(1000);
    expect(s2.trials[1].tsEpochMs).toBe(2000);
    expect(s2.trials[2].tsEpochMs).toBe(3000);
    expect(s2.accuracyPercent).toBe(Math.round((2 / 3) * 100));
  });

  it('withNotes: normaliza string; vacío lanza; undefined limpia', () => {
    const s1 = new Session(baseProps());
    const s2 = s1.withNotes('  hola  ');
    expect(s2.notes?.valueAsString).toBe('hola');
    expect(() => s2.withNotes('   ')).toThrow();
    const s3 = s2.withNotes(undefined);
    expect(s3.notes).toBeUndefined();
  });

  it('finish: setea finishedAt y lo refleja en primitives', () => {
    const s1 = new Session(baseProps());
    const fa = FinishedAtVO.from(
      '2025-01-01T00:00:00.000Z',
      s1.createdAtVO,
    ).getValue();
    const s2 = s1.finish(fa);
    expect(s2.finishedAt?.valueAsIsoString).toBe('2025-01-01T00:00:00.000Z');

    const p = s2.toPrimitives();
    expect(p.finishedAtIso).toBe('2025-01-01T00:00:00.000Z');
    expect(p.finishedAtEpochMs).toBe(
      new Date('2025-01-01T00:00:00.000Z').getTime(),
    );
  });
});

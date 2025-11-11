import { SessionFactory } from '@domain/entities/session/session.factory';
import { FinishedAtVO } from '@domain/entities/session/validate-objects/finished-at.vo';

const SLP = '550e8400-e29b-41d4-a716-446655440000';
const STU = '550e8400-e29b-41d4-a716-446655440001';

describe('Session flow (int)', () => {
  it('newQuick → withTrial → withNotes → finish → toPrimitives', () => {
    const s0 = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
      notes: ' init ',
    }).getValue();
    const s1 = s0
      .withTrial(true, 1000)
      .withTrial(false, 2000)
      .withNotes(' updated ');
    const fa = FinishedAtVO.from(
      '2025-01-01T00:00:00.000Z',
      s1.createdAtVO,
    ).getValue();
    const s2 = s1.finish(fa);

    const p = s2.toPrimitives();
    expect(p.notes).toBe('updated');
    expect(p.trials).toHaveLength(2);
    expect(p.accuracyPercent).toBe(50);
    expect(p.finishedAtIso).toBe('2025-01-01T00:00:00.000Z');
  });
});

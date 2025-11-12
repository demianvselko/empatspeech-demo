import { mapSessionToView } from '@application/use-cases/sessions/dtos/session.view';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { FinishedAtVO } from '@domain/entities/session/validate-objects/finished-at.vo';

const SLP = '550e8400-e29b-41d4-a716-446655440000';
const STU = '550e8400-e29b-41d4-a716-446655440000';

describe('mapSessionToView', () => {
  it('mapea todos los campos incluyendo trials y accuracy', () => {
    const s = SessionFactory.newQuick({ slpId: SLP, studentId: STU })
      .getValue()
      .withTrial(true, 1730500000000)
      .withTrial(false, 1730500001000);

    const finished = s.finish(
      FinishedAtVO.from(1730500002000, s.createdAtVO).getValue(),
    );
    const view = mapSessionToView(finished);

    expect(view).toEqual(
      expect.objectContaining({
        id: finished.sessionId.valueAsString,
        slpId: finished.slpId.valueAsString,
        studentId: finished.studentId.valueAsString,
        seed: finished.seed,
        notes: finished.notes?.valueAsString,
        accuracyPercent: finished.accuracyPercent,
        totalTrials: finished.trials.length,
        createdAtIso: finished.createdAtVO.valueAsIsoString,
        finishedAtIso: finished.finishedAt?.valueAsIsoString,
      }),
    );
    expect(view.trials).toHaveLength(2);
    expect(Object.isFrozen(view)).toBe(true);
  });
});

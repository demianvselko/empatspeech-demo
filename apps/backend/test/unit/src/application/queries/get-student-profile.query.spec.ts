import { GetStudentProfileUC } from '@application/queries/get-student-profile.query';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { Result } from '@domain/shared/result/result';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

// mocks compartidos
import {
  fixedClock,
  makeSessionRepoMock,
  makeRepoError,
} from '../../../../setup/mocks';

const SLP = '550e8400-e29b-41d4-a716-446655440000';
const STU = '550e8400-e29b-41d4-a716-446655440000';

describe('GetStudentProfileUC', () => {
  it('devuelve sesiones mapeadas y overallAccuracy calculado', async () => {
    const sessionsRepo = makeSessionRepoMock();

    const s1 = SessionFactory.newQuick({ slpId: SLP, studentId: STU })
      .getValue()
      .withTrial(true, fixedClock.nowEpochMs())
      .withTrial(false, fixedClock.nowEpochMs());
    const s2 = SessionFactory.newQuick({ slpId: SLP, studentId: STU })
      .getValue()
      .withTrial(true, fixedClock.nowEpochMs());

    sessionsRepo.listByStudent.mockResolvedValue(Result.ok([s1, s2]));

    const uc = new GetStudentProfileUC(sessionsRepo);
    const out = await uc.execute({ studentId: STU, limit: 5 });

    expect(out.isSuccess()).toBe(true);
    const v = out.getValue();

    expect(v.studentId).toBe(STU);
    expect(v.sessions).toHaveLength(2);
    expect(v.sessions[0]).toEqual(
      expect.objectContaining({
        id: s1.sessionId.valueAsString,
        createdAtIso: s1.createdAtVO.valueAsIsoString,
        accuracyPercent: s1.accuracyPercent,
        totalTrials: s1.trials.length,
      }),
    );
    expect(v.totalTrials).toBe(3);
    expect(v.overallAccuracyPercent).toBe(67);
  });

  it('falla con UUID inválido', async () => {
    const sessionsRepo = makeSessionRepoMock();
    const uc = new GetStudentProfileUC(sessionsRepo);

    const out = await uc.execute({ studentId: 'bad-uuid' });
    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('propaga errores del repositorio', async () => {
    const sessionsRepo = makeSessionRepoMock();
    sessionsRepo.listByStudent.mockResolvedValue(
      Result.fail([makeRepoError('REPO_ERR')]),
    );

    const uc = new GetStudentProfileUC(sessionsRepo);
    const out = await uc.execute({ studentId: STU });

    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe('REPO_ERR');
  });
});

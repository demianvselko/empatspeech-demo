import { ListCaseloadUC } from '@application/queries/list-caseload.query';
import { StudentFactory } from '@domain/entities/user/student/student.factory';
import { Result } from '@domain/shared/result/result';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

import { makeUserRepoMock, makeRepoError } from '../../../../setup/mocks';

const SLP = '550e8400-e29b-41d4-a716-446655440000';

describe('ListCaseloadUC', () => {
  it('mapea estudiantes del repositorio', async () => {
    const usersRepo = makeUserRepoMock();

    const st1 = StudentFactory.newQuick({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@ex.com',
    }).getValue();
    const st2 = StudentFactory.newQuick({
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@ex.com',
    }).getValue();

    usersRepo.findStudentsBySlp.mockResolvedValue(Result.ok([st1, st2]));

    const uc = new ListCaseloadUC(usersRepo);
    const out = await uc.execute({ slpId: SLP });

    expect(out.isSuccess()).toBe(true);
    const list = out.getValue();
    expect(list).toHaveLength(2);
    expect(list[0]).toEqual(
      expect.objectContaining({
        id: st1.userId.valueAsString,
        fullName: st1.fullName,
        email: st1.email.valueAsString,
        active: st1.isActiveUser,
      }),
    );
  });

  it('falla con UUID inválido', async () => {
    const usersRepo = makeUserRepoMock();
    const uc = new ListCaseloadUC(usersRepo);

    const out = await uc.execute({ slpId: 'not-uuid' });
    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('propaga error del repositorio', async () => {
    const usersRepo = makeUserRepoMock();
    usersRepo.findStudentsBySlp.mockResolvedValue(
      Result.fail([makeRepoError('USER_REPO_ERR')]),
    );

    const uc = new ListCaseloadUC(usersRepo);
    const out = await uc.execute({ slpId: SLP });

    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe('USER_REPO_ERR');
  });
});

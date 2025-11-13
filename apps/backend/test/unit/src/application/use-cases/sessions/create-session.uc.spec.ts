import { CreateSessionUC } from '@application/use-cases/sessions/create-session.uc';
import { Result } from '@domain/shared/result/result';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

// mocks compartidos
import {
  makeSessionRepoMock,
  okVoid,
  makeRepoError,
} from '../../../../../setup/mocks';

const SLP = '550e8400-e29b-41d4-a716-446655440000';
const STU = '550e8400-e29b-41d4-a716-446655440001';

describe('CreateSessionUC', () => {
  it('crea y guarda una sesión', async () => {
    const sessions = makeSessionRepoMock();
    sessions.save.mockResolvedValue(okVoid());

    const uc = new CreateSessionUC(sessions);
    const out = await uc.execute({ slpId: SLP, studentId: STU, notes: ' hi ' });

    expect(out.isSuccess()).toBe(true);
    const v = out.getValue();
    expect(v.sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(typeof v.seed).toBe('number');
    expect(typeof v.createdAtIso).toBe('string');
    expect(sessions.save).toHaveBeenCalled();
  });

  it('falla si ids inválidos', async () => {
    const sessions = makeSessionRepoMock();
    const uc = new CreateSessionUC(sessions);
    const out = await uc.execute({ slpId: 'bad', studentId: STU });

    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('propaga error al guardar', async () => {
    const sessions = makeSessionRepoMock();
    sessions.save.mockResolvedValue(Result.fail([makeRepoError('SAVE_ERR')]));

    const uc = new CreateSessionUC(sessions);
    const out = await uc.execute({ slpId: SLP, studentId: STU });

    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe('SAVE_ERR');
  });
});

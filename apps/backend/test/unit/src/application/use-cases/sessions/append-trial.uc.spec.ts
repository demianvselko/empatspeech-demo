import { AppendTrialUC } from '@application/use-cases/sessions/append-trial.uc';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { Result } from '@domain/shared/result/result';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';
import { SessionNotFoundError } from '@domain/entities/session/errors/session.errors';

import {
  fixedClock,
  makeSessionRepoMock,
  okVoid,
} from '../../../../../setup/mocks';

const SLP = '550e8400-e29b-41d4-a716-446655440000';
const STU = '550e8400-e29b-41d4-a716-446655440000';

describe('AppendTrialUC', () => {
  it('agrega trial y guarda', async () => {
    const sessions = makeSessionRepoMock();
    const base = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
    }).getValue();

    sessions.findById.mockResolvedValue(Result.ok(base));
    sessions.save.mockResolvedValue(okVoid());

    const uc = new AppendTrialUC(sessions, fixedClock);
    const out = await uc.execute({
      sessionId: base.sessionId.valueAsString,
      correct: true,
    });

    expect(out.isSuccess()).toBe(true);
    const v = out.getValue();
    expect(v.sessionId).toBe(base.sessionId.valueAsString);
    expect(v.totalTrials).toBe(1);
    expect(typeof v.accuracyPercent).toBe('number');
  });

  it('falla si sessionId inválido', async () => {
    const sessions = makeSessionRepoMock();
    const uc = new AppendTrialUC(sessions, fixedClock);
    const out = await uc.execute({ sessionId: 'bad', correct: false });
    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('falla si no encontrada', async () => {
    const sessions = makeSessionRepoMock();
    sessions.findById.mockResolvedValue(Result.ok(null));

    const uc = new AppendTrialUC(sessions, fixedClock);
    const out = await uc.execute({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      correct: true,
    });

    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0]).toBeInstanceOf(SessionNotFoundError);
  });
});

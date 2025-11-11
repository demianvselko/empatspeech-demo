import { FinishSessionUC } from '@application/use-cases/sessions/finish-session.uc';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { Result } from '@domain/shared/result/result';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';
import {
  SessionAlreadyFinishedError,
  SessionNotFoundError,
} from '@domain/entities/session/errors/session.errors';
import { FinishedAtVO } from '@domain/entities/session/validate-objects/finished-at.vo';

import {
  fixedClock,
  makeSessionRepoMock,
  okVoid,
} from '../../../../../setup/mocks';

const SLP = '550e8400-e29b-41d4-a716-446655440000';
const STU = '550e8400-e29b-41d4-a716-446655440000';

describe('FinishSessionUC', () => {
  it('finaliza sesión y guarda', async () => {
    const sessions = makeSessionRepoMock();
    const base = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
    }).getValue();

    sessions.findById.mockResolvedValue(Result.ok(base));
    sessions.save.mockResolvedValue(okVoid());

    const uc = new FinishSessionUC(sessions, fixedClock);
    const out = await uc.execute({ sessionId: base.sessionId.valueAsString });

    expect(out.isSuccess()).toBe(true);
    const v = out.getValue();
    expect(v.sessionId).toBe(base.sessionId.valueAsString);
    expect(typeof v.finishedAtIso).toBe('string');
  });

  it('falla si sessionId inválido', async () => {
    const uc = new FinishSessionUC(makeSessionRepoMock(), fixedClock);
    const out = await uc.execute({ sessionId: 'bad' });
    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('falla si no encontrada', async () => {
    const sessions = makeSessionRepoMock();
    sessions.findById.mockResolvedValue(Result.ok(null));

    const uc = new FinishSessionUC(sessions, fixedClock);
    const out = await uc.execute({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0]).toBeInstanceOf(SessionNotFoundError);
  });

  it('falla si ya finalizada', async () => {
    const sessions = makeSessionRepoMock();
    const base = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
    }).getValue();
    const finished = base.finish(
      FinishedAtVO.from(Date.now(), base.createdAtVO).getValue(),
    );

    sessions.findById.mockResolvedValue(Result.ok(finished));

    const uc = new FinishSessionUC(sessions, fixedClock);
    const out = await uc.execute({
      sessionId: finished.sessionId.valueAsString,
    });

    expect(out.isFailure()).toBe(true);
    expect(out.getErrors()[0]).toBeInstanceOf(SessionAlreadyFinishedError);
  });
});

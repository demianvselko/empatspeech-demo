import { SessionsController } from '@interfaces/http/sessions.controller';
import { makeUc, ucOk, FIXED_EPOCH } from '../../../../setup/mocks';

describe('SessionsController', () => {
  const createUC = makeUc<
    unknown,
    { sessionId: string; seed: number; createdAtIso: string }
  >();
  const appendUC = makeUc<
    unknown,
    { sessionId: string; totalTrials: number; accuracyPercent: number }
  >();
  const finishUC = makeUc<
    unknown,
    { sessionId: string; finishedAtIso: string }
  >();
  const patchUC = makeUc<unknown, { sessionId: string; notes?: string }>();

  const ctrl = new SessionsController(
    // @ts-expect-error types align at call-time
    createUC,
    appendUC,
    finishUC,
    patchUC,
  );

  beforeEach(() => {
    createUC.execute.mockReset();
    appendUC.execute.mockReset();
    finishUC.execute.mockReset();
    patchUC.execute.mockReset();
  });

  it('addTrial: pasa id y body.correct', async () => {
    appendUC.execute.mockResolvedValueOnce(
      ucOk({ sessionId: 'S1', totalTrials: 1, accuracyPercent: 100 }),
    );
    const r = await ctrl.addTrial('S1', { correct: true });
    expect(appendUC.execute).toHaveBeenCalledWith({
      sessionId: 'S1',
      correct: true,
    });
    expect(r.totalTrials).toBe(1);
  });

  it('finish: unwrap ok', async () => {
    finishUC.execute.mockResolvedValueOnce(
      ucOk({
        sessionId: 'S1',
        finishedAtIso: new Date(FIXED_EPOCH).toISOString(),
      }),
    );
    const r = await ctrl.finish('S1');
    expect(finishUC.execute).toHaveBeenCalledWith({ sessionId: 'S1' });
    expect(r.sessionId).toBe('S1');
  });

  it('updateNotes: unwrap ok', async () => {
    patchUC.execute.mockResolvedValueOnce(
      ucOk({ sessionId: 'S1', notes: 'hi' }),
    );
    const r = await ctrl.updateNotes('S1', { notes: 'hi' });
    expect(patchUC.execute).toHaveBeenCalledWith({
      sessionId: 'S1',
      notes: 'hi',
    });
    expect(r.notes).toBe('hi');
  });
});

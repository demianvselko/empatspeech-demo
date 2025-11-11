import {
  SameParticipantError,
  SessionAlreadyFinishedError,
  InvalidTrialError,
  InvalidSeedError,
} from '@domain/entities/session/errors/session.errors';
import { SessionAlreadyEndedError } from '@domain/entities/session/errors/session-already-ended.error';

describe('Session Domain Errors', () => {
  it('SameParticipantError', () => {
    const err = new SameParticipantError('slp', 'stu');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('SameParticipantError');
    expect(err.code).toBe('SESSION_SAME_PARTICIPANT');
    expect(err.message).toBe('SLP and Student must be different users');
  });

  it('SessionAlreadyFinishedError', () => {
    const err = new SessionAlreadyFinishedError('sess-1');
    expect(err.code).toBe('SESSION_ALREADY_FINISHED');
    expect(err.message).toBe('Session is already finished');
  });

  it('InvalidTrialError', () => {
    const err = new InvalidTrialError('bad ts');
    expect(err.code).toBe('SESSION_INVALID_TRIAL');
    expect(err.message).toBe('Invalid trial: bad ts');
  });

  it('InvalidSeedError', () => {
    const err = new InvalidSeedError(-1);
    expect(err.code).toBe('SESSION_INVALID_SEED');
    expect(err.message).toBe(
      'Seed must be a finite integer >= 0. Received: -1',
    );
  });

  it('SessionAlreadyEndedError', () => {
    const err = new SessionAlreadyEndedError();
    expect(err.code).toBe('SESSION_ALREADY_ENDED');
    expect(err.message).toBe('Session has already ended');
  });
});

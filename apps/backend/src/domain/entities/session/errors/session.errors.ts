import { DomainError } from '@domain/shared/error/domain-error.base';
export class SameParticipantError extends DomainError {
  constructor(
    public readonly slpId: string,
    public readonly studentId: string,
  ) {
    super(
      'SLP and Student must be different users',
      'SESSION_SAME_PARTICIPANT',
    );
  }
}

export class SessionAlreadyFinishedError extends DomainError {
  constructor(sessionId: string) {
    super(
      `Session ${sessionId} is already finished`,
      'SESSION_ALREADY_FINISHED',
    );
  }
}

export class InvalidTrialError extends DomainError {
  constructor(reason: string) {
    super(`Invalid trial: ${reason}`, 'SESSION_INVALID_TRIAL');
  }
}
export class SessionNotFoundError extends DomainError {
  constructor(sessionId: string) {
    super(`Session not found ${sessionId}`, 'SESSION_NOT_FOUND');
  }
}

export class InvalidSeedError extends DomainError {
  constructor(seed: number) {
    super(
      `Seed must be a finite integer >= 0. Received: ${seed}`,
      'SESSION_INVALID_SEED',
    );
  }
}

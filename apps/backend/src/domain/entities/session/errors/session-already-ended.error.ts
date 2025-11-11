import { DomainError } from '@domain/shared/error/domain-error.base';

export class SessionAlreadyEndedError extends DomainError {
  constructor() {
    super('Session has already ended', 'SESSION_ALREADY_ENDED');
  }
}

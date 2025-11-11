import { DomainError } from '@domain/shared/error/domain-error.base';

export class UserRoleMismatchError extends DomainError {
  constructor(expected: string, received: string) {
    super(
      `Expected role ${expected} but got ${received}`,
      'USER_ROLE_MISMATCH',
    );
  }
}

import { UserRoleMismatchError } from '@domain/entities/user/errors/user.errors';

describe('UserRoleMismatchError', () => {
  it('setea message, code y name correctamente', () => {
    const err = new UserRoleMismatchError('Teacher', 'Student');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('UserRoleMismatchError');
    expect(err.code).toBe('USER_ROLE_MISMATCH');
    expect(err.message).toBe('Expected role Teacher but got Student');
  });
});

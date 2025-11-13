import { Teacher } from '@domain/entities/user/teacher/teacher.entity';
import { UserRole } from '@domain/entities/user/user-role.enum';
import { UserRoleMismatchError } from '@domain/entities/user/errors/user.errors';
import { makeUserProps } from '../_helpers';

describe('Teacher.create', () => {
  it('crea Teacher cuando role = Teacher', () => {
    const props = makeUserProps(UserRole.Teacher);
    const r = Teacher.create(props);
    expect(r.isSuccess()).toBe(true);

    const t = r.getValue();
    expect(t.role).toBe(UserRole.Teacher);
    expect(t.fullName).toBe('Demi Vselko');

    const prim = t.toPrimitives();
    expect(prim.role).toBe(UserRole.Teacher);
    expect(prim.email).toBe('demi.vselko@example.com');
    expect(Object.isFrozen(prim)).toBe(true);
  });

  it('falla con USER_ROLE_MISMATCH cuando role != Teacher', () => {
    const props = makeUserProps(UserRole.Student);
    const r = Teacher.create(props);
    expect(r.isFailure()).toBe(true);
    const [err] = r.getErrors();
    expect(err).toBeInstanceOf(UserRoleMismatchError);
    expect(err.code).toBe('USER_ROLE_MISMATCH');
    expect(err.message).toBe('Expected role Teacher but got Student');
  });
});

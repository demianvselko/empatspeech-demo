import { Student } from '@domain/entities/user/student/student.entity';
import { UserRole } from '@domain/entities/user/user-role.enum';
import { makeUserProps } from '../_helpers';
import { UserRoleMismatchError } from '@domain/entities/user/errors/user.errors';

describe('Student.create', () => {
  it('crea Student cuando role = Student', () => {
    const props = makeUserProps(UserRole.Student);
    const r = Student.create(props);
    expect(r.isSuccess()).toBe(true);

    const s = r.getValue();
    expect(s.role).toBe(UserRole.Student);
    expect(s.fullName).toBe('Demi Vselko');

    const prim = s.toPrimitives();
    expect(prim.role).toBe(UserRole.Student);
    expect(prim.firstName).toBe('Demi');
    expect(prim.lastName).toBe('Vselko');
    expect(Object.isFrozen(prim)).toBe(true);
  });

  it('falla con USER_ROLE_MISMATCH cuando role != Student', () => {
    const props = makeUserProps(UserRole.Teacher);
    const r = Student.create(props);
    expect(r.isFailure()).toBe(true);
    const [err] = r.getErrors();
    expect(err).toBeInstanceOf(UserRoleMismatchError);
    expect(err.code).toBe('USER_ROLE_MISMATCH');
    expect(err.message).toBe('Expected role Student but got Teacher');
  });
});

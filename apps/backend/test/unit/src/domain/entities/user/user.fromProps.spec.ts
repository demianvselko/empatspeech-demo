/* eslint-disable  @typescript-eslint/no-explicit-any */
import { UserFactory } from '@domain/entities/user/user.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';
import { basePropsFactory } from '@domain/base/base-props.factory';
import { EmailVO, StringVO } from '@domain/shared/valid-objects';

describe('UserFactory.fromProps', () => {
  it('crea User desde props ya validados e inmutables', () => {
    const baseR = basePropsFactory();
    expect(baseR.isSuccess()).toBe(true);
    const base = baseR.getValue();

    const first = StringVO.from('  Marie  ', {
      fieldName: 'firstName',
      trim: true,
    }).getValue();
    const last = StringVO.from(' Curie ', {
      fieldName: 'lastName',
      trim: true,
    }).getValue();
    const email = EmailVO.fromString('marie.curie@EXAMPLE.com').getValue();

    const props = Object.freeze({
      ...base,
      firstName: first,
      lastName: last,
      email,
      role: UserRole.Teacher,
    });

    const r = UserFactory.fromProps(props as any);
    expect(r.isSuccess()).toBe(true);

    const u = r.getValue();
    expect(Object.isFrozen(u.toPrimitives())).toBe(true);
    expect(u.firstName.valueAsString).toBe('Marie');
    expect(u.lastName.valueAsString).toBe('Curie');
    expect(u.email.valueAsString).toBe('marie.curie@example.com');
    expect(u.role).toBe(UserRole.Teacher);
  });
});

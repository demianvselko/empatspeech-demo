import { UserFactory } from '@domain/entities/user/user.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';

describe('UserFactory', () => {
  it('crea un usuario válido desde primitivos', () => {
    const res = UserFactory.fromPrimitives({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      role: UserRole.Teacher,
    });
    expect(res.isSuccess()).toBe(true);
    const user = res.getValue();
    expect(user.fullName).toBe('John Doe');
    expect(user.role).toBe(UserRole.Teacher);
  });

  it('falla con email inválido', () => {
    const res = UserFactory.fromPrimitives({
      firstName: 'John',
      lastName: 'Doe',
      email: 'bad',
      role: UserRole.Student,
    });
    expect(res.isFailure()).toBe(true);
  });
});

import { UserFactory } from '@domain/entities/user/user.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';

describe('UserFactory.newQuick', () => {
  it('crea User con baseProps por defecto', () => {
    const r = UserFactory.newQuick({
      firstName: ' Linus ',
      lastName: ' Torvalds',
      email: 'LINUS@EXAMPLE.COM',
      role: UserRole.Teacher,
    });

    expect(r.isSuccess()).toBe(true);
    const u = r.getValue();

    // base props generados
    expect(u.userId.valueAsString).toMatch(/^[0-9a-f-]{36}$/i);
    expect(u.isActiveUser).toBe(true);
    expect(typeof u.createdAtValue.valueAsEpochMs).toBe('number');

    // normalizaciones/validaciones
    expect(u.firstName.valueAsString).toBe('Linus');
    expect(u.lastName.valueAsString).toBe('Torvalds');
    expect(u.email.valueAsString).toBe('linus@example.com');
    expect(u.role).toBe(UserRole.Teacher);
    expect(u.fullName).toBe('Linus Torvalds');
  });
});

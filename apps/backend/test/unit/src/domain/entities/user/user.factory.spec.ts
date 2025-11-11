import { UserFactory } from '@domain/entities/user/user.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';

describe('UserFactory.fromPrimitives (happy path)', () => {
  it('crea User válido desde primitivas con id explícito', () => {
    const r = UserFactory.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440000',
      active: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'Ada.Lovelace@Example.COM',
      role: UserRole.Teacher,
    });

    expect(r.isSuccess()).toBe(true);
    const user = r.getValue();

    expect(user.userId.valueAsString).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(user.isActiveUser).toBe(false);
    expect(user.createdAtValue.valueAsIsoString).toBe(
      '2025-01-01T00:00:00.000Z',
    );
    expect(user.firstName.valueAsString).toBe('Ada');
    expect(user.lastName.valueAsString).toBe('Lovelace');
    expect(user.email.valueAsString).toBe('ada.lovelace@example.com');
    expect(user.role).toBe(UserRole.Teacher);
    expect(user.fullName).toBe('Ada Lovelace');

    const prim = user.toPrimitives();
    expect(Object.isFrozen(prim)).toBe(true);
    expect(prim).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      active: false,
      createdAtIso: '2025-01-01T00:00:00.000Z',
      createdAtEpochMs: new Date('2025-01-01T00:00:00.000Z').getTime(),
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada.lovelace@example.com',
      role: UserRole.Teacher,
    });
  });

  it('crea User válido desde primitivas usando defaults (id/createdAt/active)', () => {
    const r = UserFactory.fromPrimitives({
      firstName: '  Grace  ',
      lastName: '  Hopper',
      email: 'grace.hopper@example.com',
      role: UserRole.Student,
    });

    expect(r.isSuccess()).toBe(true);
    const user = r.getValue();

    expect(user.userId.valueAsString).toMatch(/^[0-9a-f-]{36}$/i);
    expect(typeof user.createdAtValue.valueAsEpochMs).toBe('number');
    expect(user.isActiveUser).toBe(true);

    expect(user.firstName.valueAsString).toBe('Grace');
    expect(user.lastName.valueAsString).toBe('Hopper');
    expect(user.role).toBe(UserRole.Student);
  });
});

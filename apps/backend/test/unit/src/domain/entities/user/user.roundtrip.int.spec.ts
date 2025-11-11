import { UserFactory } from '@domain/entities/user/user.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';

describe('User round-trip primitives → entity → primitives', () => {
  it('mantiene consistencia en los campos (salvo normalizaciones esperadas)', () => {
    const dto = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      active: true,
      createdAt: '2025-01-02T03:04:05.000Z',
      firstName: '  Alan ',
      lastName: '  Turing ',
      email: 'ALAN.TURING@EXAMPLE.COM',
      role: UserRole.Student,
    };

    const r = UserFactory.fromPrimitives(dto);
    expect(r.isSuccess()).toBe(true);

    const entity = r.getValue();
    const back = entity.toPrimitives();

    expect(back).toEqual({
      id: dto.id,
      active: true,
      createdAtIso: '2025-01-02T03:04:05.000Z',
      createdAtEpochMs: new Date('2025-01-02T03:04:05.000Z').getTime(),
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan.turing@example.com',
      role: UserRole.Student,
    });
  });
});

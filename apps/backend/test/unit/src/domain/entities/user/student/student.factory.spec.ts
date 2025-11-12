import { StudentFactory } from '@domain/entities/user/student/student.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';
import { UuidVO } from '@domain/shared/valid-objects';

const FIXED_ID = UuidVO.generate().valueAsString;

describe('StudentFactory', () => {
  it('fromPrimitives: crea Student válido', () => {
    const r = StudentFactory.fromPrimitives({
      id: FIXED_ID,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@ex.com',
      role: UserRole.Student,
    });
    expect(r.isSuccess()).toBe(true);
    const s = r.getValue();
    const p = s.toPrimitives();
    expect(p.id).toBe(FIXED_ID);
    expect(p.firstName).toBe('Ada');
    expect(p.lastName).toBe('Lovelace');
    expect(p.email).toBe('ada@ex.com');
    expect(p.role).toBe(UserRole.Student);
  });

  it('fromPrimitives: falla si role !== Student', () => {
    const r = StudentFactory.fromPrimitives({
      id: FIXED_ID,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@ex.com',
      role: UserRole.Teacher,
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe('USER_ROLE_MISMATCH');
  });

  it('fromPrimitives: propaga error de UserFactory (email inválido)', () => {
    const r = StudentFactory.fromPrimitives({
      id: FIXED_ID,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'not-an-email',
      role: UserRole.Student,
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('newQuick: crea Student con role forzado', () => {
    const r = StudentFactory.newQuick({
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@ex.com',
    });
    expect(r.isSuccess()).toBe(true);
    const s = r.getValue();
    const p = s.toPrimitives();
    expect(p.role).toBe(UserRole.Student);
    expect(p.firstName).toBe('Grace');
    expect(p.lastName).toBe('Hopper');
    expect(p.email).toBe('grace@ex.com');
  });

  it('newQuick: propaga error de UserFactory (email inválido)', () => {
    const r = StudentFactory.newQuick({
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'bad',
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });
});

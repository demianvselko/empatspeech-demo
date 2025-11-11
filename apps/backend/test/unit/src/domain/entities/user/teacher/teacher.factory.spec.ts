import { TeacherFactory } from '@domain/entities/user/teacher/teacher.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';
import { UuidVO } from '@domain/shared/valid-objects';

const FIXED_ID = UuidVO.generate().valueAsString;

describe('TeacherFactory', () => {
  it('fromPrimitives: crea Teacher válido', () => {
    const r = TeacherFactory.fromPrimitives({
      id: FIXED_ID,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@ex.com',
      role: UserRole.Teacher,
    });
    expect(r.isSuccess()).toBe(true);
    const t = r.getValue();
    const p = t.toPrimitives();
    expect(p.id).toBe(FIXED_ID);
    expect(p.firstName).toBe('Alan');
    expect(p.lastName).toBe('Turing');
    expect(p.email).toBe('alan@ex.com');
    expect(p.role).toBe(UserRole.Teacher);
  });

  it('fromPrimitives: falla si role !== Teacher', () => {
    const r = TeacherFactory.fromPrimitives({
      id: FIXED_ID,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@ex.com',
      role: UserRole.Student,
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe('USER_ROLE_MISMATCH');
  });

  it('fromPrimitives: propaga error de UserFactory (email inválido)', () => {
    const r = TeacherFactory.fromPrimitives({
      id: FIXED_ID,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'invalid',
      role: UserRole.Teacher,
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('newQuick: crea Teacher con role forzado', () => {
    const r = TeacherFactory.newQuick({
      firstName: 'Barbara',
      lastName: 'Liskov',
      email: 'barbara@ex.com',
    });
    expect(r.isSuccess()).toBe(true);
    const t = r.getValue();
    const p = t.toPrimitives();
    expect(p.role).toBe(UserRole.Teacher);
    expect(p.firstName).toBe('Barbara');
    expect(p.lastName).toBe('Liskov');
    expect(p.email).toBe('barbara@ex.com');
  });

  it('newQuick: propaga error de UserFactory (email inválido)', () => {
    const r = TeacherFactory.newQuick({
      firstName: 'Barbara',
      lastName: 'Liskov',
      email: 'nope',
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });
});

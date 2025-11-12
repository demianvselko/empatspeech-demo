import { UserFactory } from '@domain/entities/user/user.factory';
import { UserRole } from '@domain/entities/user/user-role.enum';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('UserFactory errores de validación', () => {
  it('falla si firstName vacío o menor a min', () => {
    const r1 = UserFactory.fromPrimitives({
      firstName: '   ',
      lastName: 'Valid',
      email: 'valid@example.com',
      role: UserRole.Student,
    });
    expect(r1.isFailure()).toBe(true);
    expect(r1.getErrors()[0].code).toBe(ValidationErrorCode.EMPTY);

    const r2 = UserFactory.fromPrimitives({
      firstName: '',
      lastName: 'Valid',
      email: 'valid@example.com',
      role: UserRole.Student,
    });
    expect(r2.isFailure()).toBe(true);
    expect(r2.getErrors()[0].code).toBe(ValidationErrorCode.EMPTY);
  });

  it('falla si lastName vacío', () => {
    const r = UserFactory.fromPrimitives({
      firstName: 'Valid',
      lastName: '   ',
      email: 'valid@example.com',
      role: UserRole.Student,
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.EMPTY);
  });

  it('falla si email inválido', () => {
    const r = UserFactory.fromPrimitives({
      firstName: 'Valid',
      lastName: 'User',
      email: 'not-an-email',
      role: UserRole.Teacher,
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('falla si id inválido (uuid)', () => {
    const r = UserFactory.fromPrimitives({
      id: 'bad-uuid',
      firstName: 'Valid',
      lastName: 'User',
      email: 'valid@example.com',
      role: UserRole.Teacher,
    });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });
});

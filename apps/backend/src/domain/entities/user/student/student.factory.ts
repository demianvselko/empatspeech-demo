import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { Student } from './student.entity';
import { UserFactory } from '../user.factory';
import { UserRole } from '../user-role.enum';
import { UserProps, UserPrimitives } from '../user.props';
import { UserRoleMismatchError } from '../errors/user.errors';

export class StudentFactory {
  static fromPrimitives(dto: UserPrimitives): Result<Student, BaseError> {
    if (dto.role !== UserRole.Student) {
      return Result.fail(new UserRoleMismatchError(UserRole.Student, dto.role));
    }

    const baseRes = UserFactory.fromPrimitives(dto);
    if (baseRes.isFailure()) return Result.fail(baseRes.getErrors());

    const base = baseRes.getValue();
    return Student.create(base['props'] as UserProps);
  }

  static newQuick(input: {
    firstName: string;
    lastName: string;
    email: string;
  }): Result<Student, BaseError> {
    const baseRes = UserFactory.newQuick({
      ...input,
      role: UserRole.Student,
    });
    if (baseRes.isFailure()) return Result.fail(baseRes.getErrors());
    const u = baseRes.getValue().toPrimitives();
    const propsRes = UserFactory.buildPropsFromPrimitives({
      id: u.id,
      active: u.active,
      createdAt: u.createdAtIso,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: UserRole.Student,
    });
    if (propsRes.isFailure()) return Result.fail(propsRes.getErrors());
    return Student.create(propsRes.getValue());
  }
}

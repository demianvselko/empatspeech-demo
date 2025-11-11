import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { Teacher } from './teacher.entity';
import { UserFactory } from '../user.factory';
import { UserRole } from '../user-role.enum';
import { UserProps, UserPrimitives } from '../user.props';
import { UserRoleMismatchError } from '../errors/user.errors';

export class TeacherFactory {
  static fromPrimitives(dto: UserPrimitives): Result<Teacher, BaseError> {
    if (dto.role !== UserRole.Teacher) {
      return Result.fail(new UserRoleMismatchError(UserRole.Teacher, dto.role));
    }

    const baseRes = UserFactory.fromPrimitives(dto);
    if (baseRes.isFailure()) return Result.fail(baseRes.getErrors());

    const base = baseRes.getValue();
    return Teacher.create(base['props'] as UserProps);
  }

  static newQuick(input: {
    firstName: string;
    lastName: string;
    email: string;
  }): Result<Teacher, BaseError> {
    const baseRes = UserFactory.newQuick({
      ...input,
      role: UserRole.Teacher,
    });
    if (baseRes.isFailure()) return Result.fail(baseRes.getErrors());
    const base = baseRes.getValue();

    return Teacher.create(base['props'] as UserProps);
  }
}

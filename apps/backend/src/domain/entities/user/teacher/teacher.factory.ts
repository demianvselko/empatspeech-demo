import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { Teacher } from './teacher.entity';
import { UserFactory } from '../user.factory';
import { UserRole } from '../user-role.enum';
import { UserPrimitives } from '../user.props';
import { UserRoleMismatchError } from '../errors/user.errors';

export class TeacherFactory {
  static fromPrimitives(dto: UserPrimitives): Result<Teacher, BaseError> {
    if (dto.role !== UserRole.Teacher) {
      return Result.fail(new UserRoleMismatchError(UserRole.Teacher, dto.role));
    }
    const propsRes = UserFactory.buildPropsFromPrimitives(dto);
    if (propsRes.isFailure()) return Result.fail(propsRes.getErrors());
    return Teacher.create(propsRes.getValue());
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
    const u = baseRes.getValue().toPrimitives();
    const propsRes = UserFactory.buildPropsFromPrimitives({
      id: u.id,
      active: u.active,
      createdAt: u.createdAtIso,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: UserRole.Teacher,
    });
    if (propsRes.isFailure()) return Result.fail(propsRes.getErrors());
    return Teacher.create(propsRes.getValue());
  }
}

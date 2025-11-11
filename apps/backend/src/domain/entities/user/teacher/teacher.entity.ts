import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { UserProps } from '../user.props';
import { User } from '../user.abstract';
import { UserRoleMismatchError } from '../errors/user.errors';
import { UserRole } from '../user-role.enum';

export class Teacher extends User {
  private constructor(props: UserProps) {
    super(props);
  }

  static create(props: UserProps): Result<Teacher, BaseError> {
    if (props.role !== UserRole.Teacher) {
      return Result.fail(
        new UserRoleMismatchError(UserRole.Teacher, props.role),
      );
    }
    return Result.ok(new Teacher(props));
  }
}

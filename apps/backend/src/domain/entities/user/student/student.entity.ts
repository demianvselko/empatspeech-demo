import { User } from '../user.abstract';
import { UserProps } from '../user.props';
import { UserRole } from '../user-role.enum';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { UserRoleMismatchError } from '../errors/user.errors';

export class Student extends User {
  private constructor(props: UserProps) {
    super(props);
  }

  static create(props: UserProps): Result<Student, BaseError> {
    if (props.role !== UserRole.Student) {
      return Result.fail(
        new UserRoleMismatchError(UserRole.Student, props.role),
      );
    }
    return Result.ok(new Student(props));
  }
}

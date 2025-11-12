import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import {
  basePropsFactory,
  basePropsFromPrimitives,
} from '@domain/base/base-props.factory';

import { User } from './user.abstract';
import { UserProps, UserPrimitives } from './user.props';
import { EmailVO, StringVO } from '@domain/shared/valid-objects';

class UserBase extends User {
  private constructor(props: UserProps) {
    super(props);
  }

  static create(props: UserProps): Result<UserBase, BaseError> {
    return Result.ok(new UserBase(props));
  }
}

export class UserFactory {
  static fromProps(props: UserProps): Result<User, BaseError> {
    return UserBase.create(props);
  }

  static fromPrimitives(dto: UserPrimitives): Result<User, BaseError> {
    const baseRes = basePropsFromPrimitives({
      entityId: dto.id,
      isActive: dto.active,
      createdAt: dto.createdAt,
    });
    if (baseRes.isFailure()) return Result.fail(baseRes.getErrors());
    const base = baseRes.getValue();

    const firstRes = StringVO.from(dto.firstName, {
      fieldName: 'firstName',
      minLength: 1,
      maxLength: 100,
      trim: true,
    });
    if (firstRes.isFailure()) return Result.fail(firstRes.getErrors());

    const lastRes = StringVO.from(dto.lastName, {
      fieldName: 'lastName',
      minLength: 1,
      maxLength: 150,
      trim: true,
    });
    if (lastRes.isFailure()) return Result.fail(lastRes.getErrors());

    const emailRes = EmailVO.fromString(dto.email);
    if (emailRes.isFailure()) return Result.fail(emailRes.getErrors());

    const props: UserProps = Object.freeze({
      ...base,
      firstName: firstRes.getValue(),
      lastName: lastRes.getValue(),
      email: emailRes.getValue(),
      role: dto.role,
    });

    return UserBase.create(props);
  }

  static newQuick(input: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserProps['role'];
  }): Result<User, BaseError> {
    const baseRes = basePropsFactory();
    if (baseRes.isFailure()) return Result.fail(baseRes.getErrors());

    const firstRes = StringVO.from(input.firstName, {
      fieldName: 'firstName',
      minLength: 1,
      maxLength: 100,
      trim: true,
    });
    if (firstRes.isFailure()) return Result.fail(firstRes.getErrors());

    const lastRes = StringVO.from(input.lastName, {
      fieldName: 'lastName',
      minLength: 1,
      maxLength: 150,
      trim: true,
    });
    if (lastRes.isFailure()) return Result.fail(lastRes.getErrors());

    const emailRes = EmailVO.fromString(input.email);
    if (emailRes.isFailure()) return Result.fail(emailRes.getErrors());

    const props: UserProps = Object.freeze({
      ...baseRes.getValue(),
      firstName: firstRes.getValue(),
      lastName: lastRes.getValue(),
      email: emailRes.getValue(),
      role: input.role,
    });

    return UserBase.create(props);
  }
}

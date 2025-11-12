import { BaseEntity } from '@domain/base/base.entity';
import { UserRole } from './user-role.enum';
import { UserProps } from './user.props';
import {
  CreatedAtVO,
  EmailVO,
  StringVO,
  UuidVO,
} from '@domain/shared/valid-objects';

export abstract class User extends BaseEntity {
  protected constructor(protected readonly props: UserProps) {
    super(props.entityId, props.isActive, props.createdAt);
  }

  get userId(): UuidVO {
    return this.props.entityId;
  }
  get isActiveUser(): boolean {
    return this.props.isActive;
  }
  get createdAtValue(): CreatedAtVO {
    return this.props.createdAt;
  }

  get firstName(): StringVO {
    return this.props.firstName;
  }
  get lastName(): StringVO {
    return this.props.lastName;
  }
  get email(): EmailVO {
    return this.props.email;
  }
  get role(): UserRole {
    return this.props.role;
  }

  get fullName(): string {
    return `${this.firstName.valueAsString} ${this.lastName.valueAsString}`;
  }

  toPrimitives(): Readonly<{
    id: string;
    active: boolean;
    createdAtIso: string;
    createdAtEpochMs: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  }> {
    return Object.freeze({
      id: this.userId.valueAsString,
      active: this.isActiveUser,
      createdAtIso: this.createdAtValue.valueAsIsoString,
      createdAtEpochMs: this.createdAtValue.valueAsEpochMs,
      firstName: this.firstName.valueAsString,
      lastName: this.lastName.valueAsString,
      email: this.email.valueAsString,
      role: this.role,
    });
  }
}

import { BaseProps } from '@domain/base/base-props.type';
import { UserRole } from './user-role.enum';
import { EmailVO, StringVO } from '@domain/shared/valid-objects';

export type UserProps = Readonly<
  BaseProps & {
    firstName: StringVO;
    lastName: StringVO;
    email: EmailVO;
    role: UserRole;
  }
>;

export type UserPrimitives = Readonly<{
  id: string;
  active?: boolean;
  createdAt?: Date | string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}>;

import { basePropsFactory } from '@domain/base/base-props.factory';
import { EmailVO, StringVO } from '@domain/shared/valid-objects';
import { UserProps } from '@domain/entities/user/user.props';
import { UserRole } from '@domain/entities/user/user-role.enum';

export function makeUserProps(
  role: UserRole,
  overrides?: Partial<UserProps>,
): UserProps {
  const base = basePropsFactory().getValue();
  const firstName = StringVO.from('Demi', {
    fieldName: 'firstName',
    trim: true,
  }).getValue();
  const lastName = StringVO.from('Vselko', {
    fieldName: 'lastName',
    trim: true,
  }).getValue();
  const email = EmailVO.fromString('demi.vselko@example.com').getValue();

  return Object.freeze({
    ...base,
    firstName,
    lastName,
    email,
    role,
    ...overrides,
  });
}

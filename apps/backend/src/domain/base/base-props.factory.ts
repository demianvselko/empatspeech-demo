import { Result } from '../shared/result/result';
import { BaseProps } from './base-props.type';

import { BaseError } from '../shared/error/base.error';
import { CreatedAtVO, UuidVO } from '@domain/shared/valid-objects';

export type BaseOverrides = Partial<BaseProps>;

export function basePropsFactory(
  overrides: BaseOverrides = {},
): Result<BaseProps, BaseError> {
  const props: BaseProps = Object.freeze({
    entityId: overrides.entityId ?? UuidVO.generate(),
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? CreatedAtVO.now(),
  });
  return Result.ok(props);
}

export function basePropsFromPrimitives(input: {
  entityId?: string;
  isActive?: boolean;
  createdAt?: Date | string | number;
}): Result<BaseProps, BaseError> {
  const idVO = input.entityId
    ? UuidVO.fromString(input.entityId)
    : Result.ok(UuidVO.generate());
  if (idVO.isFailure()) return Result.fail(idVO.getErrors());

  const createdAtVO = input.createdAt
    ? CreatedAtVO.from(input.createdAt)
    : Result.ok(CreatedAtVO.now());
  if (createdAtVO.isFailure()) return Result.fail(createdAtVO.getErrors());

  const props: BaseProps = Object.freeze({
    entityId: idVO.getValue(),
    isActive: input.isActive ?? true,
    createdAt: createdAtVO.getValue(),
  });
  return Result.ok(props);
}

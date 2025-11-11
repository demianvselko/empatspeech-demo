import { CreatedAtVO, UuidVO } from '@domain/shared/valid-objects';

export type BaseProps = Readonly<{
  entityId: UuidVO;
  isActive: boolean;
  createdAt: CreatedAtVO;
}>;

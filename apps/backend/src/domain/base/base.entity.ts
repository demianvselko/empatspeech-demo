import { CreatedAtVO, UuidVO } from '@domain/shared/valid-objects';

export abstract class BaseEntity {
  protected constructor(
    public readonly entityId: UuidVO,
    public readonly isActive: boolean,
    public readonly createdAt: CreatedAtVO,
  ) {
    if (!entityId) throw new Error('BaseEntity.entityId is required');
    if (!createdAt) throw new Error('BaseEntity.createdAt is required');
  }
}

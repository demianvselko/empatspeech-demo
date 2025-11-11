import { BaseEntity } from '@domain/base/base.entity';
import { CreatedAtVO, UuidVO } from '@domain/shared/valid-objects';

class DummyEntity extends BaseEntity {
  constructor(args: {
    entityId: UuidVO;
    isActive: boolean;
    createdAt: CreatedAtVO;
  }) {
    super(args.entityId, args.isActive, args.createdAt);
  }
}

describe('BaseEntity', () => {
  it('requiere entityId y createdAt', () => {
    const id = UuidVO.generate();
    const createdAt = CreatedAtVO.now();

    expect(
      () => new DummyEntity({ entityId: id, isActive: true, createdAt }),
    ).not.toThrow();
    // @ts-expect-error runtime
    expect(
      () => new DummyEntity({ entityId: undefined, isActive: true, createdAt }),
    ).toThrow('BaseEntity.entityId is required');
    // @ts-expect-error runtime
    expect(
      () =>
        new DummyEntity({ entityId: id, isActive: true, createdAt: undefined }),
    ).toThrow('BaseEntity.createdAt is required');
  });
});

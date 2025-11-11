import {
  basePropsFactory,
  basePropsFromPrimitives,
} from '@domain/base/base-props.factory';
import { CreatedAtVO, UuidVO } from '@domain/shared/valid-objects';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('basePropsFactory', () => {
  it('devuelve props por defecto y son inmutables (frozen)', () => {
    const r = basePropsFactory();
    expect(r.isSuccess()).toBe(true);
    const p = r.getValue();
    expect(p.isActive).toBe(true);
    expect(p.entityId).toBeInstanceOf(UuidVO);
    expect(p.createdAt).toBeInstanceOf(CreatedAtVO);
    expect(Object.isFrozen(p)).toBe(true);
  });

  it('respeta overrides', () => {
    const customId = UuidVO.generate();
    const customDate = CreatedAtVO.now();
    const r = basePropsFactory({
      entityId: customId,
      isActive: false,
      createdAt: customDate,
    });
    const p = r.getValue();
    expect(p.entityId.valueAsString).toBe(customId.valueAsString);
    expect(p.isActive).toBe(false);
    expect(p.createdAt.valueAsIsoString).toBe(customDate.valueAsIsoString);
  });
});

describe('basePropsFromPrimitives', () => {
  it('acepta input válido (string uuid, boolean, fecha string)', () => {
    const id = UuidVO.generate().valueAsString;
    const r = basePropsFromPrimitives({
      entityId: id,
      isActive: false,
      createdAt: '2025-01-01T00:00:00.000Z',
    });
    expect(r.isSuccess()).toBe(true);
    const p = r.getValue();
    expect(p.entityId.valueAsString).toBe(id);
    expect(p.isActive).toBe(false);
    expect(p.createdAt.valueAsIsoString).toBe('2025-01-01T00:00:00.000Z');
    expect(Object.isFrozen(p)).toBe(true);
  });

  it('genera id y fecha por defecto cuando faltan', () => {
    const r = basePropsFromPrimitives({});
    expect(r.isSuccess()).toBe(true);
    const p = r.getValue();
    expect(p.entityId.valueAsString).toMatch(/^[0-9a-f-]{36}$/i);
    expect(typeof p.createdAt.valueAsEpochMs).toBe('number');
    expect(p.isActive).toBe(true);
  });

  it('falla si entityId inválido', () => {
    const r = basePropsFromPrimitives({ entityId: 'bad-uuid' });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('falla si createdAt inválido/futuro', () => {
    const r = basePropsFromPrimitives({ createdAt: 'not-a-date' });
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });
});

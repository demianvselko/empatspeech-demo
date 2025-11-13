import {
  MongooseSessionRepository,
  type SessionDocument,
} from '@infrastructure/persistence/database/mongoose/repositories/session.repository';
import { UuidVO } from '@domain/shared/valid-objects';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { BaseError } from '@domain/shared/error/base.error';
import { MongoMappingError } from '@infrastructure/persistence/database/mongoose/mongo.errors';
import { TestRepoError } from '../../../../../setup/mocks';

// --- Mocks para caminos de error (mapMongoError) ---
jest.mock(
  '@infrastructure/persistence/database/mongoose/utils/map-mongo-error',
  () => ({
    __esModule: true,
    mapMongoError: (e: unknown) =>
      new TestRepoError('MONGO_MAPPED', (e as Error)?.message ?? 'err'),
  }),
);

const FIXED_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLP = UuidVO.generate().valueAsString;
const STU = UuidVO.generate().valueAsString;

// Helpers tipados para construir mocks con el chain sort/limit/lean
type FindChain<T> = {
  sort: (s: unknown) => { limit: (n: number) => { lean: () => Promise<T[]> } };
};
type FindByIdChain<T> = { lean: () => Promise<T | null> };

describe('MongooseSessionRepository (unit)', () => {
  // ---------- findById ----------
  it('findById: null si no existe', async () => {
    const model = {
      findById: jest.fn(
        (_id: string): FindByIdChain<SessionDocument> => ({
          lean: async () => null,
        }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const r = await repo.findById(UuidVO.fromString(SLP).getValue());
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toBeNull();
    expect(model.findById).toHaveBeenCalledWith(SLP);
  });

  it('findById: mapea doc válido', async () => {
    const doc: SessionDocument = {
      _id: FIXED_ID,
      active: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      slpId: SLP,
      studentId: STU,
      seed: 42,
      finishedAt: new Date('2024-01-02T00:00:00.000Z'),
      notes: 'hi',
      trials: [{ correct: true, tsEpochMs: 1 }],
    };

    const model = {
      findById: jest.fn(
        (_id: string): FindByIdChain<SessionDocument> => ({
          lean: async () => doc,
        }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const r = await repo.findById(UuidVO.fromString(FIXED_ID).getValue());
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()?.toPrimitives().id).toBe(FIXED_ID);
  });

  it('findById: si el mapping falla → Result.fail(MongoMappingError)', async () => {
    // _id inválido provoca fail en SessionFactory.fromPrimitives
    const bad: SessionDocument = {
      _id: 'INVALID_UUID',
      active: true,
      createdAt: new Date(),
      slpId: SLP,
      studentId: STU,
      seed: 1,
      finishedAt: new Date(),
      notes: 'x',
      trials: [],
    };

    const model = {
      findById: jest.fn(
        (_id: string): FindByIdChain<SessionDocument> => ({
          lean: async () => bad,
        }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const r = await repo.findById(UuidVO.fromString(SLP).getValue());
    expect(r.isFailure()).toBe(true);
    const err = r.getErrors()[0];
    expect(err).toBeInstanceOf(MongoMappingError);
    expect(err.code).toBe('MONGO_MAPPING_ERROR');
  });

  // ---------- save ----------
  it('save: hace updateOne upsert', async () => {
    const model = {
      updateOne: jest.fn(
        async (
          _q: Record<string, unknown>,
          _set: Record<string, unknown>,
          _opts: Record<string, unknown>,
        ) => ({ acknowledged: true }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const s = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
      seed: 7,
      notes: 'n',
    }).getValue();

    const r = await repo.save(s);
    expect(r.isSuccess()).toBe(true);

    // Verificamos que se usó upsert
    expect(model.updateOne).toHaveBeenCalledTimes(1);
    const thirdArg = (model.updateOne.mock.calls[0] ?? [])[2] as {
      upsert?: boolean;
    };
    expect(thirdArg?.upsert).toBe(true);
  });

  it('save: si updateOne lanza → fail con mapMongoError', async () => {
    const boom = new Error('boom');
    const model = {
      updateOne: jest.fn(
        async (
          _q: Record<string, unknown>,
          _set: Record<string, unknown>,
          _opts: Record<string, unknown>,
        ) => {
          throw boom;
        },
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const s = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
    }).getValue();

    const r = await repo.save(s);
    expect(r.isFailure()).toBe(true);
    const err = r.getErrors()[0] as BaseError;
    expect(err.code).toBe('MONGO_MAPPED');
    expect(err.message).toContain('boom');
  });

  // ---------- listByStudent ----------
  it('listByStudent: devuelve sólo mapeos válidos', async () => {
    const valid1: SessionDocument = {
      _id: FIXED_ID,
      active: true,
      createdAt: new Date(),
      slpId: SLP,
      studentId: STU,
      seed: 1,
      finishedAt: new Date(),
      notes: 'a',
      trials: [],
    };
    const valid2: SessionDocument = {
      ...valid1,
      _id: UuidVO.generate().valueAsString,
      seed: 2,
      notes: 'b',
    };
    const invalid: SessionDocument = { ...valid1, _id: 'INVALID_UUID' };

    const model = {
      find: jest.fn(
        (_q: Record<string, unknown>): FindChain<SessionDocument> => ({
          sort: () => ({
            limit: (_n: number) => ({
              lean: async () => [valid1, invalid, valid2],
            }),
          }),
        }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);

    const r = await repo.listByStudent(UuidVO.fromString(STU).getValue(), 10);
    expect(r.isSuccess()).toBe(true);
    const list = r.getValue();
    expect(list.length).toBe(2);
    expect(list[0].toPrimitives().studentId).toBe(STU);
    expect(list[1].toPrimitives().studentId).toBe(STU);

    expect(model.find).toHaveBeenCalledTimes(1);
    expect(model.find).toHaveBeenCalledWith({ studentId: STU });
  });

  it('listByStudent: si el modelo lanza → fail con mapMongoError', async () => {
    const boom = new Error('list fail');
    const model = {
      find: jest.fn(
        (_q: Record<string, unknown>): FindChain<SessionDocument> => ({
          sort: () => ({
            limit: () => ({
              lean: async () => {
                throw boom;
              },
            }),
          }),
        }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const r = await repo.listByStudent(UuidVO.fromString(STU).getValue(), 5);
    expect(r.isFailure()).toBe(true);
    const err = r.getErrors()[0] as BaseError;
    expect(err.code).toBe('MONGO_MAPPED');
    expect(err.message).toContain('list fail');
  });

  // ---------- listBySlp ----------
  it('listBySlp: devuelve sólo mapeos válidos', async () => {
    const valid1: SessionDocument = {
      _id: FIXED_ID,
      active: true,
      createdAt: new Date(),
      slpId: SLP,
      studentId: STU,
      seed: 1,
      finishedAt: new Date(),
      notes: 'a',
      trials: [],
    };
    const valid2: SessionDocument = {
      ...valid1,
      _id: UuidVO.generate().valueAsString,
      seed: 3,
      notes: 'c',
    };
    const invalid: SessionDocument = { ...valid1, _id: 'INVALID_UUID' };

    const model = {
      find: jest.fn(
        (_q: Record<string, unknown>): FindChain<SessionDocument> => ({
          sort: () => ({
            limit: (_n: number) => ({
              lean: async () => [invalid, valid1, valid2],
            }),
          }),
        }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const r = await repo.listBySlp(UuidVO.fromString(SLP).getValue(), 10);
    expect(r.isSuccess()).toBe(true);
    const list = r.getValue();
    expect(list.length).toBe(2);
    expect(list[0].toPrimitives().slpId).toBe(SLP);
    expect(list[1].toPrimitives().slpId).toBe(SLP);

    expect(model.find).toHaveBeenCalledWith({ slpId: SLP });
  });

  it('listBySlp: si el modelo lanza → fail con mapMongoError', async () => {
    const boom = new Error('slp list fail');
    const model = {
      find: jest.fn(
        (_q: Record<string, unknown>): FindChain<SessionDocument> => ({
          sort: () => ({
            limit: () => ({
              lean: async () => {
                throw boom;
              },
            }),
          }),
        }),
      ),
    };

    const repo = new MongooseSessionRepository(model as unknown as never);
    const r = await repo.listBySlp(UuidVO.fromString(SLP).getValue(), 3);
    expect(r.isFailure()).toBe(true);
    const err = r.getErrors()[0] as BaseError;
    expect(err.code).toBe('MONGO_MAPPED');
    expect(err.message).toContain('slp list fail');
  });
});

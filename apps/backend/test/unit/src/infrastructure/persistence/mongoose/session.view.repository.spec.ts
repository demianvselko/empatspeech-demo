import {
  MongooseSessionViewRepository,
  type SessionDocument,
} from '@infrastructure/persistence/database/mongoose/repositories/session.view.repository';
import { UuidVO } from '@domain/shared/valid-objects';
import { makeChainFindSortLimitLean } from '../../../../../setup/mocks';
import { TestRepoError } from '../../../../../setup/mocks';

// Mapeo de error para camino de error
jest.mock(
  '@infrastructure/persistence/database/mongoose/utils/map-mongo-error',
  () => ({
    __esModule: true,
    mapMongoError: (e: unknown) =>
      new TestRepoError('E_MONGO', String(e ?? 'error')),
  }),
);

const FIXED_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLP = UuidVO.generate().valueAsString;
const STU = UuidVO.generate().valueAsString;

describe('MongooseSessionViewRepository (unit)', () => {
  it('searchRecent: mapea docs válidos y filtra los inválidos', async () => {
    const valid: SessionDocument = {
      _id: FIXED_ID,
      active: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      slpId: SLP,
      studentId: STU,
      seed: 5,
      finishedAt: new Date('2024-01-02T00:00:00.000Z'),
      notes: 'ok',
      trials: [{ correct: true, tsEpochMs: 1 }],
    };
    // inválido para forzar fallo del factory (UUID inválido)
    const invalid: SessionDocument = { ...valid, _id: 'INVALID_UUID' };

    const model = makeChainFindSortLimitLean<SessionDocument>([valid, invalid]);

    const repo = new MongooseSessionViewRepository(model as unknown as never);

    const r = await repo.searchRecent(50);
    expect(r.isSuccess()).toBe(true);

    const list = r.getValue();
    expect(list.length).toBe(1);
    expect(list[0].toPrimitives().id).toBe(FIXED_ID);
  });

  it('searchRecent: si el modelo lanza error, devuelve Result.fail mapeado', async () => {
    const model = {
      find: () => ({
        sort: () => ({
          limit: () => ({
            lean: async () => {
              throw new Error('boom');
            },
          }),
        }),
      }),
    };

    const repo = new MongooseSessionViewRepository(model as unknown as never);

    const r = await repo.searchRecent();
    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe('E_MONGO');
  });
});

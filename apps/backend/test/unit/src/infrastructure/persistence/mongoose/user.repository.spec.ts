import {
  MongooseUserRepository,
  type UserDocument,
} from '@infrastructure/persistence/database/mongoose/repositories/user.repository';
import { UuidVO } from '@domain/shared/valid-objects';
import { TestRepoError } from '../../../../../setup/mocks';
import { makeLeanFindById } from '../../../../../setup/mocks';

jest.mock(
  '@infrastructure/persistence/database/mongoose/utils/map-mongo-error',
  () => ({
    __esModule: true,
    mapMongoError: (e: unknown) =>
      new TestRepoError('E_MONGO', String(e ?? 'error')),
  }),
);

const FIXED_ID = '550e8400-e29b-41d4-a716-446655440000';

const baseDoc = (over: Partial<UserDocument> = {}): UserDocument => ({
  _id: FIXED_ID,
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@ex.com',
  role: 'Student',
  ...over,
});

it('findById: null si no existe', async () => {
  const model = makeLeanFindById<UserDocument>(null);
  const repo = new MongooseUserRepository(model as unknown as never);
  const r = await repo.findById(UuidVO.fromString(FIXED_ID).getValue());
  expect(r.isSuccess()).toBe(true);
  expect(r.getValue()).toBeNull();
});

it('findById: mapea usuario válido', async () => {
  const model = makeLeanFindById<UserDocument>(baseDoc());
  const repo = new MongooseUserRepository(model as unknown as never);
  const r = await repo.findById(UuidVO.fromString(FIXED_ID).getValue());
  expect(r.isSuccess()).toBe(true);
  expect(r.getValue()?.email.valueAsString).toBe('ada@ex.com');
});

it('findById: si email inválido, devuelve MongoMappingError', async () => {
  const model = makeLeanFindById<UserDocument>(baseDoc({ email: 'bad' }));
  const repo = new MongooseUserRepository(model as unknown as never);
  const r = await repo.findById(UuidVO.fromString(FIXED_ID).getValue());
  expect(r.isFailure()).toBe(true);
  expect(r.getErrors()[0].code).toBe('MONGO_MAPPING_ERROR');
});

it('findById: si el modelo lanza error, devuelve fail mapeado', async () => {
  const model = {
    findById: () => ({
      lean: async () => {
        throw new Error('db-down');
      },
    }),
  };
  const repo = new MongooseUserRepository(model as unknown as never);
  const r = await repo.findById(UuidVO.fromString(FIXED_ID).getValue());
  expect(r.isFailure()).toBe(true);
  expect(r.getErrors()[0].code).toBe('E_MONGO');
});

it('findStudentsBySlp: filtra inválidos y devuelve válidos', async () => {
  const docs: UserDocument[] = [
    baseDoc({ email: 'ok1@ex.com', role: 'Student' }),
    baseDoc({ email: 'bad', role: 'Student' }),
    baseDoc({ email: 'ok2@ex.com', role: 'Student' }),
  ];

  const model = {
    find: jest.fn(() => ({ lean: jest.fn(async () => docs) })),
  };

  const repo = new MongooseUserRepository(model as unknown as never);
  const r = await repo.findStudentsBySlp(
    UuidVO.fromString(FIXED_ID).getValue(),
  );
  expect(r.isSuccess()).toBe(true);
  expect(r.getValue().length).toBe(2);
});

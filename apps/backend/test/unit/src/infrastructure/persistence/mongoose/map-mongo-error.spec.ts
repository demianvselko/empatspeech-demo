import { mapMongoError } from '@infrastructure/persistence/database/mongoose/utils/map-mongo-error';
import {
  MongoDuplicateKeyError,
  MongoCastError,
  MongoValidationError,
  MongoTimeoutError,
  MongoConnectionError,
  MongoOperationError,
} from '@infrastructure/persistence/database/mongoose/mongo.errors';

describe('mapMongoError (unit)', () => {
  it('11000 duplicate key', () => {
    const e = { code: 11000, keyPattern: { email: 1 } };
    const mapped = mapMongoError(e);
    expect(mapped).toBeInstanceOf(MongoDuplicateKeyError);
  });

  it('CastError with path/value', () => {
    const e = { name: 'CastError', path: 'userId', value: 'bad' };
    const mapped = mapMongoError(e);
    expect(mapped).toBeInstanceOf(MongoCastError);
  });

  it('ValidationError', () => {
    const e = { name: 'ValidationError' };
    const mapped = mapMongoError(e);
    expect(mapped).toBeInstanceOf(MongoValidationError);
  });

  it('Timeout by message', () => {
    const e = { message: 'operation timed out after 5000ms' };
    expect(mapMongoError(e)).toBeInstanceOf(MongoTimeoutError);
  });

  it('Connection by message', () => {
    const e = { message: 'ECONNRESET connection lost' };
    expect(mapMongoError(e)).toBeInstanceOf(MongoConnectionError);
  });

  it('Default → MongoOperationError', () => {
    const e = { message: 'some other error' };
    expect(mapMongoError(e)).toBeInstanceOf(MongoOperationError);
  });
});

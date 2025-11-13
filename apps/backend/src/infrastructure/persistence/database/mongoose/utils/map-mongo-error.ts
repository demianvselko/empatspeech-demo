import { BaseError } from '@domain/shared/error/base.error';
import {
  MongoDuplicateKeyError,
  MongoCastError,
  MongoValidationError,
  MongoTimeoutError,
  MongoConnectionError,
  MongoOperationError,
} from '@infrastructure/persistence/database/mongoose/mongo.errors';

type UnknownRecord = Record<string, unknown>;

function hasCode11000(
  e: unknown,
): e is UnknownRecord & { code: number; keyPattern?: UnknownRecord } {
  return (
    typeof (e as UnknownRecord)?.code === 'number' &&
    (e as UnknownRecord).code === 11000
  );
}

function isCastError(
  e: unknown,
): e is UnknownRecord & { name: 'CastError'; path?: string; value?: unknown } {
  return (e as UnknownRecord)?.name === 'CastError';
}

function isValidationError(
  e: unknown,
): e is UnknownRecord & { name: 'ValidationError' } {
  return (e as UnknownRecord)?.name === 'ValidationError';
}

function messageOf(e: unknown): string {
  const msg = (e as UnknownRecord)?.message;
  return typeof msg === 'string' ? msg : '';
}

export function mapMongoError(e: unknown): BaseError {
  if (hasCode11000(e)) {
    const key = e.keyPattern ? Object.keys(e.keyPattern)[0] : undefined;
    return new MongoDuplicateKeyError(key);
  }

  if (isCastError(e)) {
    const path = typeof e.path === 'string' ? e.path : undefined;
    return new MongoCastError(path, (e as UnknownRecord)?.value);
  }

  if (isValidationError(e)) {
    return new MongoValidationError();
  }

  const msg = messageOf(e);
  if (msg.includes('timed out')) return new MongoTimeoutError();
  if (msg.includes('ECONN') || msg.includes('connection'))
    return new MongoConnectionError();

  return new MongoOperationError(msg || 'Mongo operation error');
}

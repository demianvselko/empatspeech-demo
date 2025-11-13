import { BaseError } from '@domain/shared/error/base.error';

export class MongoRepositoryError extends BaseError {
  constructor(message: string, code = 'MONGO_REPOSITORY_ERROR') {
    super(message, code);
  }
}

export class MongoDuplicateKeyError extends MongoRepositoryError {
  constructor(indexName?: string) {
    const message = indexName
      ? `Duplicate key on index "${indexName}"`
      : 'Duplicate key';
    super(message, 'MONGO_DUPLICATE_KEY');
  }
}

export class MongoCastError extends MongoRepositoryError {
  constructor(path?: string, value?: unknown) {
    let message = 'Mongo cast error';

    if (path) message += ` on "${path}"`;

    if (value !== undefined) {
      let serializedValue: string;

      try {
        serializedValue = JSON.stringify(value);
      } catch {
        serializedValue = Object.prototype.toString.call(value);
      }

      message += ` (value: ${serializedValue})`;
    }

    super(message, 'MONGO_CAST_ERROR');
  }
}

export class MongoValidationError extends MongoRepositoryError {
  constructor() {
    super('Mongo validation error', 'MONGO_VALIDATION_ERROR');
  }
}

export class MongoConnectionError extends MongoRepositoryError {
  constructor() {
    super('Mongo connection error', 'MONGO_CONNECTION_ERROR');
  }
}

export class MongoTimeoutError extends MongoRepositoryError {
  constructor() {
    super('Mongo timeout', 'MONGO_TIMEOUT');
  }
}

export class MongoMappingError extends MongoRepositoryError {
  constructor(reason?: string) {
    const message = reason
      ? `Mongo mapping error: ${reason}`
      : 'Mongo mapping error';
    super(message, 'MONGO_MAPPING_ERROR');
  }
}

export class MongoOperationError extends MongoRepositoryError {
  constructor(message = 'Mongo repository operation error') {
    super(message, 'MONGO_OPERATION_ERROR');
  }
}

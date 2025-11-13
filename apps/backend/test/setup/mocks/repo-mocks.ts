import type { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import type { UserRepositoryPort } from '@domain/ports/repository/user-repository.port';
import type { UuidVO } from '@domain/shared/valid-objects';
import type { Result } from '@domain/shared/result/result';
import type { BaseError } from '@domain/shared/error/base.error';

import type { Session } from '@domain/entities/session/session.entity';
import type { User } from '@domain/entities/user/user.abstract';

export const makeSessionRepoMock = (): jest.Mocked<SessionRepositoryPort> => ({
  findById: jest.fn<Promise<Result<Session | null, BaseError>>, [UuidVO]>(),
  save: jest.fn<Promise<Result<void, BaseError>>, [Session]>(),
  listByStudent: jest.fn<
    Promise<Result<Session[], BaseError>>,
    [UuidVO, number | undefined]
  >(),
  listBySlp: jest.fn<
    Promise<Result<Session[], BaseError>>,
    [UuidVO, number | undefined]
  >(),
});

export const makeUserRepoMock = (): jest.Mocked<UserRepositoryPort> => ({
  findById: jest.fn<Promise<Result<User | null, BaseError>>, [UuidVO]>(),
  findStudentsBySlp: jest.fn<Promise<Result<User[], BaseError>>, [UuidVO]>(),
  save: jest.fn<Promise<Result<void, BaseError>>, [User]>(),
});

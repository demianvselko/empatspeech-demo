import { Result } from '@domain/shared/result/result';
import { Criteria } from '../criteria.type';
import { Session } from '@domain/entities/session/session.entity';
import { BaseError } from '@domain/shared/error/base.error';

export interface SessionViewRepositoryPort {
  search(
    criteria?: Criteria<'createdAt' | 'seed'>,
  ): Promise<Result<Session[], BaseError>>;
  listByStudent(
    studentId: string,
    criteria?: Criteria<'createdAt'>,
  ): Promise<Result<Session[], BaseError>>;
  listBySlp(
    slpId: string,
    criteria?: Criteria<'createdAt'>,
  ): Promise<Result<Session[], BaseError>>;
}

import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { Session } from '@domain/entities/session/session.entity';
import { UuidVO } from '@domain/shared/valid-objects';

export interface SessionRepositoryPort {
  findById(id: UuidVO): Promise<Result<Session | null, BaseError>>;
  save(session: Session): Promise<Result<void, BaseError>>;
  listByStudent(
    studentId: UuidVO,
    limit?: number,
  ): Promise<Result<Session[], BaseError>>;
  listBySlp(
    slpId: UuidVO,
    limit?: number,
  ): Promise<Result<Session[], BaseError>>;
}

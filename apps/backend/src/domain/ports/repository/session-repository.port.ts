import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { Session } from '@domain/entities/session/session.entity';

export type SessionId = string;

export interface SessionRepositoryPort {
  findById(sessionId: SessionId): Promise<Result<Session | null, BaseError>>;
  create(session: Session): Promise<Result<void, BaseError>>;
  update(session: Session): Promise<Result<void, BaseError>>;

  // atajos útiles para MVP (si querés atomizar writes):
  appendTrial(
    sessionId: SessionId,
    correct: boolean,
    atMs: number,
  ): Promise<Result<void, BaseError>>;
  patchNotes(
    sessionId: SessionId,
    notes: string,
  ): Promise<Result<void, BaseError>>;
  endSession(
    sessionId: SessionId,
    endedAtMs: number,
  ): Promise<Result<void, BaseError>>;

  listLastByStudent(
    studentId: string,
    limit: number,
  ): Promise<Result<Session[], BaseError>>;
}

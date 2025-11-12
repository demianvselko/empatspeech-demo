import { UseCase } from '@application/contracts/usecase.interface';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';

import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { UuidVO } from '@domain/shared/valid-objects';
import { ClockPort } from '@domain/ports/clock.port';
import {
  FinishSessionInput,
  FinishSessionOutput,
} from './dtos/finish-session.dto';
import { FinishedAtVO } from '@domain/entities/session/validate-objects/finished-at.vo';
import {
  SessionAlreadyFinishedError,
  SessionNotFoundError,
} from '@domain/entities/session/errors/session.errors';

export class FinishSessionUC
  implements UseCase<FinishSessionInput, FinishSessionOutput>
{
  constructor(
    private readonly sessions: SessionRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    input: FinishSessionInput,
  ): Promise<Result<FinishSessionOutput, BaseError>> {
    const idRes = UuidVO.fromString(input.sessionId);
    if (idRes.isFailure()) return Result.fail(idRes.getErrors());
    const sessionId = idRes.getValue();

    const found = await this.sessions.findById(sessionId);
    if (found.isFailure()) return Result.fail(found.getErrors());

    const session = found.getValue();
    if (!session)
      return Result.fail(new SessionNotFoundError(sessionId.valueAsString));
    if (session.finishedAt) {
      return Result.fail(
        new SessionAlreadyFinishedError(sessionId.valueAsString),
      );
    }

    const fRes = FinishedAtVO.from(
      this.clock.nowEpochMs(),
      session.createdAtVO,
    );
    if (fRes.isFailure()) return Result.fail(fRes.getErrors());

    const next = session.finish(fRes.getValue());
    const saved = await this.sessions.save(next);
    if (saved.isFailure()) return Result.fail(saved.getErrors());

    return Result.ok({
      sessionId: next.sessionId.valueAsString,
      finishedAtIso: next.finishedAt?.valueAsIsoString as string,
    });
  }
}

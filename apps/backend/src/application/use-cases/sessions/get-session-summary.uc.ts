import { UseCase } from '@application/contracts/usecase.interface';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { UuidVO } from '@domain/shared/valid-objects';
import type {
  GetSessionSummaryInput,
  GetSessionSummaryOutput,
} from './dtos/get-session-summary.dto';
import { SessionNotFoundError } from '@domain/entities/session/errors/session.errors';

export class GetSessionSummaryUC
  implements UseCase<GetSessionSummaryInput, GetSessionSummaryOutput>
{
  constructor(private readonly sessions: SessionRepositoryPort) {}

  async execute(
    input: GetSessionSummaryInput,
  ): Promise<Result<GetSessionSummaryOutput, BaseError>> {
    const idRes = UuidVO.fromString(input.sessionId);
    if (idRes.isFailure()) return Result.fail(idRes.getErrors());

    const found = await this.sessions.findById(idRes.getValue());
    if (found.isFailure()) return Result.fail(found.getErrors());

    const session = found.getValue();
    if (!session) {
      return Result.fail(
        new SessionNotFoundError(idRes.getValue().valueAsString),
      );
    }

    if (session.slpId.valueAsString !== input.slpId) {
      return Result.fail(
        new SessionNotFoundError(idRes.getValue().valueAsString),
      );
    }

    const totalTrials = session.trials.length;
    const correctTrials = session.trials.filter((t) => t.correct).length;
    const incorrectTrials = totalTrials - correctTrials;
    const accuracyPercent = session.accuracyPercent;
    const errorPercent = 100 - accuracyPercent;

    return Result.ok({
      sessionId: session.sessionId.valueAsString,
      slpId: session.slpId.valueAsString,
      studentId: session.studentId.valueAsString,
      totalTrials,
      correctTrials,
      incorrectTrials,
      accuracyPercent,
      errorPercent,
      notes: [...session.notes],
      createdAtIso: session.createdAtVO.valueAsIsoString,
      finishedAtIso: session.finishedAt?.valueAsIsoString,
    });
  }
}

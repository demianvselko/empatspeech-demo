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

    const allTrials = session.trials;

    const studentTrials = allTrials.filter((t) => t.performedBy === 'student');

    const totalTrials = studentTrials.length;
    const correctTrials = studentTrials.filter((t) => t.correct).length;
    const incorrectTrials = totalTrials - correctTrials;

    let accuracyPercent = 0;
    let errorPercent = 0;

    if (totalTrials > 0) {
      accuracyPercent = Math.round((correctTrials / totalTrials) * 100);
      errorPercent = 100 - accuracyPercent;
    }

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

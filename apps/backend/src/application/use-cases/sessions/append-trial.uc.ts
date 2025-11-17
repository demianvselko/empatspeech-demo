import { UseCase } from '@application/contracts/usecase.interface';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { UuidVO } from '@domain/shared/valid-objects';
import { ClockPort } from '@domain/ports/clock.port';
import { AppendTrialInput, AppendTrialOutput } from './dtos/append-trial.dto';
import { SessionNotFoundError } from '@domain/entities/session/errors/session.errors';

export class AppendTrialUC
  implements UseCase<AppendTrialInput, AppendTrialOutput>
{
  constructor(
    private readonly sessions: SessionRepositoryPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    input: AppendTrialInput,
  ): Promise<Result<AppendTrialOutput, BaseError>> {
    const idRes = UuidVO.fromString(input.sessionId);
    if (idRes.isFailure()) return Result.fail(idRes.getErrors());
    const sessionId = idRes.getValue();

    const found = await this.sessions.findById(sessionId);
    if (found.isFailure()) return Result.fail(found.getErrors());

    const session = found.getValue();
    if (!session) {
      return Result.fail(new SessionNotFoundError(sessionId.valueAsString));
    }

    const next = session.withTrial(
      input.correct,
      this.clock.nowEpochMs(),
      input.performedBy,
    );

    const saved = await this.sessions.save(next);
    if (saved.isFailure()) return Result.fail(saved.getErrors());

    return Result.ok({
      sessionId: next.sessionId.valueAsString,
      totalTrials: next.trials.length,
      accuracyPercent: next.accuracyPercent,
    });
  }
}

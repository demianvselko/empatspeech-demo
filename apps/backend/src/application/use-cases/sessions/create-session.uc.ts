import { UseCase } from '@application/contracts/usecase.interface';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { SessionFactory } from '@domain/entities/session/session.factory';
import {
  CreateSessionInput,
  CreateSessionOutput,
} from './dtos/create-session.dto';
import {
  SameParticipantError,
  InvalidSeedError,
} from '@domain/entities/session/errors/session.errors';
import { SeedVO } from '@domain/entities/session/validate-objects/seed.vo';

export class CreateSessionUC
  implements UseCase<CreateSessionInput, CreateSessionOutput>
{
  constructor(private readonly sessions: SessionRepositoryPort) {}
  async execute(
    input: CreateSessionInput,
  ): Promise<Result<CreateSessionOutput, BaseError>> {
    console.log('🚀 ~ CreateSessionUC ~ execute ~ input:', input);
    if (input.slpId === input.studentId) {
      return Result.fail(
        new SameParticipantError(input.slpId, input.studentId),
      );
    }

    if (input.seed !== undefined) {
      const seedRes = SeedVO.fromNumber(input.seed);
      if (seedRes.isFailure()) {
        return Result.fail(new InvalidSeedError(input.seed));
      }
    }

    const newRes = SessionFactory.newQuick({
      slpId: input.slpId,
      studentId: input.studentId,
      seed: input.seed,
      notes: input.notes,
    });
    if (newRes.isFailure()) return Result.fail(newRes.getErrors());

    const entity = newRes.getValue();

    const saved = await this.sessions.save(entity);
    if (saved.isFailure()) return Result.fail(saved.getErrors());

    return Result.ok({
      sessionId: entity.sessionId.valueAsString,
      seed: entity.seed,
      createdAtIso: entity.createdAtVO.valueAsIsoString,
    });
  }
}

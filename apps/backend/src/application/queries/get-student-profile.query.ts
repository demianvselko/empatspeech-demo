import { Query } from '@application/contracts/query.interface';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { UuidVO } from '@domain/shared/valid-objects';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';

export type GetStudentProfileInput = Readonly<{
  studentId: string;
  limit?: number;
}>;
export type GetStudentProfileOutput = Readonly<{
  studentId: string;
  sessions: Array<{
    id: string;
    createdAtIso: string;
    finishedAtIso?: string;
    accuracyPercent: number;
    totalTrials: number;
  }>;
  overallAccuracyPercent: number;
  totalTrials: number;
}>;

export class GetStudentProfileUC
  implements Query<GetStudentProfileInput, GetStudentProfileOutput>
{
  constructor(private readonly sessions: SessionRepositoryPort) {}

  async execute(
    input: GetStudentProfileInput,
  ): Promise<Result<GetStudentProfileOutput, BaseError>> {
    const idRes = UuidVO.fromString(input.studentId);
    if (idRes.isFailure()) return Result.fail(idRes.getErrors());

    const listRes = await this.sessions.listByStudent(
      idRes.getValue(),
      input.limit ?? 10,
    );
    if (listRes.isFailure()) return Result.fail(listRes.getErrors());
    const list = listRes.getValue();

    let sumCorrect = 0;
    let sumTrials = 0;

    const sessions = list.map((s) => {
      const p = s.toPrimitives();
      const correct = Math.round((p.accuracyPercent / 100) * p.trials.length);
      sumCorrect += correct;
      sumTrials += p.trials.length;

      return {
        id: p.id,
        createdAtIso: p.createdAtIso,
        finishedAtIso: p.finishedAtIso,
        accuracyPercent: p.accuracyPercent,
        totalTrials: p.trials.length,
      };
    });

    const overallAccuracyPercent =
      sumTrials === 0 ? 0 : Math.round((sumCorrect / sumTrials) * 100);

    return Result.ok({
      studentId: idRes.getValue().valueAsString,
      sessions,
      overallAccuracyPercent,
      totalTrials: sumTrials,
    });
  }
}

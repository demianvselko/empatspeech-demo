import { Query } from '@application/contracts/query.interface';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { UuidVO } from '@domain/shared/valid-objects';
import { UserRepositoryPort } from '@domain/ports/repository/user-repository.port';

export type ListCaseloadInput = Readonly<{ slpId: string }>;
export type ListCaseloadOutput = Readonly<
  Array<{
    id: string;
    fullName: string;
    email: string;
    active: boolean;
  }>
>;

export class ListCaseloadUC
  implements Query<ListCaseloadInput, ListCaseloadOutput>
{
  constructor(private readonly users: UserRepositoryPort) {}

  async execute(
    input: ListCaseloadInput,
  ): Promise<Result<ListCaseloadOutput, BaseError>> {
    const idRes = UuidVO.fromString(input.slpId);
    if (idRes.isFailure()) return Result.fail(idRes.getErrors());

    const listRes = await this.users.findStudentsBySlp(idRes.getValue());
    if (listRes.isFailure()) return Result.fail(listRes.getErrors());

    const data = listRes.getValue().map((u) => ({
      id: u.userId.valueAsString,
      fullName: u.fullName,
      email: u.email.valueAsString,
      active: u.isActiveUser,
    }));

    return Result.ok(data);
  }
}

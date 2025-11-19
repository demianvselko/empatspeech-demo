import { UseCase } from '@application/contracts/usecase.interface';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { BaseError } from '@domain/shared/error/base.error';
import { Result } from '@domain/shared/result/result';
import { UserRepositoryPort } from '@domain/ports/repository/user-repository.port';

export class CreateUserUC
  implements UseCase<CreateUserInput, CreateUserOutput>
{
  constructor(private readonly user: UserRepositoryPort) {}
  async execute(
    input: CreateUserInput,
  ): Promise<Result<CreateUserOutput, BaseError>> {
    Result.ok({
      userId: 'some-user-id',
      email: input.email,
      createdAtIso: new Date().toISOString(),
    });
  }
}

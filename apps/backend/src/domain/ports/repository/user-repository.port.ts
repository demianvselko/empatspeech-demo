import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { User } from '@domain/entities/user/user.abstract';

export type UserById = string;
export type SlpId = string;

export interface UserRepositoryPort {
  findById(userId: UserById): Promise<Result<User | null, BaseError>>;
  listStudentsBySlp(
    slpId: SlpId,
    limit?: number,
    offset?: number,
  ): Promise<Result<User[], BaseError>>;
  save(user: User): Promise<Result<void, BaseError>>; // opcional por ahora
}

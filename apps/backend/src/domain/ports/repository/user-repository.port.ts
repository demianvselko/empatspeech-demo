import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { User } from '@domain/entities/user/user.abstract';
import { UuidVO } from '@domain/shared/valid-objects';

export interface UserRepositoryPort {
  findById(id: UuidVO): Promise<Result<User | null, BaseError>>;
  findStudentsBySlp(slpId: UuidVO): Promise<Result<User[], BaseError>>;
  save(user: User): Promise<Result<void, BaseError>>;
}

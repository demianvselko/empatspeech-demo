import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { UuidVO } from '@domain/shared/valid-objects';
import { User } from '@domain/entities/user/user.abstract';
import { UserFactory } from '@domain/entities/user/user.factory';
import { MongoMappingError } from '../mongo.errors';
import { mapMongoError } from '../utils/map-mongo-error';
import { UserRole } from '@domain/entities/user/user-role.enum';

function toUserRole(role: string): UserRole {
  return role === UserRole.Teacher ? UserRole.Teacher : UserRole.Student;
}

export interface UserDocument {
  _id: string;
  active: boolean;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export class MongooseUserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: UuidVO): Promise<Result<User | null, BaseError>> {
    try {
      const doc = await this.userModel.findById(id.valueAsString).lean();
      if (!doc) return Result.ok(null);

      const mapped = UserFactory.fromPrimitives({
        id: doc._id,
        active: doc.active,
        createdAt: doc.createdAt,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        role: toUserRole(doc.role),
      });

      if (mapped.isFailure()) {
        return Result.fail(new MongoMappingError('Invalid user mapping'));
      }

      return Result.ok(mapped.getValue());
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }

  async findStudentsBySlp(slpId: UuidVO): Promise<Result<User[], BaseError>> {
    try {
      const docs = await this.userModel
        .find({ role: 'Student', slpId: slpId.valueAsString })
        .lean();

      const users = docs
        .map((doc) =>
          UserFactory.fromPrimitives({
            id: doc._id,
            active: doc.active,
            createdAt: doc.createdAt,
            firstName: doc.firstName,
            lastName: doc.lastName,
            email: doc.email,
            role: toUserRole(doc.role),
          }),
        )
        .filter((r) => r.isSuccess())
        .map((r) => r.getValue());

      return Result.ok(users);
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }

  async save(user: User): Promise<Result<void, BaseError>> {
    try {
      const p = user.toPrimitives();
      await this.userModel.updateOne(
        { _id: p.id },
        {
          $set: {
            active: p.active,
            createdAt: new Date(p.createdAtEpochMs),
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            role: p.role,
          },
        },
        { upsert: true },
      );

      return Result.ok(undefined);
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }
}

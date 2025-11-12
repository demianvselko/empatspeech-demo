import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { Session } from '@domain/entities/session/session.entity';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { mapMongoError } from '../utils/map-mongo-error';

export interface SessionDocument {
  _id: string;
  active: boolean;
  createdAt: Date;
  slpId: string;
  studentId: string;
  seed: number;
  finishedAt: Date;
  notes: string;
  trials: Array<{ correct: boolean; tsEpochMs: number }>;
}

export class MongooseSessionViewRepository {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async searchRecent(limit = 50): Promise<Result<Session[], BaseError>> {
    try {
      const docs = await this.sessionModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const sessions = docs
        .map((doc) =>
          SessionFactory.fromPrimitives({
            id: doc._id,
            active: doc.active,
            createdAt: doc.createdAt,
            slpId: doc.slpId,
            studentId: doc.studentId,
            seed: doc.seed,
            finishedAt: doc.finishedAt ?? undefined,
            notes: doc.notes ?? undefined,
            trials: doc.trials ?? [],
          }),
        )
        .filter((r) => r.isSuccess())
        .map((r) => r.getValue());

      return Result.ok(sessions);
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }
}

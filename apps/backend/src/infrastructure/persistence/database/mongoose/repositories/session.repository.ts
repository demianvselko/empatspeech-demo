import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { UuidVO } from '@domain/shared/valid-objects';
import { Session } from '@domain/entities/session/session.entity';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { SessionDifficulty } from '@domain/entities/session/session.props';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { MongoMappingError } from '../mongo.errors';
import { mapMongoError } from '../utils/map-mongo-error';

export interface SessionDocument {
  _id: string;
  active: boolean;
  createdAt: Date;
  slpId: string;
  studentId: string;
  seed: number;
  difficulty: SessionDifficulty;
  finishedAt?: Date | null;
  notes?: string[] | null;
  trials: Array<{ correct: boolean; tsEpochMs: number }>;
}

export class MongooseSessionRepository implements SessionRepositoryPort {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async findById(id: UuidVO): Promise<Result<Session | null, BaseError>> {
    try {
      const doc = await this.sessionModel.findById(id.valueAsString).lean();
      if (!doc) return Result.ok(null);

      const mapped = SessionFactory.fromPrimitives({
        id: doc._id,
        active: doc.active,
        createdAt: doc.createdAt,
        slpId: doc.slpId,
        studentId: doc.studentId,
        seed: doc.seed,
        difficulty: doc.difficulty,
        finishedAt: doc.finishedAt ?? undefined,
        notes: doc.notes ?? [],
        trials: doc.trials ?? [],
      });

      if (mapped.isFailure()) {
        return Result.fail(new MongoMappingError('Invalid Session mapping'));
      }
      return Result.ok(mapped.getValue());
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }

  async save(session: Session): Promise<Result<void, BaseError>> {
    try {
      const p = session.toPrimitives();
      await this.sessionModel.updateOne(
        { _id: p.id },
        {
          $set: {
            active: p.active,
            createdAt: new Date(p.createdAtEpochMs),
            slpId: p.slpId,
            studentId: p.studentId,
            seed: p.seed,
            notes: p.notes,
            finishedAt: p.finishedAtEpochMs
              ? new Date(p.finishedAtEpochMs)
              : null,
            trials: p.trials.map((t) => ({
              correct: t.correct,
              tsEpochMs: t.tsEpochMs,
            })),
          },
        },
        { upsert: true },
      );

      return Result.ok(undefined);
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }

  async listByStudent(
    studentId: UuidVO,
    limit = 20,
  ): Promise<Result<Session[], BaseError>> {
    try {
      const docs = await this.sessionModel
        .find({ studentId: studentId.valueAsString })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const sessions: Session[] = [];
      for (const doc of docs) {
        const mapped = SessionFactory.fromPrimitives({
          id: doc._id,
          active: doc.active,
          createdAt: doc.createdAt,
          slpId: doc.slpId,
          studentId: doc.studentId,
          seed: doc.seed,
          difficulty: doc.difficulty,
          finishedAt: doc.finishedAt ?? undefined,
          notes: doc.notes ?? undefined,
          trials: doc.trials ?? [],
        });
        if (mapped.isSuccess()) sessions.push(mapped.getValue());
      }

      return Result.ok(sessions);
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }

  async listBySlp(
    slpId: UuidVO,
    limit = 20,
  ): Promise<Result<Session[], BaseError>> {
    try {
      const docs = await this.sessionModel
        .find({ slpId: slpId.valueAsString })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const sessions: Session[] = [];
      for (const doc of docs) {
        const mapped = SessionFactory.fromPrimitives({
          id: doc._id,
          active: doc.active,
          createdAt: doc.createdAt,
          slpId: doc.slpId,
          studentId: doc.studentId,
          seed: doc.seed,
          difficulty: doc.difficulty,
          finishedAt: doc.finishedAt ?? undefined,
          notes: doc.notes ?? undefined,
          trials: doc.trials ?? [],
        });
        if (mapped.isSuccess()) sessions.push(mapped.getValue());
      }

      return Result.ok(sessions);
    } catch (e) {
      return Result.fail(mapMongoError(e));
    }
  }
}

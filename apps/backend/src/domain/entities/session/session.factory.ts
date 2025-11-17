import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import {
  basePropsFactory,
  basePropsFromPrimitives,
} from '@domain/base/base-props.factory';

import { Session } from './session.entity';
import {
  SessionProps,
  SessionPrimitives,
  Trial,
  SessionDifficulty,
} from './session.props';
import { UuidVO } from '@domain/shared/valid-objects';
import { FinishedAtVO } from './validate-objects/finished-at.vo';

export class SessionFactory {
  static newQuick(input: {
    slpId: string;
    studentId: string;
    seed?: number;
    difficulty?: SessionDifficulty;
    notes?: string;
  }): Result<Session, BaseError> {
    const base = basePropsFactory();
    if (base.isFailure()) return Result.fail(base.getErrors());

    const slp = UuidVO.fromString(input.slpId);
    if (slp.isFailure()) return Result.fail(slp.getErrors());

    const stu = UuidVO.fromString(input.studentId);
    if (stu.isFailure()) return Result.fail(stu.getErrors());

    const difficulty: SessionDifficulty = input.difficulty ?? 'easy';

    const initialNotes: string[] = [];
    if (typeof input.notes === 'string') {
      const trimmed = input.notes.trim();
      if (trimmed.length > 0) {
        initialNotes.push(trimmed);
      }
    }

    const props: SessionProps = {
      ...base.getValue(),
      slpId: slp.getValue(),
      studentId: stu.getValue(),
      seed: input.seed ?? Math.floor(Math.random() * 1_000_000),
      difficulty,
      notes: initialNotes,
      trials: [],
    };

    return Result.ok(new Session(props));
  }

  static fromPrimitives(dto: SessionPrimitives): Result<Session, BaseError> {
    const base = basePropsFromPrimitives({
      entityId: dto.id,
      isActive: dto.active,
      createdAt: dto.createdAt,
    });
    if (base.isFailure()) return Result.fail(base.getErrors());

    const slp = UuidVO.fromString(dto.slpId);
    if (slp.isFailure()) return Result.fail(slp.getErrors());

    const stu = UuidVO.fromString(dto.studentId);
    if (stu.isFailure()) return Result.fail(stu.getErrors());

    const notes: string[] = Array.isArray(dto.notes)
      ? dto.notes.map((n) => `${n}`.trim()).filter((n) => n.length > 0)
      : [];

    let finishedAtVO: FinishedAtVO | undefined;
    if (dto.finishedAt !== undefined) {
      const r = FinishedAtVO.from(dto.finishedAt, base.getValue().createdAt);
      if (r.isFailure()) return Result.fail(r.getErrors());
      finishedAtVO = r.getValue();
    }

    const trials: Trial[] = Array.isArray(dto.trials)
      ? dto.trials.map((t) => ({
          correct: !!t.correct,
          tsEpochMs: Math.trunc(t.tsEpochMs),
        }))
      : [];

    const difficulty: SessionDifficulty = dto.difficulty ?? 'easy';

    const props: SessionProps = {
      ...base.getValue(),
      slpId: slp.getValue(),
      studentId: stu.getValue(),
      seed: dto.seed,
      difficulty,
      notes,
      finishedAt: finishedAtVO,
      trials,
    };

    return Result.ok(new Session(props));
  }
}

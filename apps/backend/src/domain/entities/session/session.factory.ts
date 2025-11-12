import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import {
  basePropsFactory,
  basePropsFromPrimitives,
} from '@domain/base/base-props.factory';

import { Session } from './session.entity';
import { SessionProps, SessionPrimitives, Trial } from './session.props';
import { StringVO, UuidVO } from '@domain/shared/valid-objects';
import { FinishedAtVO } from './validate-objects/finished-at.vo';

export class SessionFactory {
  static newQuick(input: {
    slpId: string;
    studentId: string;
    seed?: number;
    notes?: string;
  }): Result<Session, BaseError> {
    const base = basePropsFactory();
    if (base.isFailure()) return Result.fail(base.getErrors());

    const slp = UuidVO.fromString(input.slpId);
    if (slp.isFailure()) return Result.fail(slp.getErrors());
    const stu = UuidVO.fromString(input.studentId);
    if (stu.isFailure()) return Result.fail(stu.getErrors());

    let notesVO: StringVO | undefined;
    if (input.notes !== undefined) {
      const r = StringVO.from(input.notes, {
        fieldName: 'notes',
        minLength: 0,
        maxLength: 2_000,
        trim: true,
      });
      if (r.isFailure()) return Result.fail(r.getErrors());
      const vo = r.getValue();
      notesVO = vo.valueAsString.length ? vo : undefined;
    }

    const props: SessionProps = {
      ...base.getValue(),
      slpId: slp.getValue(),
      studentId: stu.getValue(),
      seed: input.seed ?? Math.floor(Math.random() * 1_000_000),
      notes: notesVO,
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

    let notesVO: StringVO | undefined;
    if (dto.notes !== undefined) {
      const r = StringVO.from(dto.notes, {
        fieldName: 'notes',
        minLength: 0,
        maxLength: 2_000,
        trim: true,
      });
      if (r.isFailure()) return Result.fail(r.getErrors());
      const vo = r.getValue();
      notesVO = vo.valueAsString.length ? vo : undefined;
    }

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

    const props: SessionProps = {
      ...base.getValue(),
      slpId: slp.getValue(),
      studentId: stu.getValue(),
      seed: dto.seed,
      notes: notesVO,
      finishedAt: finishedAtVO,
      trials,
    };
    return Result.ok(new Session(props));
  }
}

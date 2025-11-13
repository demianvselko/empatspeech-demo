import { BaseEntity } from '@domain/base/base.entity';
import { SessionProps, Trial } from './session.props';
import { CreatedAtVO, UuidVO, StringVO } from '@domain/shared/valid-objects';
import { FinishedAtVO } from './validate-objects/finished-at.vo';

export class Session extends BaseEntity {
  constructor(private readonly props: SessionProps) {
    super(props.entityId, props.isActive, props.createdAt);
  }

  get sessionId(): UuidVO {
    return this.props.entityId;
  }
  get slpId(): UuidVO {
    return this.props.slpId;
  }
  get studentId(): UuidVO {
    return this.props.studentId;
  }
  get seed(): number {
    return this.props.seed;
  }
  get createdAtVO(): CreatedAtVO {
    return this.props.createdAt;
  }
  get finishedAt(): FinishedAtVO | undefined {
    return this.props.finishedAt;
  }
  get notes(): StringVO | undefined {
    return this.props.notes;
  }
  get trials(): readonly Trial[] {
    return this.props.trials;
  }

  get accuracyPercent(): number {
    if (this.props.trials.length === 0) return 0;
    const correct = this.props.trials.filter((t) => t.correct).length;
    return Math.round((correct / this.props.trials.length) * 100);
  }

  withTrial(correct: boolean, atEpochMs: number): Session {
    const updated: SessionProps = {
      ...this.props,
      trials: [
        ...this.props.trials,
        { correct, tsEpochMs: Math.trunc(atEpochMs) },
      ],
    };
    return new Session(updated);
  }

  withNotes(rawNotes: string | undefined): Session {
    if (rawNotes === undefined) {
      return new Session({ ...this.props, notes: undefined });
    }
    const normalized = rawNotes ?? '';
    const r = StringVO.from(normalized, {
      fieldName: 'notes',
      minLength: 0,
      maxLength: 2_000,
      trim: true,
    });
    if (r.isFailure()) {
      throw r.getErrors();
    }
    const vo = r.getValue();
    const updated: SessionProps = {
      ...this.props,
      notes: vo.valueAsString.length ? vo : undefined,
    };
    return new Session(updated);
  }

  finish(at: FinishedAtVO): Session {
    const updated: SessionProps = { ...this.props, finishedAt: at };
    return new Session(updated);
  }

  toPrimitives(): Readonly<{
    id: string;
    active: boolean;
    createdAtIso: string;
    createdAtEpochMs: number;
    slpId: string;
    studentId: string;
    seed: number;
    notes?: string;
    finishedAtIso?: string;
    finishedAtEpochMs?: number;
    trials: Trial[];
    accuracyPercent: number;
  }> {
    return Object.freeze({
      id: this.sessionId.valueAsString,
      active: this.isActive,
      createdAtIso: this.createdAtVO.valueAsIsoString,
      createdAtEpochMs: this.createdAtVO.valueAsEpochMs,
      slpId: this.slpId.valueAsString,
      studentId: this.studentId.valueAsString,
      seed: this.seed,
      notes: this.notes?.valueAsString,
      finishedAtIso: this.finishedAt?.valueAsIsoString,
      finishedAtEpochMs: this.finishedAt?.valueAsEpochMs,
      trials: [...this.trials],
      accuracyPercent: this.accuracyPercent,
    });
  }
}

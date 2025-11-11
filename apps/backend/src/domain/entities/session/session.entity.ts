import { BaseEntity } from '@domain/base/base.entity';
import { SessionProps, Trial } from './session.props';
import { CreatedAtVO, StringVO, UuidVO } from '@domain/shared/valid-objects';

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
  get notes(): StringVO | undefined {
    return this.props.notes;
  }
  get endedAt(): CreatedAtVO | undefined {
    return this.props.endedAt;
  }
  get trials(): readonly Trial[] {
    return this.props.trials;
  }

  get accuracyPercent(): number {
    if (this.props.trials.length === 0) return 0;
    const correct = this.props.trials.filter((t) => t.correct).length;
    return Math.round((correct / this.props.trials.length) * 100);
  }

  withTrial(correct: boolean, atMs: number): Session {
    const updated: SessionProps = {
      ...this.props,
      trials: [...this.props.trials, { correct, ts: atMs }],
    };
    return new Session(updated);
  }

  withNotes(notes: StringVO): Session {
    return new Session({ ...this.props, notes });
  }

  ended(at: CreatedAtVO): Session {
    return new Session({ ...this.props, endedAt: at });
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
    endedAtIso?: string;
    endedAtEpochMs?: number;
    trials: Trial[];
  }> {
    return {
      id: this.sessionId.valueAsString,
      active: this.isActive,
      createdAtIso: this.createdAt.valueAsIsoString,
      createdAtEpochMs: this.createdAt.valueAsEpochMs,
      slpId: this.slpId.valueAsString,
      studentId: this.studentId.valueAsString,
      seed: this.seed,
      notes: this.notes?.valueAsString,
      endedAtIso: this.endedAt?.valueAsIsoString,
      endedAtEpochMs: this.endedAt?.valueAsEpochMs,
      trials: [...this.trials],
    };
  }
}

import { Session } from '@domain/entities/session/session.entity';

export type SessionView = Readonly<{
  id: string;
  slpId: string;
  studentId: string;
  seed: number;
  notes?: string[];
  accuracyPercent: number;
  totalTrials: number;
  createdAtIso: string;
  finishedAtIso?: string;
  trials: ReadonlyArray<{ correct: boolean; tsEpochMs: number }>;
}>;

export const mapSessionToView = (s: Session): SessionView => {
  const p = s.toPrimitives();
  return Object.freeze({
    id: p.id,
    slpId: p.slpId,
    studentId: p.studentId,
    seed: p.seed,
    notes: p.notes,
    accuracyPercent: p.accuracyPercent,
    totalTrials: p.trials.length,
    createdAtIso: p.createdAtIso,
    finishedAtIso: p.finishedAtIso,
    trials: p.trials,
  });
};

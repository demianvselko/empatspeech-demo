import type { SessionDifficulty } from '@domain/entities/session/session.props';

export type CreateSessionInput = Readonly<{
  slpId: string;
  studentId: string;
  seed?: number;
  difficulty?: SessionDifficulty;
  notes?: string;
}>;

export type CreateSessionOutput = Readonly<{
  sessionId: string;
  seed: number;
  difficulty: SessionDifficulty;
  createdAtIso: string;
}>;

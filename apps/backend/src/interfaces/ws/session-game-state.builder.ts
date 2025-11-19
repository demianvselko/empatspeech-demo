import type { Session } from '@domain/entities/session/session.entity';
import { GameStateSchema, type GameState } from '@shared/types';
import { ParticipantTurn } from './session.types';

export function buildGameState(
  session: Session,
  currentTurn: ParticipantTurn,
  sessionMatches: Map<string, Set<string>>,
): GameState {
  const p = session.toPrimitives();
  const matchedSet = sessionMatches.get(p.id);

  const state: GameState = {
    sessionId: p.id,
    slpId: p.slpId,
    studentId: p.studentId,
    currentTurn,
    totalTrials: p.trials.length,
    accuracyPercent: p.accuracyPercent,
    notes: p.notes,
    createdAtIso: p.createdAtIso,
    finishedAtIso: p.finishedAtIso,
    matchedCardIds: matchedSet ? [...matchedSet] : [],
    boardSeed: p.seed.toString(),
    difficulty: p.difficulty,
  };

  return GameStateSchema.parse(state);
}

// packages/shared/src/index.ts
import { z } from 'zod';

/** ---------- Roles & estados de sesión ---------- */

export const Role = z.enum(['SLP', 'Student']);
export type Role = z.infer<typeof Role>;

export const SessionStatus = z.enum(['active', 'completed']);
export type SessionStatus = z.infer<typeof SessionStatus>;

/** ---------- Student domain (puede servir para el front) ---------- */

export const StudentSchema = z.object({
    id: z.string(),
    slpId: z.string(),
    name: z.string().min(1),
    birthdate: z.string().optional(),
    notes: z.string().optional(),
    metrics: z
        .object({
            totalSessions: z.number().int().nonnegative(),
            avgAccuracy: z.number().min(0).max(1),
        })
        .default({ totalSessions: 0, avgAccuracy: 0 }),
});
export type Student = z.infer<typeof StudentSchema>;

/** ---------- Session “perfil” (no necesariamente 1:1 con la entidad de dominio) ---------- */

export const SessionSchema = z.object({
    id: z.string(),
    studentId: z.string(),
    slpId: z.string(),
    startedAt: z.string(),
    endedAt: z.string().optional(),
    status: SessionStatus,
    scoring: z.object({
        correct: z.number().int().nonnegative(),
        incorrect: z.number().int().nonnegative(),
        accuracy: z.number().min(0).max(1),
    }),
    notes: z.string().optional(),
    aiSummary: z.string().nullable().optional(),
});
export type Session = z.infer<typeof SessionSchema>;

/** ---------- Eventos WS “viejos” (por compatibilidad si ya los usabas) ---------- */
export const WsEvent = {
    Join: 'joinRoom',
    StateSync: 'stateSync',
    PlayTurn: 'playTurn',
    TurnPlayed: 'turnPlayed',
    EndSession: 'endSession',
} as const;

export type GameMove = {
    action: 'select' | 'match' | 'skip';
    payload?: unknown;
};

/** =========================================================
 *  WS NUEVOS: contrato backend <-> frontend para el juego
 * ======================================================= */

/** Nombres de eventos que estamos usando en el gateway */
export const WsEvents = {
    SessionJoinIn: 'session:join',
    GameStateOut: 'game:state',
    GameMoveIn: 'game:move',
    GameTurnOut: 'game:turn',
    SessionNoteIn: 'session:note',
    SessionFinishIn: 'session:finish',
} as const;

export type WsEventName = (typeof WsEvents)[keyof typeof WsEvents];

/** ---------- Payloads de entrada desde el cliente ---------- */

export const SessionJoinInSchema = z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
});
export type SessionJoinIn = z.infer<typeof SessionJoinInSchema>;

export const GameMoveInSchema = z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    correct: z.boolean(),
});
export type GameMoveIn = z.infer<typeof GameMoveInSchema>;

export const SessionNoteInSchema = z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    notes: z.string().max(2000).optional(),
});
export type SessionNoteIn = z.infer<typeof SessionNoteInSchema>;

export const SessionFinishInSchema = z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
});
export type SessionFinishIn = z.infer<typeof SessionFinishInSchema>;

/** ---------- Estado del juego que emite el backend ---------- */

export const GameStateSchema = z.object({
    sessionId: z.string().uuid(),
    slpId: z.string().uuid(),
    studentId: z.string().uuid(),
    currentTurn: z.enum(['slp', 'student']),
    totalTrials: z.number().int().nonnegative(),
    accuracyPercent: z.number().int().min(0).max(100),
    notes: z.string().optional(),
    createdAtIso: z.string(),
    finishedAtIso: z.string().optional(),
});
export type GameState = z.infer<typeof GameStateSchema>;

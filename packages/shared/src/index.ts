import { z } from "zod";

export const Role = z.enum(["SLP", "Student"]);
export type Role = z.infer<typeof Role>;

export const SessionStatus = z.enum(["active", "completed"]);
export type SessionStatus = z.infer<typeof SessionStatus>;

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

export const WsEvent = {
  Join: "joinRoom",
  StateSync: "stateSync",
  PlayTurn: "playTurn",
  TurnPlayed: "turnPlayed",
  EndSession: "endSession",
} as const;

export type GameMove = {
  action: "select" | "match" | "skip";
  payload?: unknown;
};

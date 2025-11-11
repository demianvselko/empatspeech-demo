export type CreateSessionInput = Readonly<{
  slpId: string; // Teacher id
  studentId: string; // Student id
  seed?: number; // opcional; si no, se genera random determinista
  notes?: string; // opcional
}>;

export type CreateSessionOutput = Readonly<{
  sessionId: string;
  seed: number;
  createdAtIso: string;
}>;

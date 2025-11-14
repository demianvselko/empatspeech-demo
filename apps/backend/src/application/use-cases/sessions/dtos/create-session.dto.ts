export type CreateSessionInput = Readonly<{
  slpId: string;
  studentId: string;
  seed?: number;
  notes?: string;
}>;

export type CreateSessionOutput = Readonly<{
  sessionId: string;
  seed: number;
  createdAtIso: string;
}>;

export type FinishSessionInput = Readonly<{
  sessionId: string;
}>;

export type FinishSessionOutput = Readonly<{
  sessionId: string;
  finishedAtIso: string;
}>;

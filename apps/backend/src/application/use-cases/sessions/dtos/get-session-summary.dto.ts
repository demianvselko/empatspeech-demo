export type GetSessionSummaryInput = Readonly<{
  sessionId: string;
  slpId: string;
}>;

export type GetSessionSummaryOutput = Readonly<{
  sessionId: string;
  slpId: string;
  studentId: string;
  totalTrials: number;
  correctTrials: number;
  incorrectTrials: number;
  accuracyPercent: number;
  errorPercent: number;
  notes: string[];
  createdAtIso: string;
  finishedAtIso?: string;
}>;

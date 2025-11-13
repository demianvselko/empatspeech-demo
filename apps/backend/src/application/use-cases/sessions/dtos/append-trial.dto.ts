export type AppendTrialInput = Readonly<{
  sessionId: string;
  correct: boolean;
}>;

export type AppendTrialOutput = Readonly<{
  sessionId: string;
  totalTrials: number;
  accuracyPercent: number;
}>;

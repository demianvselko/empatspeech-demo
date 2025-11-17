export type AppendTrialInput = {
  sessionId: string;
  correct: boolean;
  performedBy: 'slp' | 'student';
};

export type AppendTrialOutput = {
  sessionId: string;
  totalTrials: number;
  accuracyPercent: number;
};

export interface ClockPort {
  nowEpochMs(): number;
}

export const SystemClock: ClockPort = {
  nowEpochMs: () => Date.now(),
};

import type { ClockPort } from '@domain/ports/clock.port';

export const FIXED_EPOCH = 1730500000000;
export const fixedClock: ClockPort = { nowEpochMs: () => FIXED_EPOCH };

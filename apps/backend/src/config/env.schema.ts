import { z } from 'zod';

export const EnvSchema = z.object({
  STAGE: z.enum(['local', 'dev', 'staging', 'prod']).default('local'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('*'),
  WS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
});

export type Env = z.infer<typeof EnvSchema>;

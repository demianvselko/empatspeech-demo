import { z } from 'zod';

export const EnvSchema = z.object({
  STAGE: z.enum(['local', 'dev', 'staging', 'prod']).default('local'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
});

export type Env = z.infer<typeof EnvSchema>;

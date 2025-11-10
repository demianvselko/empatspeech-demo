import { EnvSchema, type Env } from './env.schema';

export function loadAndValidateEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
}

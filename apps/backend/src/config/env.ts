import { EnvSchema, type Env } from './env.schema';

let cachedEnv: Env | null = null;

export function env(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables', parsed.error.flatten());
    process.exit(1);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

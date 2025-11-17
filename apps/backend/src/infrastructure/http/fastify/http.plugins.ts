import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import { env } from '@config/env';

type RegisterFn = (
  plugin: unknown,
  opts?: Record<string, unknown>,
) => void | Promise<void>;

type FastifyLike = { register: RegisterFn };

export async function registerFastifyPlugins(
  app: NestFastifyApplication,
): Promise<void> {
  const fastify = app.getHttpAdapter().getInstance() as unknown as FastifyLike;
  const e = env();

  await fastify.register(helmet, {});
  await fastify.register(cors, {
    origin: e.CORS_ORIGIN === '*' ? true : e.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await fastify.register(compress, { global: true });
  await fastify.register(rateLimit, {
    max: e.RATE_LIMIT_MAX,
    timeWindow: e.RATE_LIMIT_WINDOW,
  });
}

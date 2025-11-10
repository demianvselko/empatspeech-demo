import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import requestId from 'fastify-request-id';

export async function registerFastifyPlugins(app: NestFastifyApplication) {
  const fastify = app.getHttpAdapter().getInstance();

  await fastify.register(requestId, {});

  await fastify.register(helmet, {});

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(compress, { global: true });

  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
  });
}

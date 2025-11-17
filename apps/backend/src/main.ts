import { HttpServerFactory } from './infrastructure/http/fastify/http.factory';
import { env } from './config/env';
import { applyWsAppSetup } from '@infrastructure/http/ws/ws.setup';
import { applySwagger } from '@infrastructure/http/fastify/swagger.setup';

async function bootstrap(): Promise<void> {
  const e = env();
  const app = await HttpServerFactory.create();

  applyWsAppSetup(app);
  applySwagger(app);

  const port = Number(process.env.PORT ?? e.PORT);
  const host = e.HOST;

  await app.listen({ host, port });

  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`📘 Swagger UI: http://${host}:${port}/docs`);
}

void bootstrap();

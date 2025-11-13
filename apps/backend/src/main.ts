import { HttpServerFactory } from './infrastructure/http/fastify/http.factory';
import { env } from './config/env';
import { applyWsAppSetup } from '@infrastructure/http/ws/ws.setup';
import { applySwagger } from '@infrastructure/http/fastify/swagger.setup';

async function bootstrap(): Promise<void> {
  const e = env();
  const app = await HttpServerFactory.create();

  applyWsAppSetup(app);
  applySwagger(app);
  await app.listen({ host: e.HOST, port: e.PORT });
  console.log(`🚀 Server running on http://${e.HOST}:${e.PORT}/api`);
  console.log(`📘 Swagger UI: http://${e.HOST}:${e.PORT}/api/docs`);
}

void bootstrap();

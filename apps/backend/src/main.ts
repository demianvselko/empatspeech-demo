import { ServerFactory } from './shared/server.factory';
import { loadAndValidateEnv } from './shared/config';

async function bootstrap() {
  const env = loadAndValidateEnv();
  const app = await ServerFactory.create();
  await app.listen({ host: env.HOST, port: env.PORT });
  console.log(`🚀 Server running on http://${env.HOST}:${env.PORT}/api`);
}
bootstrap();

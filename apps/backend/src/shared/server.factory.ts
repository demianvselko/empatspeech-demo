import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { registerFastifyPlugins } from './server.plugins';
import { applyGlobalNestStuff } from './server.setup';

export class ServerFactory {
  static async create(): Promise<NestFastifyApplication> {
    const adapter = new FastifyAdapter({ trustProxy: true });
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      adapter,
      {
        bufferLogs: true,
      },
    );

    await registerFastifyPlugins(app);

    applyGlobalNestStuff(app);

    return app;
  }
}

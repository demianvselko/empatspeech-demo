import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../../app.module';
import { registerFastifyPlugins } from './http.plugins';
import { applyHttpAppSetup } from './http.setup';

export class HttpServerFactory {
  static async create(): Promise<NestFastifyApplication> {
    const adapter = new FastifyAdapter({
      trustProxy: true,
    });

    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      adapter,
      {
        bufferLogs: true,
      },
    );

    await registerFastifyPlugins(app);
    applyHttpAppSetup(app);

    return app;
  }
}

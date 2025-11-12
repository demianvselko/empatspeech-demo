import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
import type { INestApplicationContext } from '@nestjs/common';
import type { CorsOptions } from 'cors';
import { env } from '../../../config/env';

export class SocketIoAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const e = env();

    const corsOptions: CorsOptions =
      e.WS_ORIGIN === '*'
        ? { origin: true, credentials: true }
        : { origin: e.WS_ORIGIN.split(','), credentials: true };

    const partial: Partial<ServerOptions> = {
      ...options,
      cors: corsOptions,
      serveClient: false,
    };

    const opts = partial;

    return super.createIOServer(port, opts);
  }
}

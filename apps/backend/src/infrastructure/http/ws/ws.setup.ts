import type { INestApplication } from '@nestjs/common';
import { SocketIoAdapter } from './ws.adapter';

export function applyWsAppSetup(app: INestApplication): void {
  app.useWebSocketAdapter(new SocketIoAdapter(app));
}

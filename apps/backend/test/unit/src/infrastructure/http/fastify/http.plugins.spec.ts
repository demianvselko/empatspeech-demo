/* eslint-disable  @typescript-eslint/no-explicit-any */
jest.mock('@fastify/helmet', () => {
  const fn = jest.fn();
  (globalThis as any).__helmet = fn;
  return { __esModule: true, default: fn };
});
jest.mock('@fastify/cors', () => {
  const fn = jest.fn();
  (globalThis as any).__cors = fn;
  return { __esModule: true, default: fn };
});
jest.mock('@fastify/compress', () => {
  const fn = jest.fn();
  (globalThis as any).__compress = fn;
  return { __esModule: true, default: fn };
});
jest.mock('@fastify/rate-limit', () => {
  const fn = jest.fn();
  (globalThis as any).__rateLimit = fn;
  return { __esModule: true, default: fn };
});

import { registerFastifyPlugins } from '@infrastructure/http/fastify/http.plugins';

type RegisterCall = [plugin: unknown, opts?: Record<string, unknown>];
type FastifyInstanceLike = {
  register: (p: unknown, o?: Record<string, unknown>) => void;
};
type HttpAdapterLike = { getInstance(): FastifyInstanceLike };
type AppLike = { getHttpAdapter(): HttpAdapterLike };

function makeFastifyApp(): { app: AppLike; registers: RegisterCall[] } {
  const registers: RegisterCall[] = [];
  const instance: FastifyInstanceLike = {
    register: (plugin, opts) => {
      registers.push([plugin, opts]);
    },
  };
  const adapter: HttpAdapterLike = { getInstance: () => instance };
  const app: AppLike = { getHttpAdapter: () => adapter };
  return { app, registers };
}

describe('registerFastifyPlugins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.__envMock.mockReset();
    globalThis.__envMock.mockReturnValue({
      STAGE: 'local',
      HOST: '0.0.0.0',
      PORT: 4000,
      CORS_ORIGIN: '*',
      WS_ORIGIN: '*',
      RATE_LIMIT_MAX: 200,
      RATE_LIMIT_WINDOW: '1 minute',
    });
  });

  it('CORS "*" y rate limit desde env', async () => {
    const { app, registers } = makeFastifyApp();
    await registerFastifyPlugins(app as unknown as any);

    expect(registers[0][0]).toBe((globalThis as any).__helmet);
    expect(registers[0][1]).toEqual({});

    expect(registers[1][0]).toBe((globalThis as any).__cors);
    // expect(registers[1][1]).toEqual({ origin: true, credentials: true });

    expect(registers[2][0]).toBe((globalThis as any).__compress);
    expect(registers[2][1]).toEqual({ global: true });

    expect(registers[3][0]).toBe((globalThis as any).__rateLimit);
    expect(registers[3][1]).toEqual({ max: 200, timeWindow: '1 minute' });
  });

  it('CORS lista si no es "*"', async () => {
    globalThis.__envMock.mockReturnValue({
      STAGE: 'local',
      HOST: '0.0.0.0',
      PORT: 4000,
      CORS_ORIGIN: 'https://a.com,https://b.com',
      WS_ORIGIN: '*',
      RATE_LIMIT_MAX: 50,
      RATE_LIMIT_WINDOW: '5m',
    });

    const { app, registers } = makeFastifyApp();
    await registerFastifyPlugins(app as unknown as any);

    expect(registers[1][1]).toEqual({
      origin: ['https://a.com', 'https://b.com'],
      credentials: true,
    });
  });
});

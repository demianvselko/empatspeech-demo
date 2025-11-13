type EnvShape = {
  STAGE: 'local' | 'prod' | string;
  HOST: string;
  PORT: number;
  CORS_ORIGIN: string;
  WS_ORIGIN: string;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW: string;
};

const envMock = jest.fn<EnvShape, []>(() => ({
  STAGE: 'local',
  HOST: '0.0.0.0',
  PORT: 4000,
  CORS_ORIGIN: '*',
  WS_ORIGIN: '*',
  RATE_LIMIT_MAX: 200,
  RATE_LIMIT_WINDOW: '1 minute',
}));

jest.mock('../../../src/config/env', () => ({
  __esModule: true,
  env: () => envMock(),
}));

export {};

declare global {
  var __envMock: jest.Mock<EnvShape, []>;
}

(globalThis as unknown as { __envMock: typeof envMock }).__envMock = envMock;

type PinoLike = {
  debug: jest.Mock<void, [unknown?, string?]>;
  info: jest.Mock<void, [unknown?, string?]>;
  warn: jest.Mock<void, [unknown?, string?]>;
  error: jest.Mock<void, [unknown?, string?]>;
};

const pinoInstance: PinoLike = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const pinoMock = jest.fn((_config?: unknown) => pinoInstance);

type Holder = { pinoMock: typeof pinoMock; pinoInstance: PinoLike };
const holder: Holder = { pinoMock, pinoInstance };

jest.mock('pino', () => ({
  __esModule: true,
  default: (_config?: unknown) => {
    holder.pinoMock(_config);
    return holder.pinoInstance;
  },
}));

export {};

declare global {
  var __pino: Holder;
}

(globalThis as unknown as { __pino: Holder }).__pino = holder;

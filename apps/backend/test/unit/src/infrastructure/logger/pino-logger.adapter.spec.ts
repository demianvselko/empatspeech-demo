/* eslint-disable  @typescript-eslint/no-explicit-any */
import { PinoLoggerAdapter } from '@infrastructure/logger/pino-logger.adapter';

describe('PinoLoggerAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('usa level=debug y pretty cuando STAGE!=prod', () => {
    process.env.STAGE = 'local';
    const { pinoMock } = (globalThis as any).__pino;
    new PinoLoggerAdapter();
    expect(pinoMock).toHaveBeenCalledWith({
      level: 'debug',
      transport: { target: 'pino-pretty' },
    });
  });

  it('usa level=info y sin pretty en prod', () => {
    process.env.STAGE = 'prod';
    const { pinoMock } = (globalThis as any).__pino;
    new PinoLoggerAdapter();
    expect(pinoMock).toHaveBeenCalledWith({
      level: 'info',
      transport: undefined,
    });
  });

  it('respeta level explícito', () => {
    process.env.STAGE = 'prod';
    const { pinoMock } = (globalThis as any).__pino;
    new PinoLoggerAdapter('debug');
    expect(pinoMock).toHaveBeenCalledWith({
      level: 'debug',
      transport: undefined,
    });
  });

  it('forward debug/info/warn/error correctamente', () => {
    const { pinoInstance } = (globalThis as any).__pino;
    const logger = new PinoLoggerAdapter('debug');

    logger.debug('m1');
    logger.info('m2', { a: 1 });
    logger.warn('m3', { b: 2 });

    expect(pinoInstance.debug).toHaveBeenCalledWith({}, 'm1');
    expect(pinoInstance.info).toHaveBeenCalledWith({ a: 1 }, 'm2');
    expect(pinoInstance.warn).toHaveBeenCalledWith({ b: 2 }, 'm3');

    const err = new Error('boom');
    logger.error('m4', { ctx: 'x' }, err);
    expect(pinoInstance.error).toHaveBeenCalledWith({ ctx: 'x', err }, 'm4');
  });
});

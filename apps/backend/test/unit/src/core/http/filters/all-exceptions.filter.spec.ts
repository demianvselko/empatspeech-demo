/* eslint-disable  @typescript-eslint/no-explicit-any */
import { AllExceptionsFilter } from '@core/http/filters/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpException, HttpStatus } from '@nestjs/common';

type Req = { url?: string };

const makeHost = (req: Req, res: unknown) =>
  ({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  }) as any;

describe('AllExceptionsFilter', () => {
  const reply = jest.fn();
  const httpAdapter = { reply } as any;
  const adapterHost = { httpAdapter } as HttpAdapterHost;
  const logger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maneja HttpException con su status y body', () => {
    const filter = new AllExceptionsFilter(adapterHost, logger);
    const ex = new HttpException(
      { error: 'bad', statusCode: 400 },
      HttpStatus.BAD_REQUEST,
    );
    const req = { url: '/x' };
    const res = {};
    filter.catch(ex, makeHost(req, res));
    expect(logger.error).toHaveBeenCalledWith(
      'http: exception',
      { statusCode: 400, path: '/x' },
      ex,
    );
    const payload = expect.objectContaining({
      ok: false,
      statusCode: 400,
      path: '/x',
      message: { error: 'bad', statusCode: 400 },
    });
    expect(reply).toHaveBeenCalledWith(res, payload, 400);
  });

  it('maneja Error genérico como 500 con mensaje por defecto', () => {
    const filter = new AllExceptionsFilter(adapterHost, logger);
    const ex = new Error('boom');
    const req = { url: '/y' };
    const res = {};
    filter.catch(ex, makeHost(req, res));
    expect(logger.error).toHaveBeenCalledWith(
      'http: exception',
      { statusCode: 500, path: '/y' },
      ex,
    );
    const payload = expect.objectContaining({
      ok: false,
      statusCode: 500,
      path: '/y',
      message: 'Internal Server Error',
    });
    expect(reply).toHaveBeenCalledWith(res, payload, 500);
  });
});

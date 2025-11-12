import { extractRequestInfo } from '@core/request-info.extractor';
import type { ExecutionContext } from '@nestjs/common';

const ctxOf = (req: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
    }),
  }) as unknown as ExecutionContext;

describe('extractRequestInfo', () => {
  it('extrae method, url, headers, rid desde req.id y ip desde req.ip', () => {
    const ctx = ctxOf({
      method: 'GET',
      url: '/a',
      ip: '1.2.3.4',
      id: 'RID-1',
      headers: { h: 'v' },
    });
    const r = extractRequestInfo(ctx);
    expect(r).toEqual({
      method: 'GET',
      url: '/a',
      ip: '1.2.3.4',
      rid: 'RID-1',
      headers: { h: 'v' },
    });
  });

  it('usa x-request-id cuando no hay req.id', () => {
    const ctx = ctxOf({
      method: 'POST',
      url: '/b',
      headers: { 'x-request-id': 'RID-2' },
    });
    const r = extractRequestInfo(ctx);
    expect(r.rid).toBe('RID-2');
  });

  it('usa socket.remoteAddress si no hay req.ip', () => {
    const ctx = ctxOf({
      method: 'PUT',
      url: '/c',
      socket: { remoteAddress: '5.6.7.8' },
      headers: {},
    });
    const r = extractRequestInfo(ctx);
    expect(r.ip).toBe('5.6.7.8');
  });

  it('headers por defecto cuando no existen', () => {
    const ctx = ctxOf({
      method: 'HEAD',
      url: '/d',
    });
    const r = extractRequestInfo(ctx);
    expect(r.headers).toEqual({});
  });
});

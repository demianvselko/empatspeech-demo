/* eslint-disable  @typescript-eslint/no-explicit-any */
import { RequestIdMiddleware } from '@core/middleware/request-id.middleware';

describe('RequestIdMiddleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deja x-request-id existente y sincroniza req.id', () => {
    const m = new RequestIdMiddleware();
    const req: any = { headers: { 'x-request-id': 'RID-EXIST' } };
    m.use(req, {} as any, next);
    expect(req.headers['x-request-id']).toBe('RID-EXIST');
    expect(req.id).toBe('RID-EXIST');
    expect(next).toHaveBeenCalled();
  });

  it('usa req.id existente para setear x-request-id', () => {
    const m = new RequestIdMiddleware();
    const req: any = { headers: {}, id: 'RID-ID' };
    m.use(req, {} as any, next);
    expect(req.headers['x-request-id']).toBe('RID-ID');
    expect(req.id).toBe('RID-ID');
  });

  it('genera con crypto.randomUUID si no existe', () => {
    const orig = globalThis.crypto;
    const rnd = 'RID-UUID';
    (globalThis as any).crypto = { randomUUID: () => rnd };
    const m = new RequestIdMiddleware();
    const req: any = { headers: {} };
    m.use(req, {} as any, next);
    expect(req.headers['x-request-id']).toBe(rnd);
    expect(req.id).toBe(rnd);
    (globalThis as any).crypto = orig;
  });

  it('fallback a Date.now y Math.random si no hay crypto', () => {
    const origCrypto = (globalThis as any).crypto;
    (globalThis as any).crypto = undefined;
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1730500000000);
    const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0.123456);
    const m = new RequestIdMiddleware();
    const req: any = { headers: {} };
    m.use(req, {} as any, next);
    expect(req.headers['x-request-id']).toBe('1730500000000-0.123456');
    expect(req.id).toBe('1730500000000-0.123456');
    nowSpy.mockRestore();
    randSpy.mockRestore();
    (globalThis as any).crypto = origCrypto;
  });
});

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpServerFactory } from '@infrastructure/http/fastify/http.factory';

const createSpy = jest.fn();
const registerFastifyPluginsSpy = jest.fn();
const applyHttpAppSetupSpy = jest.fn();

jest.mock('@nestjs/core', () => ({
  __esModule: true,
  NestFactory: {
    create: (...args: any[]) => createSpy(...args),
  },
}));

const fastifyAdapterCtorSpy = jest.fn();
jest.mock('@nestjs/platform-fastify', () => ({
  __esModule: true,
  FastifyAdapter: function (this: any, ...a: any[]) {
    fastifyAdapterCtorSpy(...a);
  },
}));

jest.mock('@infrastructure/http/fastify/http.plugins', () => ({
  __esModule: true,
  registerFastifyPlugins: (...args: any[]) =>
    registerFastifyPluginsSpy(...args),
}));

jest.mock('@infrastructure/http/fastify/http.setup', () => ({
  __esModule: true,
  applyHttpAppSetup: (...args: any[]) => applyHttpAppSetupSpy(...args),
}));

function makeAppFake() {
  return {
    getHttpAdapter: () => ({ getInstance: () => ({}) }),
  } as any;
}

describe('HttpServerFactory.create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea la app con FastifyAdapter y aplica plugins + setup', async () => {
    const appFake = makeAppFake();
    createSpy.mockResolvedValue(appFake);

    const app = await HttpServerFactory.create();

    expect(app).toBe(appFake);
    expect(registerFastifyPluginsSpy).toHaveBeenCalledWith(appFake);
    expect(applyHttpAppSetupSpy).toHaveBeenCalledWith(appFake);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });
});

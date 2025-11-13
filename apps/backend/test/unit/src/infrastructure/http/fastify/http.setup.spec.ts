/* eslint-disable  @typescript-eslint/no-explicit-any */
import { applyHttpAppSetup } from '@infrastructure/http/fastify/http.setup';
import { VersioningType } from '@nestjs/common';

function makeAppMock() {
  return {
    setGlobalPrefix: jest.fn(),
    enableVersioning: jest.fn(),
    useGlobalPipes: jest.fn(),
    enableShutdownHooks: jest.fn(),
  } as any;
}

describe('applyHttpAppSetup', () => {
  it('configura prefix, versioning y validation pipe', () => {
    const app = makeAppMock();

    applyHttpAppSetup(app);

    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(app.enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(app.enableShutdownHooks).toHaveBeenCalledTimes(1);
  });
});

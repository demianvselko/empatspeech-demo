import { ProfilesController } from '@interfaces/http/profiles.controller';
import { makeUc, ucOk, ucFail, makeRepoError } from '../../../../setup/mocks';

describe('ProfilesController', () => {
  const uc = makeUc<
    { studentId: string; limit?: number },
    {
      studentId: string;
      sessions: unknown[];
      overallAccuracyPercent: number;
      totalTrials: number;
    }
  >();
  const ctrl = new ProfilesController(
    // @ts-expect-error align at call time
    uc,
  );

  beforeEach(() => uc.execute.mockReset());

  it('parsea limit string -> number', async () => {
    uc.execute.mockResolvedValueOnce(
      ucOk({
        studentId: 'U',
        sessions: [],
        overallAccuracyPercent: 0,
        totalTrials: 0,
      }),
    );
    const r = await ctrl.getProfileById('U', '5');
    expect(uc.execute).toHaveBeenCalledWith({ studentId: 'U', limit: 5 });
    expect(r.studentId).toBe('U');
  });

  it('unwrap fail lanza', async () => {
    uc.execute.mockResolvedValueOnce(ucFail(makeRepoError('E', 'err')));
    await expect(ctrl.getProfileById('U')).rejects.toBeTruthy();
  });
});

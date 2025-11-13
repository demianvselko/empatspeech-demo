import { CaseloadController } from '@interfaces/http/caseload.controller';
import { makeUc, ucOk, ucFail, makeRepoError } from '../../../../setup/mocks';

describe('CaseloadController', () => {
  const uc = makeUc<
    { slpId: string },
    Array<{ id: string; fullName: string; email: string; active: boolean }>
  >();
  const ctrl = new CaseloadController(
    // @ts-expect-error call-time align
    uc,
  );

  beforeEach(() => uc.execute.mockReset());

  it('listCaseload ok', async () => {
    uc.execute.mockResolvedValueOnce(
      ucOk([{ id: 'S', fullName: 'Ada L', email: 'a@x', active: true }]),
    );
    const r = await ctrl.listCaseload('T1');
    expect(uc.execute).toHaveBeenCalledWith({ slpId: 'T1' });
    expect(r[0].id).toBe('S');
  });

  it('unwrap fail lanza', async () => {
    uc.execute.mockResolvedValueOnce(ucFail(makeRepoError('E', 'err')));
    await expect(ctrl.listCaseload('T1')).rejects.toBeTruthy();
  });
});

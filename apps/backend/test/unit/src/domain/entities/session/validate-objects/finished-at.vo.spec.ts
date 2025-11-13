import { FinishedAtVO } from '@domain/entities/session/validate-objects/finished-at.vo';
import { CreatedAtVO } from '@domain/shared/valid-objects';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

describe('FinishedAtVO', () => {
  it('from: acepta fecha válida no futura', () => {
    const base = CreatedAtVO.now();
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2025-01-02T00:00:00.000Z'));
    const r = FinishedAtVO.from('2025-01-01T00:00:00.000Z', base);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue().valueAsIsoString).toBe('2025-01-01T00:00:00.000Z');
    nowSpy.mockRestore();
  });

  it('from: rechaza fecha inválida o futura', () => {
    const base = CreatedAtVO.now();

    const r1 = FinishedAtVO.from('bad-date', base);
    expect(r1.isFailure()).toBe(true);
    expect(r1.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);

    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2025-01-01T00:00:00.000Z'));
    const r2 = FinishedAtVO.from('2025-01-02T00:00:00.000Z', base);
    expect(r2.isFailure()).toBe(true);
    expect(r2.getErrors()[0].code).toBe(ValidationErrorCode.FUTURE_DATE);
    nowSpy.mockRestore();
  });

  it('now: genera ahora y valida contra mustBeAfter (no valida orden aún en tu impl)', () => {
    const base = CreatedAtVO.now();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1111111111111);
    const r = FinishedAtVO.now(base);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue().valueAsEpochMs).toBe(1111111111111);
    nowSpy.mockRestore();
  });
});

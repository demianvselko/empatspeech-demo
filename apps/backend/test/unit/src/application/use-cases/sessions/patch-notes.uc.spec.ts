import { PatchNotesUC } from '@application/use-cases/sessions/patch-notes.uc';
import { makeSessionRepoMock, okVoid } from '../../../../../setup/mocks';
import { SessionFactory } from '@domain/entities/session/session.factory';
import { UuidVO } from '@domain/shared/valid-objects';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { ValidationErrorCode } from '@domain/shared/error/validation.error';

const SLP = UuidVO.generate().valueAsString;
const STU = UuidVO.generate().valueAsString;

describe('PatchNotesUC', () => {
  it('ok: normaliza y guarda notes', async () => {
    const repo = makeSessionRepoMock();
    const s = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
      seed: 7,
    }).getValue();
    repo.findById.mockResolvedValueOnce(Result.ok(s));
    repo.save.mockResolvedValueOnce(okVoid());

    const uc = new PatchNotesUC(repo);
    const r = await uc.execute({
      sessionId: s.sessionId.valueAsString,
      notes: '   hola   ',
    });

    expect(r.isSuccess()).toBe(true);
    expect(r.getValue().notes).toBe('hola');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('id inválido → fail (ValidationError)', async () => {
    const repo = makeSessionRepoMock();
    const uc = new PatchNotesUC(repo);
    const r = await uc.execute({ sessionId: 'not-a-uuid', notes: 'x' });

    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
  });

  it('not found → SessionNotFoundError', async () => {
    const repo = makeSessionRepoMock();
    repo.findById.mockResolvedValueOnce(Result.ok(null));

    const uc = new PatchNotesUC(repo);
    const id = UuidVO.generate().valueAsString;
    const r = await uc.execute({ sessionId: id, notes: 'x' });

    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe('SESSION_NOT_FOUND');
  });

  it('notes inválidas → fail (ValidationError)', async () => {
    const repo = makeSessionRepoMock();
    const s = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
    }).getValue();
    repo.findById.mockResolvedValueOnce(Result.ok(s));

    const uc = new PatchNotesUC(repo);
    const long = 'a'.repeat(2001);
    const r = await uc.execute({
      sessionId: s.sessionId.valueAsString,
      notes: long,
    });

    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe(ValidationErrorCode.MAX_LENGTH);
  });

  it('save falla → propaga error repo', async () => {
    const repo = makeSessionRepoMock();
    const s = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
    }).getValue();
    repo.findById.mockResolvedValueOnce(Result.ok(s));
    repo.save.mockResolvedValueOnce(
      Result.fail({ code: 'E_REPO', message: 'boom' } as unknown as BaseError),
    );

    const uc = new PatchNotesUC(repo);
    const r = await uc.execute({
      sessionId: s.sessionId.valueAsString,
      notes: 'ok',
    });

    expect(r.isFailure()).toBe(true);
    expect(r.getErrors()[0].code).toBe('E_REPO');
  });

  it('notes undefined/blank → guarda como undefined', async () => {
    const repo = makeSessionRepoMock();
    const s = SessionFactory.newQuick({
      slpId: SLP,
      studentId: STU,
    }).getValue();
    repo.findById.mockResolvedValueOnce(Result.ok(s));
    repo.save.mockResolvedValueOnce(okVoid());

    const uc = new PatchNotesUC(repo);
    const r = await uc.execute({
      sessionId: s.sessionId.valueAsString,
      notes: '   ',
    });

    expect(r.isSuccess()).toBe(true);
    expect(r.getValue().notes).toBeUndefined();
  });
});

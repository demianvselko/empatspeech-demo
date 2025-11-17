import { UseCase } from '@application/contracts/usecase.interface';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { UuidVO, StringVO } from '@domain/shared/valid-objects';
import { PatchNotesInput, PatchNotesOutput } from './dtos/patch-notes.dto';
import { SessionNotFoundError } from '@domain/entities/session/errors/session.errors';

export class PatchNotesUC
  implements UseCase<PatchNotesInput, PatchNotesOutput>
{
  constructor(private readonly sessions: SessionRepositoryPort) {}

  async execute(
    input: PatchNotesInput,
  ): Promise<Result<PatchNotesOutput, BaseError>> {
    const idRes = UuidVO.fromString(input.sessionId);
    if (idRes.isFailure()) return Result.fail(idRes.getErrors());

    const found = await this.sessions.findById(idRes.getValue());
    if (found.isFailure()) return Result.fail(found.getErrors());

    const session = found.getValue();
    if (!session) {
      return Result.fail(
        new SessionNotFoundError(idRes.getValue().valueAsString),
      );
    }

    if (typeof input.notes !== 'string') {
      // Nada que agregar, devolvemos el estado actual
      return Result.ok({
        sessionId: session.sessionId.valueAsString,
        notes: [...session.notes],
      });
    }

    const trimmed = input.notes.trim();
    if (trimmed.length === 0) {
      // Nota vacía: no modificamos la sesión
      return Result.ok({
        sessionId: session.sessionId.valueAsString,
        notes: [...session.notes],
      });
    }

    const nv = StringVO.from(trimmed, {
      fieldName: 'notes',
      minLength: 1,
      maxLength: 2000,
      trim: false,
    });
    if (nv.isFailure()) return Result.fail(nv.getErrors());

    const finalNote = nv.getValue().valueAsString;

    // 🔹 Nuevo comportamiento: agregamos nota a la lista
    const next = session.addNote(finalNote);
    const saved = await this.sessions.save(next);
    if (saved.isFailure()) return Result.fail(saved.getErrors());

    return Result.ok({
      sessionId: next.sessionId.valueAsString,
      notes: [...next.notes],
    });
  }
}

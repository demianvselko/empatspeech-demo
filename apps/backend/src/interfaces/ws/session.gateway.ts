import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { AppendTrialUC } from '@application/use-cases/sessions/append-trial.uc';
import { PatchNotesUC } from '@application/use-cases/sessions/patch-notes.uc';
import { FinishSessionUC } from '@application/use-cases/sessions/finish-session.uc';
import { UuidVO } from '@domain/shared/valid-objects';
import type { Session } from '@domain/entities/session/session.entity';
import type {
  SessionJoinIn,
  GameMoveIn,
  SessionNoteIn,
  SessionFinishIn,
  GameState,
} from '@shared/types';
import { WsEvents, GameStateSchema } from '@shared/types';
import { BaseError } from '@domain/shared/error/base.error';
import { Inject } from '@nestjs/common';
import { SESSION_REPOSITORY_TOKEN } from '@infrastructure/persistence/database/mongoose/tokens';

@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: '*', credentials: true },
})
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  // in-memory map sólo para log de conexiones por sesión
  private readonly sessionRooms = new Map<string, Set<string>>();

  constructor(
    @Inject(SESSION_REPOSITORY_TOKEN)
    private readonly sessionsRepo: SessionRepositoryPort,
    private readonly appendTrialUC: AppendTrialUC,
    private readonly patchNotesUC: PatchNotesUC,
    private readonly finishSessionUC: FinishSessionUC,
  ) {}

  handleConnection(client: Socket): void {
    console.log('[WS] client connected', {
      id: client.id,
      nsp: client.nsp?.name,
    });
    // Por ahora solo logueamos, sin auth real
    // Podrías leer client.handshake.auth más adelante
    // console.log('WS connected', client.id);
  }

  handleDisconnect(client: Socket): void {
    console.log('[WS] client disconnected', { id: client.id });
    for (const [sessionId, clients] of this.sessionRooms.entries()) {
      if (clients.delete(client.id) && clients.size === 0) {
        this.sessionRooms.delete(sessionId);
      }
    }
  }

  // ----- session:join -----
  @SubscribeMessage(WsEvents.SessionJoinIn)
  async handleSessionJoin(
    @MessageBody() payload: SessionJoinIn,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // Validación mínima de IDs (dominio)
    const sessionIdRes = UuidVO.fromString(payload.sessionId);
    const userIdRes = UuidVO.fromString(payload.userId);
    if (sessionIdRes.isFailure() || userIdRes.isFailure()) {
      client.emit('error', {
        message: 'Invalid sessionId or userId',
      });
      return;
    }

    const sessionResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (sessionResult.isFailure()) {
      this.emitDomainError(client, sessionResult.getErrors());
      return;
    }

    const session = sessionResult.getValue();
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    const isParticipant =
      session.slpId.valueAsString === payload.userId ||
      session.studentId.valueAsString === payload.userId;

    if (!isParticipant) {
      client.emit('error', { message: 'User is not participant of session' });
      return;
    }

    // Join room por sessionId
    client.join(payload.sessionId);
    this.addClientToRoom(payload.sessionId, client.id);

    // Emitimos el estado actual a todos en la room
    const state = this.buildGameState(session);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

  // ----- game:move -----
  @SubscribeMessage(WsEvents.GameMoveIn)
  async handleGameMove(
    @MessageBody() payload: GameMoveIn,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const sessionIdRes = UuidVO.fromString(payload.sessionId);
    const userIdRes = UuidVO.fromString(payload.userId);
    if (sessionIdRes.isFailure() || userIdRes.isFailure()) {
      client.emit('error', { message: 'Invalid sessionId or userId' });
      return;
    }

    const sessionResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (sessionResult.isFailure()) {
      this.emitDomainError(client, sessionResult.getErrors());
      return;
    }
    const session = sessionResult.getValue();
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    const currentTurn = this.getCurrentTurn(session);
    const isSlp = session.slpId.valueAsString === payload.userId;
    const isStudent = session.studentId.valueAsString === payload.userId;

    if (!isSlp && !isStudent) {
      client.emit('error', { message: 'User is not participant of session' });
      return;
    }

    if (
      (currentTurn === 'slp' && !isSlp) ||
      (currentTurn === 'student' && !isStudent)
    ) {
      client.emit('error', { message: 'Not your turn' });
      return;
    }

    const ucResult = await this.appendTrialUC.execute({
      sessionId: payload.sessionId,
      correct: payload.correct,
    });
    if (ucResult.isFailure()) {
      this.emitDomainError(client, ucResult.getErrors());
      return;
    }

    // Re-leer sesión para construir nuevo estado
    const updatedResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (updatedResult.isFailure()) {
      this.emitDomainError(client, updatedResult.getErrors());
      return;
    }
    const updated = updatedResult.getValue();
    if (!updated) {
      client.emit('error', { message: 'Session not found after update' });
      return;
    }

    const state = this.buildGameState(updated);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

  // ----- session:note -----
  @SubscribeMessage(WsEvents.SessionNoteIn)
  async handleSessionNote(
    @MessageBody() payload: SessionNoteIn,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const sessionIdRes = UuidVO.fromString(payload.sessionId);
    if (sessionIdRes.isFailure()) {
      client.emit('error', { message: 'Invalid sessionId' });
      return;
    }

    const ucResult = await this.patchNotesUC.execute({
      sessionId: payload.sessionId,
      notes: payload.notes,
    });
    if (ucResult.isFailure()) {
      this.emitDomainError(client, ucResult.getErrors());
      return;
    }

    // Leer sesión actualizada
    const updatedResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (updatedResult.isFailure()) {
      this.emitDomainError(client, updatedResult.getErrors());
      return;
    }
    const updated = updatedResult.getValue();
    if (!updated) {
      client.emit('error', { message: 'Session not found after note' });
      return;
    }

    const state = this.buildGameState(updated);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

  // ----- session:finish -----
  @SubscribeMessage(WsEvents.SessionFinishIn)
  async handleSessionFinish(
    @MessageBody() payload: SessionFinishIn,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const sessionIdRes = UuidVO.fromString(payload.sessionId);
    if (sessionIdRes.isFailure()) {
      client.emit('error', { message: 'Invalid sessionId' });
      return;
    }

    const ucResult = await this.finishSessionUC.execute({
      sessionId: payload.sessionId,
    });
    if (ucResult.isFailure()) {
      this.emitDomainError(client, ucResult.getErrors());
      return;
    }

    const updatedResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (updatedResult.isFailure()) {
      this.emitDomainError(client, updatedResult.getErrors());
      return;
    }
    const updated = updatedResult.getValue();
    if (!updated) {
      client.emit('error', { message: 'Session not found after finish' });
      return;
    }

    const state = this.buildGameState(updated);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

  // ---------- Helpers privados ----------

  private addClientToRoom(sessionId: string, clientId: string): void {
    const set = this.sessionRooms.get(sessionId) ?? new Set<string>();
    set.add(clientId);
    this.sessionRooms.set(sessionId, set);
  }

  private getCurrentTurn(session: Session): 'slp' | 'student' {
    const totalTrials = session.trials.length;
    return totalTrials % 2 === 0 ? 'slp' : 'student';
  }

  private buildGameState(session: Session): GameState {
    const p = session.toPrimitives();
    const currentTurn = this.getCurrentTurn(session);

    const state: GameState = {
      sessionId: p.id,
      slpId: p.slpId,
      studentId: p.studentId,
      currentTurn,
      totalTrials: p.trials.length,
      accuracyPercent: p.accuracyPercent,
      notes: p.notes,
      createdAtIso: p.createdAtIso,
      finishedAtIso: p.finishedAtIso,
    };

    // Validamos contra Zod por si algo raro pasa
    return GameStateSchema.parse(state);
  }

  private emitDomainError(
    client: Socket,
    error: BaseError | BaseError[],
  ): void {
    const errors = Array.isArray(error) ? error : [error];

    client.emit('error', {
      errors: errors.map((e) => ({
        code: e.code,
        message: e.message,
        context: e.context ?? undefined,
      })),
    });
  }
}

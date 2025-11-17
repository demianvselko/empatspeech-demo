// apps/backend/src/interfaces/ws/session.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
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

  private readonly sessionRooms = new Map<string, Set<string>>();
  private readonly sessionTurns = new Map<string, 'slp' | 'student'>();
  private readonly sessionMatches = new Map<string, Set<string>>();

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
  }

  handleDisconnect(client: Socket): void {
    console.log('[WS] client disconnected', { id: client.id });
    for (const [sessionId, clients] of this.sessionRooms.entries()) {
      if (clients.delete(client.id) && clients.size === 0) {
        this.sessionRooms.delete(sessionId);
      }
    }
  }

  @SubscribeMessage(WsEvents.SessionJoinIn)
  async handleSessionJoin(
    @MessageBody() payload: SessionJoinIn,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
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

    client.join(payload.sessionId);
    this.addClientToRoom(payload.sessionId, client.id);

    if (!this.sessionTurns.has(payload.sessionId)) {
      this.sessionTurns.set(payload.sessionId, 'slp');
    }
    const currentTurn = this.sessionTurns.get(payload.sessionId) ?? 'slp';

    const state = this.buildGameState(session, currentTurn);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

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

    const currentTurn = this.sessionTurns.get(payload.sessionId) ?? 'slp';
    const isSlp = session.slpId.valueAsString === payload.userId;
    const isStudent = session.studentId.valueAsString === payload.userId;

    if (!isSlp && !isStudent) {
      client.emit('error', { message: 'User is not participant of session' });
      return;
    }

    // Validación de turno se mantiene
    if (
      (currentTurn === 'slp' && !isSlp) ||
      (currentTurn === 'student' && !isStudent)
    ) {
      client.emit('error', { message: 'Not your turn' });
      return;
    }

    // 👇 Aquí la clave: en base al usuario REAL, no al turno
    const performedBy: 'slp' | 'student' = isStudent ? 'student' : 'slp';

    const ucResult = await this.appendTrialUC.execute({
      sessionId: payload.sessionId,
      correct: payload.correct,
      performedBy,
    });
    if (ucResult.isFailure()) {
      this.emitDomainError(client, ucResult.getErrors());
      return;
    }

    if (payload.correct && payload.cards) {
      const set =
        this.sessionMatches.get(payload.sessionId) ?? new Set<string>();
      for (const cardId of payload.cards) {
        set.add(cardId);
      }
      this.sessionMatches.set(payload.sessionId, set);
    }

    let nextTurn: 'slp' | 'student' = currentTurn;
    if (!payload.correct) {
      nextTurn = currentTurn === 'slp' ? 'student' : 'slp';
    }
    this.sessionTurns.set(payload.sessionId, nextTurn);

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

    const state = this.buildGameState(updated, nextTurn);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

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

    const currentTurn = this.sessionTurns.get(payload.sessionId) ?? 'slp';
    const state = this.buildGameState(updated, currentTurn);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

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

    const currentTurn = this.sessionTurns.get(payload.sessionId) ?? 'slp';
    const state = this.buildGameState(updated, currentTurn);
    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

  private addClientToRoom(sessionId: string, clientId: string): void {
    const set = this.sessionRooms.get(sessionId) ?? new Set<string>();
    set.add(clientId);
    this.sessionRooms.set(sessionId, set);
  }

  private buildGameState(
    session: Session,
    currentTurn: 'slp' | 'student',
  ): GameState {
    const p = session.toPrimitives();
    const matchedSet = this.sessionMatches.get(p.id);

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
      matchedCardIds: matchedSet ? [...matchedSet] : [],
      boardSeed: p.seed.toString(),
      difficulty: p.difficulty,
    };

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

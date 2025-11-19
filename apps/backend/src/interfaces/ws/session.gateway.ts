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

import { UuidVO } from '@domain/shared/valid-objects';
import type {
  SessionJoinIn,
  GameMoveIn,
  SessionNoteIn,
  SessionFinishIn,
} from '@shared/types';
import { WsEvents } from '@shared/types';
import { SESSION_REPOSITORY_TOKEN } from '@infrastructure/persistence/database/mongoose/tokens';

import type { ParticipantTurn } from './session.types';
import {
  addClientToRoom,
  removeClientFromAllRooms,
} from './session-rooms.manager';
import { buildGameState } from './session-game-state.builder';
import { emitDomainError } from './session-error-emitter';
import {
  AppendTrialUC,
  FinishSessionUC,
  PatchNotesUC,
} from '@application/use-cases/sessions';

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
  private readonly sessionTurns = new Map<string, ParticipantTurn>();
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
    removeClientFromAllRooms(this.sessionRooms, client);
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
      emitDomainError(client, sessionResult.getErrors());
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
    addClientToRoom(this.sessionRooms, payload.sessionId, client.id);

    if (!this.sessionTurns.has(payload.sessionId)) {
      this.sessionTurns.set(payload.sessionId, 'slp');
    }

    const currentTurn = this.sessionTurns.get(payload.sessionId) ?? 'slp';
    const state = buildGameState(session, currentTurn, this.sessionMatches);

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
      emitDomainError(client, sessionResult.getErrors());
      return;
    }

    const session = sessionResult.getValue();
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    const currentTurn: ParticipantTurn =
      this.sessionTurns.get(payload.sessionId) ?? 'slp';
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

    const performedBy: ParticipantTurn = currentTurn;

    const ucResult = await this.appendTrialUC.execute({
      sessionId: payload.sessionId,
      correct: payload.correct,
      performedBy,
    });
    if (ucResult.isFailure()) {
      emitDomainError(client, ucResult.getErrors());
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

    let nextTurn: ParticipantTurn = currentTurn;
    if (!payload.correct) {
      nextTurn = currentTurn === 'slp' ? 'student' : 'slp';
    }
    this.sessionTurns.set(payload.sessionId, nextTurn);

    const updatedResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (updatedResult.isFailure()) {
      emitDomainError(client, updatedResult.getErrors());
      return;
    }

    const updated = updatedResult.getValue();
    if (!updated) {
      client.emit('error', { message: 'Session not found after update' });
      return;
    }

    const state = buildGameState(updated, nextTurn, this.sessionMatches);

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
      emitDomainError(client, ucResult.getErrors());
      return;
    }

    const updatedResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (updatedResult.isFailure()) {
      emitDomainError(client, updatedResult.getErrors());
      return;
    }

    const updated = updatedResult.getValue();
    if (!updated) {
      client.emit('error', { message: 'Session not found after note' });
      return;
    }

    const currentTurn: ParticipantTurn =
      this.sessionTurns.get(payload.sessionId) ?? 'slp';
    const state = buildGameState(updated, currentTurn, this.sessionMatches);

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
      emitDomainError(client, ucResult.getErrors());
      return;
    }

    const updatedResult = await this.sessionsRepo.findById(
      sessionIdRes.getValue(),
    );
    if (updatedResult.isFailure()) {
      emitDomainError(client, updatedResult.getErrors());
      return;
    }

    const updated = updatedResult.getValue();
    if (!updated) {
      client.emit('error', { message: 'Session not found after finish' });
      return;
    }

    const currentTurn: ParticipantTurn =
      this.sessionTurns.get(payload.sessionId) ?? 'slp';
    const state = buildGameState(updated, currentTurn, this.sessionMatches);

    this.server.to(payload.sessionId).emit(WsEvents.GameStateOut, state);
  }

  async broadcastSessionState(sessionId: string): Promise<void> {
    const idRes = UuidVO.fromString(sessionId);
    if (idRes.isFailure()) return;

    const found = await this.sessionsRepo.findById(idRes.getValue());
    if (found.isFailure()) return;

    const session = found.getValue();
    if (!session) return;

    const currentTurn: ParticipantTurn =
      this.sessionTurns.get(sessionId) ?? 'slp';
    const state = buildGameState(session, currentTurn, this.sessionMatches);

    this.server.to(sessionId).emit(WsEvents.GameStateOut, state);
  }
}

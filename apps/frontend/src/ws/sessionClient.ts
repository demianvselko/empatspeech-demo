import { io, type Socket } from "socket.io-client";
import type {
  GameState,
  SessionJoinIn,
  GameMoveIn,
  SessionNoteIn,
  SessionFinishIn,
} from "@shared/types";
import { WsEvents } from "@shared/types";

export type SessionWsStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export type SessionWsClient = {
  joinSession: (payload: SessionJoinIn) => void;
  sendMove: (payload: GameMoveIn) => void;
  sendNote: (payload: SessionNoteIn) => void;
  finishSession: (payload: SessionFinishIn) => void;
  onGameState: (listener: (state: GameState) => void) => void;
  onError: (listener: (payload: unknown) => void) => void;
  onStatusChange: (listener: (status: SessionWsStatus) => void) => void;
  disconnect: () => void;
};

export function createSessionWsClient(baseHttpUrl: string): SessionWsClient {
  const url = baseHttpUrl.replace(/^http/, "ws");
  console.log("🚀 ~ createSessionWsClient ~ url:", url);
  const socket: Socket = io(`${url}/ws`, {
    transports: ["websocket"],
  });

  const statusListeners = new Set<(status: SessionWsStatus) => void>();

  const notifyStatus = (status: SessionWsStatus) => {
    for (const l of statusListeners) l(status);
  };

  socket.on("connect", () => notifyStatus("connected"));
  socket.on("disconnect", () => notifyStatus("disconnected"));
  socket.on("connect_error", () => notifyStatus("error"));

  return {
    joinSession(payload) {
      socket.emit(WsEvents.SessionJoinIn, payload);
    },
    sendMove(payload) {
      socket.emit(WsEvents.GameMoveIn, payload);
    },
    sendNote(payload) {
      socket.emit(WsEvents.SessionNoteIn, payload);
    },
    finishSession(payload) {
      socket.emit(WsEvents.SessionFinishIn, payload);
    },
    onGameState(listener) {
      socket.on(WsEvents.GameStateOut, listener);
    },
    onError(listener) {
      socket.on("error", listener);
    },
    onStatusChange(listener) {
      statusListeners.add(listener);
    },
    disconnect() {
      socket.disconnect();
    },
  };
}

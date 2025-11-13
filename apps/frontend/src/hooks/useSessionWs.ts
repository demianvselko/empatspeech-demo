// apps/frontend/src/hooks/useSessionWs.ts
"use client";

import { useEffect, useRef, useState } from "react";
import type { GameState, GameMoveIn } from "@shared/types";
import {
  createSessionWsClient,
  type SessionWsClient,
  type SessionWsStatus,
} from "@/ws/sessionClient";

type UseSessionWsParams = {
  sessionId: string;
  userId: string;
};

type UseSessionWsResult = {
  state: GameState | null;
  status: SessionWsStatus;
  join: () => void;
  sendMove: (correct: boolean, cards?: [string, string]) => void;
  sendNote: (notes: string | undefined) => void;
  finish: () => void;
};

export function useSessionWs(params: UseSessionWsParams): UseSessionWsResult {
  const { sessionId, userId } = params;

  const [state, setState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<SessionWsStatus>("idle");
  const clientRef = useRef<SessionWsClient | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const client = createSessionWsClient(baseUrl);
    clientRef.current = client;

    client.onStatusChange((s) => setStatus(s));
    client.onGameState((next) => setState(next));
    client.onError(() => setStatus("error"));

    client.joinSession({
      sessionId,
      userId,
    });

    return () => {
      client.disconnect();
      clientRef.current = null;
      setStatus("disconnected");
    };
  }, [sessionId, userId]);

  const join = () => {
    const client = clientRef.current;
    if (!client) return;
    client.joinSession({ sessionId, userId });
  };

  const sendMove = (correct: boolean, cards?: [string, string]) => {
    const client = clientRef.current;
    if (!client) return;

    const payload: GameMoveIn = {
      sessionId,
      userId,
      correct,
      ...(cards ? { cards } : {}),
    };

    client.sendMove(payload);
  };

  const sendNote = (notes: string | undefined) => {
    const client = clientRef.current;
    if (!client) return;
    client.sendNote({ sessionId, userId, notes });
  };

  const finish = () => {
    const client = clientRef.current;
    if (!client) return;
    client.finishSession({ sessionId, userId });
  };

  return {
    state,
    status,
    join,
    sendMove,
    sendNote,
    finish,
  };
}

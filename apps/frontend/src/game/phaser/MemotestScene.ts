// apps/frontend/src/game/phaser/MemotestScene.ts
import type * as PhaserNS from "phaser";
import { io, type Socket } from "socket.io-client";
import {
  WsEvents,
  type GameState,
  type SessionJoinIn,
  type GameMoveIn,
} from "@shared/types";
import {
  type Difficulty,
  difficultyPresets,
  pickPairs,
  shuffleDeterministic,
  type CardOnBoard,
} from "./types";

type SceneDeps = {
  sessionId: string;
  userId: string;
  difficulty?: Difficulty;
};

type Role = "slp" | "student" | "unknown";

export function createMemotestScene(
  Phaser: typeof import("phaser"),
  deps: SceneDeps,
) {
  const { sessionId, userId, difficulty = "easy" } = deps;

  return class MemotestScene extends Phaser.Scene {
    private socket!: Socket;
    private gameState: GameState | null = null;

    private readonly cards: CardOnBoard[] = [];
    private readonly cardSprites = new Map<
      string,
      PhaserNS.GameObjects.Container
    >();
    private openCards: CardOnBoard[] = [];
    private inputLocked = false;

    private infoText?: PhaserNS.GameObjects.Text;
    private turnText?: PhaserNS.GameObjects.Text;
    private accuracyText?: PhaserNS.GameObjects.Text;

    constructor() {
      super("MemotestScene");
    }

    create(): void {
      this.createHud();
      this.setupSocket();
    }

    update(): void {}

    // ---------- Socket ----------

    private setupSocket(): void {
      this.socket = io("ws://localhost:4000/ws", {
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        const payload: SessionJoinIn = { sessionId, userId };
        this.socket.emit(WsEvents.SessionJoinIn, payload);
      });

      this.socket.on(WsEvents.GameStateOut, (state: GameState) => {
        this.handleGameState(state);
      });

      this.socket.on("error", (err: unknown) => {
        const msg =
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message: string }).message
            : JSON.stringify(err);
        this.infoText?.setText(`Error: ${msg}`);
      });

      this.socket.on("disconnect", () => {
        this.infoText?.setText("Desconectado del servidor");
      });
    }

    private handleGameState(state: GameState): void {
      this.gameState = state;
      this.updateHud(state);

      if (this.cards.length === 0) {
        this.buildBoard(state.sessionId, difficulty);
      }

      this.applyMatchedFromState(state);
    }

    // ---------- Helpers de rol/turno ----------

    private getMyRole(state: GameState): Role {
      if (state.slpId === userId) return "slp";
      if (state.studentId === userId) return "student";
      return "unknown";
    }

    private isMyTurn(state: GameState): boolean {
      const role = this.getMyRole(state);
      return role !== "unknown" && state.currentTurn === role;
    }

    // ---------- HUD ----------

    private createHud(): void {
      this.infoText = this.add
        .text(16, 16, "Conectando...", {
          fontFamily: "sans-serif",
          fontSize: "16px",
          color: "#e5e7eb",
        })
        .setDepth(10);

      this.turnText = this.add
        .text(16, 40, "Turno: -", {
          fontFamily: "sans-serif",
          fontSize: "16px",
          color: "#e5e7eb",
        })
        .setDepth(10);

      this.accuracyText = this.add
        .text(16, 64, "Trials: 0 | Accuracy: 0%", {
          fontFamily: "sans-serif",
          fontSize: "16px",
          color: "#e5e7eb",
        })
        .setDepth(10);
    }

    private updateHud(state: GameState): void {
      const isMyTurn = this.isMyTurn(state);

      let turnLabel = "-";
      if (state.currentTurn === "slp") turnLabel = "SLP";
      if (state.currentTurn === "student") turnLabel = "Student";

      this.infoText?.setText(
        `Session: ${state.sessionId.slice(0, 8)}… | ${
          isMyTurn ? "Tu turno" : "Turno del otro"
        }`,
      );
      this.turnText?.setText(`Turno: ${turnLabel}`);
      this.accuracyText?.setText(
        `Trials: ${state.totalTrials} | Accuracy: ${state.accuracyPercent}%`,
      );
    }

    // ---------- Tablero ----------

    private buildBoard(sessionIdSeed: string, diff: Difficulty): void {
      const cfg = difficultyPresets[diff];
      const pairs = pickPairs(cfg.pairCount);

      const tempCards: CardOnBoard[] = [];
      for (const pair of pairs) {
        const pairId = `pair-${pair.word}`;

        tempCards.push(
          {
            id: `${pairId}-img`,
            label: pair.icon,
            pairId,
            kind: "image",
            x: 0,
            y: 0,
            faceUp: true,
            matched: false,
          },
          {
            id: `${pairId}-txt`,
            label: pair.word,
            pairId,
            kind: "text",
            x: 0,
            y: 0,
            faceUp: true,
            matched: false,
          },
        );
      }

      const shuffled = shuffleDeterministic(tempCards, sessionIdSeed);
      const { width, height } = this.scale;

      const cardW = 110;
      const cardH = 130;
      const totalCols = cfg.cols;
      const totalRows = Math.ceil(shuffled.length / totalCols);

      const boardWidth = totalCols * cardW;
      const boardHeight = totalRows * cardH;

      const startX = width / 2 - boardWidth / 2 + cardW / 2;
      const startY = height / 2 - boardHeight / 2 + cardH / 2 + 40;

      shuffled.forEach((c, idx) => {
        const col = idx % totalCols;
        const row = Math.floor(idx / totalCols);

        c.x = startX + col * cardW;
        c.y = startY + row * cardH;

        this.cards.push(c);
      });

      this.renderCards();

      // mostrar todas 5s y luego ocultar
      this.time.delayedCall(5000, () => {
        for (const card of this.cards) {
          if (!card.matched) {
            card.faceUp = false;
          }
        }
        this.updateCardSprites();
      });
    }

    private renderCards(): void {
      for (const card of this.cards) {
        const container = this.add.container(card.x, card.y);
        const rect = this.add.rectangle(0, 0, 100, 120, 0x1f2937, 1);
        rect.setStrokeStyle(3, 0x38bdf8);

        const label = this.add.text(0, 0, card.faceUp ? card.label : "?", {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#f9fafb",
        });
        label.setOrigin(0.5);

        container.add(rect);
        container.add(label);
        container.setSize(100, 120);
        container.setInteractive({ useHandCursor: true });
        container.on("pointerdown", () => this.handleCardClick(card.id));

        this.cardSprites.set(card.id, container);
      }
    }

    private updateCardSprites(): void {
      for (const card of this.cards) {
        const container = this.cardSprites.get(card.id);
        if (!container) continue;

        const [rect, label] = container.list as [
          PhaserNS.GameObjects.Rectangle,
          PhaserNS.GameObjects.Text,
        ];

        if (card.matched) {
          container.setVisible(false);
          continue;
        }

        label.setText(card.faceUp ? card.label : "?");
        rect.setFillStyle(card.faceUp ? 0x1e293b : 0x020617, 1);
      }
    }

    private applyMatchedFromState(state: GameState): void {
      if (!state.matchedCardIds) return;
      const set = new Set(state.matchedCardIds);

      for (const card of this.cards) {
        if (set.has(card.id)) {
          card.matched = true;
          card.faceUp = false;
        }
      }

      this.updateCardSprites();
    }

    // ---------- Input ----------

    private handleCardClick(cardId: string): void {
      if (!this.gameState) return;
      if (!this.isMyTurn(this.gameState)) return;
      if (this.inputLocked) return;

      const card = this.cards.find((c) => c.id === cardId);
      if (!card || card.matched || card.faceUp) return;

      card.faceUp = true;
      this.openCards.push(card);
      this.updateCardSprites();

      if (this.openCards.length === 2) {
        this.inputLocked = true;
        const [first, second] = this.openCards;
        const isMatch = first.pairId === second.pairId;

        // animación local solo para el jugador activo
        this.time.delayedCall(700, () => {
          if (isMatch) {
            first.matched = true;
            second.matched = true;
          } else {
            first.faceUp = false;
            second.faceUp = false;
          }

          this.openCards = [];
          this.updateCardSprites();
          this.sendMove(isMatch, [first.id, second.id] as [string, string]);
          this.inputLocked = false;
        });
      }
    }

    private sendMove(correct: boolean, cards: [string, string]): void {
      if (!this.gameState) return;

      const payload: GameMoveIn = {
        sessionId: this.gameState.sessionId,
        userId,
        correct,
        cards,
      };

      this.socket.emit(WsEvents.GameMoveIn, payload);
    }

    // ---------- lifecycle ----------

    shutdown(): void {
      this.socket?.removeAllListeners();
      this.socket?.disconnect();
    }

    destroy(): void {
      this.shutdown();
      // @ts-expect-error firma de destroy en Phaser
      super.destroy(true);
    }
  };
}

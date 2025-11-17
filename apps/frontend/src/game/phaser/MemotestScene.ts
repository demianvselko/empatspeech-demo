// apps/frontend/src/game/phaser/MemotestScene.ts
"use client";

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
  shuffleDeterministic,
  type CardOnBoard,
} from "./types";

import type { GameCard } from "@/shared/cards/types";
import { getDeckByLabel } from "@/shared/cards/decks";

type SceneDeps = {
  sessionId: string;
  userId: string;
  difficulty?: Difficulty;
  seedLabel?: string;
};

type Role = "slp" | "student" | "unknown";

export function createMemotestScene(
  Phaser: typeof import("phaser"),
  deps: SceneDeps,
) {
  const { sessionId, userId, difficulty = "easy", seedLabel } = deps;

  const deck: GameCard[] = getDeckByLabel(seedLabel);
  const boardSeed = sessionId;

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

    private totalPairs = 0;
    private finished = false;

    private gameOverOverlay?: PhaserNS.GameObjects.Rectangle;
    private gameOverTitle?: PhaserNS.GameObjects.Text;
    private gameOverStats?: PhaserNS.GameObjects.Text;

    constructor() {
      super("MemotestScene");
    }

    // ------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------
    preload(): void {
      const imgs = deck.filter((c) => c.type === "image" && c.imageUrl);
      for (const card of imgs) {
        this.load.image(card.pairKey, card.imageUrl);
      }
    }

    create(): void {
      // Fondo claro, alineado al card de la UI
      this.cameras.main.setBackgroundColor(0xf9fafb);

      this.createHud();
      this.setupSocket();
    }

    update(): void {
      // no-op por ahora
    }

    // ------------------------------------------------------------
    // WebSocket
    // ------------------------------------------------------------
    private setupSocket(): void {
      this.socket = io(process.env.NEXT_PUBLIC_WS_URL, {
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
        this.infoText?.setText("Disconnected from server");
      });
    }

    // ------------------------------------------------------------
    // Game state sync
    // ------------------------------------------------------------
    private handleGameState(state: GameState): void {
      this.gameState = state;
      this.updateHud(state);

      if (this.cards.length === 0) {
        this.buildBoard(difficulty);
      }

      this.applyMatchedFromState(state);
      this.checkGameFinished(state);
    }

    private getMyRole(state: GameState): Role {
      if (state.slpId === userId) return "slp";
      if (state.studentId === userId) return "student";
      return "unknown";
    }

    private isMyTurn(state: GameState): boolean {
      return state.currentTurn === this.getMyRole(state);
    }

    // ------------------------------------------------------------
    // HUD
    // ------------------------------------------------------------
    private createHud(): void {
      const textStyle: PhaserNS.Types.GameObjects.Text.TextStyle = {
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Baloo 2', 'Comic Neue', sans-serif",
        fontSize: "16px",
        color: "#0f172a",
      };

      this.infoText = this.add
        .text(16, 16, "Connecting...", textStyle)
        .setDepth(10);

      this.turnText = this.add.text(16, 40, "Turn: -", textStyle).setDepth(10);

      this.accuracyText = this.add
        .text(16, 64, "Trials: 0 | Accuracy: 0%", textStyle)
        .setDepth(10);
    }

    private updateHud(state: GameState): void {
      const myTurn = this.isMyTurn(state);

      this.infoText?.setText(
        `Session: ${state.sessionId.slice(0, 8)}… | ${
          myTurn ? "Your turn" : "Other player's turn"
        }`,
      );

      this.turnText?.setText(`Turn: ${state.currentTurn}`);
      this.accuracyText?.setText(
        `Trials: ${state.totalTrials} | Accuracy: ${state.accuracyPercent}%`,
      );
    }

    // ------------------------------------------------------------
    // Build board (difficulty + deterministic)
    // ------------------------------------------------------------
    private buildBoard(diff: Difficulty): void {
      const cfg = difficultyPresets[diff];

      const pairsMap = new Map<string, { image?: GameCard; word?: GameCard }>();

      for (const card of deck) {
        const entry = pairsMap.get(card.pairKey) ?? {};
        if (card.type === "image") entry.image = card;
        if (card.type === "word") entry.word = card;
        pairsMap.set(card.pairKey, entry);
      }

      let pairs = Array.from(pairsMap.entries())
        .filter(([, v]) => v.image && v.word)
        .map(([pairId, v]) => ({
          pairId,
          imageCard: v.image as GameCard,
          wordCard: v.word as GameCard,
        }));

      // Número de pares según difficultyPresets
      pairs = shuffleDeterministic(pairs, boardSeed).slice(0, cfg.pairCount);

      this.totalPairs = pairs.length;

      const tempCards: CardOnBoard[] = [];

      for (const pair of pairs) {
        tempCards.push(
          {
            id: `${pair.pairId}-img`,
            pairId: pair.pairId,
            kind: "image",
            x: 0,
            y: 0,
            faceUp: true,
            matched: false,
            textureKey: pair.imageCard.pairKey,
          },
          {
            id: `${pair.pairId}-txt`,
            pairId: pair.pairId,
            kind: "text", // <-- CardKind nuevo
            x: 0,
            y: 0,
            faceUp: true,
            matched: false,
            text: pair.wordCard.label,
          },
        );
      }

      const shuffled = shuffleDeterministic(tempCards, boardSeed);

      const { width, height } = this.scale;
      const cardW = 120;
      const cardH = 140;
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

      // Fase de “memorización”: 5s boca arriba
      this.time.delayedCall(5000, () => {
        for (const card of this.cards) {
          if (!card.matched) card.faceUp = false;
        }
        this.updateCardSprites();
      });
    }

    // ------------------------------------------------------------
    // Render / update cards
    // ------------------------------------------------------------
    private renderCards(): void {
      for (const card of this.cards) {
        const container = this.add.container(card.x, card.y);

        // Marco de la tarjeta (fondo pastel + borde suave)
        const rect = this.add.rectangle(0, 0, 120, 140, 0xfdfcfb);
        rect.setStrokeStyle(3, 0x93c5fd);

        let face: PhaserNS.GameObjects.Text | PhaserNS.GameObjects.Image;

        if (card.kind === "image") {
          const img = this.add.image(0, -6, card.textureKey ?? "");
          img.setDisplaySize(86, 86);
          face = img;
        } else {
          const text = this.add.text(0, 0, card.text ?? "", {
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Comic Neue', 'Baloo 2', sans-serif",
            fontSize: "26px",
            color: "#1f2933",
            align: "center",
          });

          text.setOrigin(0.5);
          text.setStroke("#f97316", 2); // borde naranja suave
          text.setShadow(1, 2, "#e5e7eb", 2, false, true);
          face = text;
        }

        const back = this.add.text(0, 0, "?", {
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Comic Neue', 'Baloo 2', sans-serif",
          fontSize: "30px",
          color: "#2563eb",
        });
        back.setOrigin(0.5);

        face.setVisible(card.faceUp);
        back.setVisible(!card.faceUp);

        container.add(rect);
        container.add(face);
        container.add(back);

        container.setSize(120, 140);
        container.setInteractive({ useHandCursor: true });
        container.on("pointerdown", () => this.handleCardClick(card.id));

        this.cardSprites.set(card.id, container);
      }
    }

    private updateCardSprites(): void {
      for (const card of this.cards) {
        const container = this.cardSprites.get(card.id);
        if (!container) continue;

        const [rect, face, back] = container.list as [
          PhaserNS.GameObjects.Rectangle,
          PhaserNS.GameObjects.Text | PhaserNS.GameObjects.Image,
          PhaserNS.GameObjects.Text,
        ];

        if (card.matched) {
          container.setVisible(false);
          continue;
        }

        if (card.kind === "image") {
          (face as PhaserNS.GameObjects.Image).setVisible(card.faceUp);
          back.setVisible(!card.faceUp);
        } else {
          const t = face as PhaserNS.GameObjects.Text;
          t.setText(card.text ?? "");
          t.setVisible(card.faceUp);
          back.setVisible(!card.faceUp);
        }

        if (card.faceUp) {
          rect.setFillStyle(0xfefce8, 1); // amarillo claro
          rect.setStrokeStyle(3, 0xfacc15);
        } else {
          rect.setFillStyle(0xf9fafb, 1); // casi blanco
          rect.setStrokeStyle(3, 0x93c5fd);
        }
      }
    }

    // ------------------------------------------------------------
    // Match state sync + end game
    // ------------------------------------------------------------
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

    private checkGameFinished(state: GameState): void {
      if (this.finished) return;

      const matched = (state.matchedCardIds?.length ?? 0) / 2;
      if (matched >= this.totalPairs) {
        this.finished = true;
        this.showGameOverOverlay(state);
      }
    }

    private showGameOverOverlay(state: GameState): void {
      const { width, height } = this.scale;

      const myRole = this.getMyRole(state);
      const winnerRole = state.currentTurn as Role;

      let title = "Game Over";

      if (myRole !== "unknown") {
        if (winnerRole === "unknown") title = "Game Over";
        else if (winnerRole === myRole) title = "You win! 🎉";
        else title = "You lost 😢";
      }

      this.gameOverOverlay = this.add
        .rectangle(width / 2, height / 2, width, height, 0x020617, 0.4)
        .setDepth(20)
        .setAlpha(0);

      this.gameOverTitle = this.add
        .text(width / 2, height / 2 - 40, title, {
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Baloo 2', sans-serif",
          fontSize: "40px",
          color: "#0f172a",
        })
        .setOrigin(0.5)
        .setDepth(21)
        .setAlpha(0)
        .setScale(0.8);

      const stats = `Trials: ${state.totalTrials}\nAccuracy: ${state.accuracyPercent}%`;

      this.gameOverStats = this.add
        .text(width / 2, height / 2 + 20, stats, {
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Baloo 2', sans-serif",
          fontSize: "22px",
          color: "#1f2933",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(21)
        .setAlpha(0);

      this.tweens.add({
        targets: this.gameOverOverlay,
        alpha: 1,
        duration: 400,
        ease: "Quad.easeOut",
      });

      this.tweens.add({
        targets: this.gameOverTitle,
        alpha: 1,
        scale: 1,
        duration: 500,
        ease: "Back.Out",
        delay: 200,
      });

      this.tweens.add({
        targets: this.gameOverStats,
        alpha: 1,
        duration: 400,
        ease: "Quad.easeOut",
        delay: 450,
      });
    }

    // ------------------------------------------------------------
    // Click handler
    // ------------------------------------------------------------
    private handleCardClick(cardId: string): void {
      if (this.finished) return;
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

    // ------------------------------------------------------------
    // Emit move to server
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------
    shutdown(): void {
      this.socket?.removeAllListeners();
      this.socket?.disconnect();
    }

    destroy(): void {
      this.shutdown();
      // @ts-expect-error firma de destroy
      super.destroy(true);
    }
  };
}

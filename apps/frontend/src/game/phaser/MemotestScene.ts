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
  const { sessionId, userId, seedLabel } = deps;

  const deck: GameCard[] = getDeckByLabel(seedLabel);

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

    private cardWidth = 120;
    private cardHeight = 140;
    private readonly boardPadding = {
      top: 96,
      right: 32,
      bottom: 32,
      left: 32,
    };
    private readonly cardGap = 16;

    constructor() {
      super("MemotestScene");
    }

    preload(): void {
      const imgs = deck.filter((c) => c.type === "image" && c.imageUrl);
      for (const card of imgs) {
        this.load.image(card.pairKey, card.imageUrl);
      }
    }

    create(): void {
      this.cameras.main.setBackgroundColor(0xf9fafb);

      this.createHud();
      this.setupSocket();
    }

    update(): void {
      // no-op por ahora
    }

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

    private handleGameState(state: GameState): void {
      this.gameState = state;
      this.updateHud(state);

      if (this.cards.length === 0) {
        this.buildBoard(state.difficulty, state.boardSeed);
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

    private buildBoard(diff: Difficulty, boardSeed: string): void {
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

      // 👉 shuffle determinístico con el seed del servidor
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
            kind: "text",
            x: 0,
            y: 0,
            faceUp: true,
            matched: false,
            text: pair.wordCard.label,
          },
        );
      }

      const shuffled = shuffleDeterministic(tempCards, boardSeed);

      // 🔥 A partir de acá estaba el “resto del layout igual” que falta:

      const { width, height } = this.scale;
      const totalCols = cfg.cols;
      const totalRows = Math.ceil(shuffled.length / totalCols);

      const padding = this.boardPadding;
      const gap = this.cardGap;

      const maxCardWidth = 120;
      const maxCardHeight = 140;

      const availableWidth = width - padding.left - padding.right;
      const availableHeight = height - padding.top - padding.bottom;

      const rawCardWidth = (availableWidth - (totalCols - 1) * gap) / totalCols;
      const rawCardHeight =
        (availableHeight - (totalRows - 1) * gap) / totalRows;

      this.cardWidth = Math.min(maxCardWidth, rawCardWidth);
      this.cardHeight = Math.min(maxCardHeight, rawCardHeight);

      const boardWidth = totalCols * this.cardWidth + (totalCols - 1) * gap;

      const startX = width / 2 - boardWidth / 2 + this.cardWidth / 2;
      const startY = padding.top + this.cardHeight / 2;

      for (const [idx, c] of shuffled.entries()) {
        const col = idx % totalCols;
        const row = Math.floor(idx / totalCols);

        c.x = startX + col * (this.cardWidth + gap);
        c.y = startY + row * (this.cardHeight + gap);

        this.cards.push(c);
      }

      this.renderCards();

      // Mostrar cartas boca arriba unos segundos y luego darlas vuelta
      this.time.delayedCall(5000, () => {
        for (const card of this.cards) {
          if (!card.matched) card.faceUp = false;
        }
        this.updateCardSprites();
      });
    }

    private renderCards(): void {
      for (const card of this.cards) {
        const container = this.add.container(card.x, card.y);

        const rect = this.add.rectangle(
          0,
          0,
          this.cardWidth,
          this.cardHeight,
          0xfdfcfb,
        );
        rect.setStrokeStyle(3, 0x93c5fd);

        let face: PhaserNS.GameObjects.Text | PhaserNS.GameObjects.Image;

        if (card.kind === "image") {
          const img = this.add.image(0, -6, card.textureKey ?? "");
          const imgSize = Math.min(this.cardWidth - 30, this.cardHeight - 40);
          img.setDisplaySize(imgSize, imgSize);
          face = img;
        } else {
          const text = this.add.text(0, 0, card.text ?? "", {
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Comic Neue', 'Baloo 2', sans-serif",
            fontSize: `${Math.max(18, this.cardHeight / 5)}px`,
            color: "#1f2933",
            align: "center",
            wordWrap: { width: this.cardWidth - 24 },
          });

          text.setOrigin(0.5);
          text.setStroke("#f97316", 2);
          text.setShadow(1, 2, "#e5e7eb", 2, false, true);
          face = text;
        }

        const back = this.add.text(0, 0, "?", {
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Comic Neue', 'Baloo 2', sans-serif",
          fontSize: `${Math.max(20, this.cardHeight / 4)}px`,
          color: "#2563eb",
        });
        back.setOrigin(0.5);

        face.setVisible(card.faceUp);
        back.setVisible(!card.faceUp);

        container.add(rect);
        container.add(face);
        container.add(back);

        container.setSize(this.cardWidth, this.cardHeight);
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
          rect.setFillStyle(0xfefce8, 1);
          rect.setStrokeStyle(3, 0xfacc15);
        } else {
          rect.setFillStyle(0xf9fafb, 1);
          rect.setStrokeStyle(3, 0x93c5fd);
        }
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

      let title = "The next game you win!";

      if (winnerRole === myRole) title = "You are awesome! 🎉";

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

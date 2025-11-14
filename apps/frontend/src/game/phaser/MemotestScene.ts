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
import { ANIMALS_DECK_ES } from "@/shared/cards/animalsDeck";
import type { GameCard } from "@/shared/cards/types";

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

    private totalPairs = 0;
    private finished = false;

    private gameOverOverlay?: PhaserNS.GameObjects.Rectangle;
    private gameOverTitle?: PhaserNS.GameObjects.Text;
    private gameOverStats?: PhaserNS.GameObjects.Text;

    constructor() {
      super("MemotestScene");
    }

    create(): void {
      this.createHud();
      this.setupSocket();
    }

    update(): void {}

    preload(): void {
      const imageCards = ANIMALS_DECK_ES.filter(
        (c) => c.type === "image" && c.imageUrl,
      );

      for (const card of imageCards) {
        this.load.image(card.pairKey, card.imageUrl);
      }
    }

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
      this.checkGameFinished(state);
    }

    private getMyRole(state: GameState): Role {
      if (state.slpId === userId) return "slp";
      if (state.studentId === userId) return "student";
      return "unknown";
    }

    private isMyTurn(state: GameState): boolean {
      const role = this.getMyRole(state);
      return role !== "unknown" && state.currentTurn === role;
    }

    private inferWinnerRole(state: GameState): Role {
      if (!state.matchedCardIds || state.matchedCardIds.length === 0) {
        return "unknown";
      }
      return state.currentTurn as Role;
    }

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

    private buildBoard(sessionIdSeed: string, diff: Difficulty): void {
      const cfg = difficultyPresets[diff];

      const pairsMap = new Map<string, { image?: GameCard; word?: GameCard }>();

      for (const card of ANIMALS_DECK_ES) {
        const current = pairsMap.get(card.pairKey) ?? {};
        if (card.type === "image") current.image = card;
        if (card.type === "word") current.word = card;
        pairsMap.set(card.pairKey, current);
      }

      let pairs = Array.from(pairsMap.entries())
        .filter(([, v]) => v.image && v.word)
        .map(([pairId, v]) => ({
          pairId,
          imageCard: v.image as GameCard,
          wordCard: v.word as GameCard,
        }));

      pairs = shuffleDeterministic(pairs, sessionIdSeed).slice(
        0,
        cfg.pairCount,
      );
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

        let face: PhaserNS.GameObjects.Text | PhaserNS.GameObjects.Image;

        if (card.kind === "image") {
          const img = this.add.image(0, 0, card.textureKey ?? "");
          img.setDisplaySize(80, 80);
          face = img;
        } else {
          const text = this.add.text(0, 0, card.text ?? "", {
            fontFamily: "sans-serif",
            fontSize: "22px",
            color: "#f9fafb",
            align: "center",
          });
          text.setOrigin(0.5);
          face = text;
        }

        const back = this.add.text(0, 0, "?", {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#f9fafb",
          align: "center",
        });
        back.setOrigin(0.5);

        face.setVisible(card.faceUp);
        back.setVisible(!card.faceUp);

        container.add(rect);
        container.add(face);
        container.add(back);

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
          const img = face as PhaserNS.GameObjects.Image;
          img.setVisible(card.faceUp);
          back.setVisible(!card.faceUp);
        } else {
          const faceText = face as PhaserNS.GameObjects.Text;
          faceText.setText(card.text ?? "");
          faceText.setVisible(card.faceUp);
          back.setVisible(!card.faceUp);
        }

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

    private checkGameFinished(state: GameState): void {
      if (this.finished) return;
      if (!this.totalPairs) return;

      const matchedCardsCount = state.matchedCardIds?.length ?? 0;
      const matchedPairs = matchedCardsCount / 2;

      if (matchedPairs >= this.totalPairs) {
        this.finished = true;
        this.showGameOverOverlay(state);
      }
    }

    private showGameOverOverlay(state: GameState): void {
      const { width, height } = this.scale;

      const myRole = this.getMyRole(state);
      const winnerRole = this.inferWinnerRole(state);

      let title = "Juego terminado";
      if (myRole !== "unknown") {
        if (winnerRole === "unknown") {
          title = "Juego terminado";
        } else if (myRole === winnerRole) {
          title = "¡Ganaste! 🎉";
        } else {
          title = "Perdiste 😢";
        }
      }

      this.gameOverOverlay = this.add
        .rectangle(width / 2, height / 2, width, height, 0x020617, 0.85)
        .setDepth(20)
        .setAlpha(0);

      this.gameOverTitle = this.add
        .text(width / 2, height / 2 - 40, title, {
          fontFamily: "sans-serif",
          fontSize: "40px",
          color: "#f9fafb",
        })
        .setOrigin(0.5)
        .setDepth(21)
        .setAlpha(0)
        .setScale(0.8);

      const statsText = `Trials: ${state.totalTrials}\nAccuracy: ${state.accuracyPercent}%`;
      this.gameOverStats = this.add
        .text(width / 2, height / 2 + 20, statsText, {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#e5e7eb",
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

"use client";

import { useEffect, useRef } from "react";
import type * as PhaserNS from "phaser";
import { createMemotestScene } from "./MemotestScene";
import type { Difficulty } from "./types";

type Props = {
  sessionId: string;
  userId: string;
  seed?: string;
  difficulty?: Difficulty;
};

export default function GameContainer({
  sessionId,
  userId,
  seed,
  difficulty = "easy",
}: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<PhaserNS.Game | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initGame = async () => {
      if (!containerRef.current) return;
      if (gameRef.current) return;

      const Phaser = await import("phaser");
      if (!isMounted || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth || 800;
      const containerHeight = containerRef.current.clientHeight || 600;

      const width = containerWidth;
      const height = containerHeight;

      const sceneClass = createMemotestScene(Phaser, {
        sessionId,
        userId,
        difficulty,
        seedLabel: seed,
      });

      const config: PhaserNS.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: containerRef.current,
        backgroundColor: "#0f172a",
        physics: {
          default: "arcade",
        },
        scene: [sceneClass],
      };

      gameRef.current = new Phaser.Game(config);
    };

    const handleResize = () => {
      if (!gameRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth || 800;
      const containerHeight = containerRef.current.clientHeight || 600;

      const width = containerWidth;
      const height = containerHeight;

      gameRef.current.scale.resize(width, height);
    };

    void initGame();
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [sessionId, userId, seed, difficulty]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden rounded-lg border border-slate-300"
      />
    </div>
  );
}

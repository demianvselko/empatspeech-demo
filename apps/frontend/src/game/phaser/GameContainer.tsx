"use client";

import { useEffect, useRef } from "react";
import type * as PhaserNS from "phaser";
import { createMemotestScene } from "./MemotestScene";

type Props = {
  sessionId: string;
  userId: string;
};

export default function GameContainer({ sessionId, userId }: Readonly<Props>) {
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

      const width = Math.min(containerWidth, 1100);
      const height = Math.round((width * 3) / 4);

      const sceneClass = createMemotestScene(Phaser, {
        sessionId,
        userId,
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
      const width = Math.min(containerWidth, 1100);
      const height = Math.round((width * 3) / 4);

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
  }, [sessionId, userId]);

  return (
    <div className="w-full flex justify-center">
      <div
        ref={containerRef}
        className="border border-slate-600 rounded-lg overflow-hidden w-full max-w-[1100px]"
      />
    </div>
  );
}

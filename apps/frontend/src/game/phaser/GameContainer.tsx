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

    if (!containerRef.current) return;
    if (gameRef.current) return;

    (async () => {
      const Phaser = await import("phaser");

      if (!isMounted || !containerRef.current) return;

      const width = 800;
      const height = 600;

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
    })();

    return () => {
      isMounted = false;
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
        className="border border-slate-600 rounded-lg overflow-hidden"
      />
    </div>
  );
}

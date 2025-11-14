"use client";

import { useParams, useSearchParams } from "next/navigation";
import GameContainer from "@/game/phaser/GameContainer";

export default function SessionPlayPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();

  const sessionId = params.sessionId;
  const userId = searchParams.get("userId") ?? undefined;

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">
          Falta el userId en la URL. Ej: ?userId=...
        </p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Falta el sessionId en la URL.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-5xl bg-slate-800 rounded-xl p-4 shadow-lg">
        <h1 className="text-xl font-bold text-slate-100 mb-4">
          Memotest – Session {sessionId.slice(0, 8)}…
        </h1>
        <GameContainer sessionId={sessionId} userId={userId} />
      </div>
    </div>
  );
}

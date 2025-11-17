"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Copy, Check } from "lucide-react";

import GameContainer from "@/game/phaser/GameContainer";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { AppNavbar } from "@/components/layouts/AppNavbar";

type FinishSessionResponse = {
  sessionId: string;
  finishedAtIso: string;
};

export default function SessionPlayPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const { user, isLoading, accessToken } = useAuth();

  const [copied, setCopied] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [finishedAtIso, setFinishedAtIso] = useState<string | null>(null);

  const sessionId = params.sessionId;

  const [stableSeed, setStableSeed] = useState<string>(() => sessionId);

  useEffect(() => {
    const seedParam = searchParams.get("seed");
    if (seedParam && seedParam.length > 0) {
      setStableSeed(seedParam);
    } else {
      setStableSeed(sessionId);
    }
  }, [searchParams, sessionId]);

  const difficultyParam = searchParams.get("difficulty");
  const difficulty =
    difficultyParam === "medium" || difficultyParam === "hard"
      ? difficultyParam
      : "easy";

  if (!sessionId) {
    return (
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
        <AppNavbar />
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <p className="text-lg font-semibold text-slate-800">
            sessionId is missing in the URL.
          </p>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
        <AppNavbar />
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <p className="text-slate-700">Loading session...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
        <AppNavbar />
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-card/90 p-6 shadow-lg ring-1 ring-border">
            <p className="text-lg font-semibold text-slate-800">
              You need to be logged in to access this session.
            </p>
            <Link href="/login">
              <Button>Go to login</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sessionId);
    setCopied(true);
    globalThis.setTimeout(() => setCopied(false), 2000);
  };

  const handleFinishSession = async () => {
    setFinishError(null);

    if (!accessToken) {
      setFinishError("Missing access token.");
      return;
    }

    setFinishLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const res = await fetch(`${baseUrl}/v1/sessions/${sessionId}/finish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        console.error("finish session error status:", res.status);
        const errBody = await res.json().catch(() => null);
        console.error("finish session error body:", errBody);
        throw new Error("Failed to finish the session");
      }

      const data: FinishSessionResponse = await res.json();
      setFinishedAtIso(data.finishedAtIso);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setFinishError(message);
    } finally {
      setFinishLoading(false);
    }
  };

  const defaultJitsiUrl = `https://meet.jit.si/speech-therapy-${sessionId}`;

  const renderVideoCall = () => {
    return (
      <div className="flex flex-1 flex-col">
        <div className="relative flex-1 w-full overflow-hidden rounded-lg border border-border bg-black">
          <iframe
            src={defaultJitsiUrl}
            className="h-full w-full"
            allow="camera; microphone; fullscreen; display-capture"
            referrerPolicy="no-referrer"
            title="Default Jitsi video call"
          />
        </div>
        <p className="mt-2 px-1 text-xs text-slate-600">
          This session uses a default Jitsi room linked to this session ID. Join
          the call and keep this window open to play the game together.
        </p>
      </div>
    );
  };

  const isTeacher = user.role === "Teacher";
  const disableFinishButton = finishLoading || Boolean(finishedAtIso);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
      <AppNavbar />

      <main className="flex flex-1 justify-center px-4 py-6">
        <div className="flex w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl bg-card/90 p-6 shadow-lg ring-1 ring-border">
          {/* Header */}
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Memotest – Session {sessionId.slice(0, 8)}…
              </h1>
              <p className="text-sm text-slate-700">
                Playing as <span className="font-semibold">{user.email}</span> (
                {user.role})
              </p>
              <p className="text-xs text-slate-500">
                Seed: <span className="font-mono">{stableSeed}</span>
              </p>
              <p className="text-xs text-slate-500">
                Difficulty: <span className="font-mono">{difficulty}</span>
              </p>
              {finishedAtIso && (
                <p className="text-xs text-emerald-600">
                  Session finished at:{" "}
                  <span className="font-mono">{finishedAtIso}</span>
                </p>
              )}
              {finishError && (
                <p className="text-xs text-red-500" role="alert">
                  {finishError}
                </p>
              )}
            </div>

            {isTeacher && (
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  className="border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy session ID
                    </>
                  )}
                </Button>

                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                  size="sm"
                  onClick={handleFinishSession}
                  disabled={disableFinishButton}
                >
                  {finishLoading ? "Closing session..." : "Finish session"}
                </Button>
              </div>
            )}
          </div>

          {/* Video + Game: cada uno ocupa media pantalla horizontal */}
          <div className="flex flex-1 flex-col gap-4 lg:flex-row">
            {/* Video call column */}
            <div className="flex flex-1 flex-col">
              <h2 className="text-sm font-semibold text-slate-800">
                Video call
              </h2>
              <div className="mt-2 flex flex-1 flex-col">
                {renderVideoCall()}
              </div>
            </div>

            {/* Game column */}
            <div className="flex flex-1 flex-col">
              <h2 className="text-sm font-semibold text-slate-800">
                Memotest game
              </h2>
              <div className="mt-2 flex flex-1 items-center justify-center rounded-lg border border-border bg-slate-50 p-3 lg:p-4">
                <div className="flex h-full w-full items-center justify-center">
                  <GameContainer
                    sessionId={sessionId}
                    userId={user.userId}
                    seed={stableSeed}
                    difficulty={difficulty}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check, StickyNote } from "lucide-react";

import type { Difficulty } from "@/game/phaser/types";
import GameContainer from "@/game/phaser/GameContainer";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { AppNavbar } from "@/components/layouts/AppNavbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type FinishSessionResponse = {
  sessionId: string;
  finishedAtIso: string;
};

export default function SessionPlayPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const { user, isLoading, accessToken } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [finishedAtIso, setFinishedAtIso] = useState<string | null>(null);

  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesSuccess, setNotesSuccess] = useState<string | null>(null);

  const sessionId = params.sessionId;

  const [stableSeed, setStableSeed] = useState<string>(() => sessionId);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  useEffect(() => {
    const seedParam = searchParams.get("seed");
    if (seedParam && seedParam.length > 0) {
      setStableSeed(seedParam);
    } else {
      setStableSeed(sessionId);
    }

    const difficultyParam = searchParams.get("difficulty");
    if (difficultyParam === "medium" || difficultyParam === "hard") {
      setDifficulty(difficultyParam);
    } else {
      setDifficulty("easy");
    }
  }, [searchParams, sessionId]);

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

  const isTeacher = user.role === "Teacher";
  const disableFinishButton = finishLoading || Boolean(finishedAtIso);

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

      router.push(`/sessions/${sessionId}/summary`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setFinishError(message);
    } finally {
      setFinishLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setNotesError(null);
    setNotesSuccess(null);

    if (!accessToken) {
      setNotesError("Missing access token.");
      return;
    }

    try {
      setNotesSaving(true);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const res = await fetch(`${baseUrl}/v1/sessions/${sessionId}/notes`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        console.error("patch notes error status:", res.status);
        const errBody = await res.json().catch(() => null);
        console.error("patch notes error body:", errBody);
        throw new Error("Failed to save notes");
      }

      await res.json().catch(() => null);
      setNotesSuccess("Session notes saved.");
      setNotesOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setNotesError(message);
    } finally {
      setNotesSaving(false);
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
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
      <AppNavbar />

      <main className="flex flex-1 justify-center px-4 py-6">
        <div className="flex w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl bg-card/90 p-6 shadow-lg ring-1 ring-border">
          {/* Header / acciones */}
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-medium text-slate-700">
              Session:{" "}
              <span className="font-mono text-slate-900">
                {sessionId.slice(0, 8)}…
              </span>
              {finishedAtIso && (
                <span className="ml-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Session finished
                </span>
              )}
            </div>

            {isTeacher && (
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {/* Botón notas (solo teacher) */}
                <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    >
                      <StickyNote className="mr-2 h-4 w-4" />
                      Session notes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Session notes</DialogTitle>
                      <DialogDescription>
                        These notes are only visible to you (the therapist).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[140px]"
                        placeholder="Write your observations, behavior notes, or reminders for this student..."
                      />
                      {notesError && (
                        <p className="text-sm text-red-600">{notesError}</p>
                      )}
                      {notesSuccess && (
                        <p className="text-sm text-emerald-600">
                          {notesSuccess}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNotesOpen(false)}
                        disabled={notesSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={notesSaving}
                      >
                        {notesSaving ? "Saving..." : "Save notes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Copiar session ID */}
                <Button
                  type="button"
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

                {/* Cerrar sesión */}
                <Button
                  type="button"
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

          {finishError && <p className="text-sm text-red-600">{finishError}</p>}

          {/* Layout principal: video + juego */}
          <div className="flex flex-1 flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 flex-col">
              <div className="mt-2 flex flex-1 flex-col">
                {renderVideoCall()}
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="mt-2 flex flex-1 rounded-lg border border-border bg-slate-50 p-3 lg:p-4">
                <div className="relative w-full max-w-full aspect-[4/3]">
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

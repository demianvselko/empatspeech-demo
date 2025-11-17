"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/context/auth-context";
import { AppNavbar } from "@/components/layouts/AppNavbar";
import { Button } from "@/components/ui/button";

type SessionSummary = {
  sessionId: string;
  slpId: string;
  studentId: string;
  totalTrials: number;
  correctTrials: number;
  incorrectTrials: number;
  accuracyPercent: number;
  errorPercent: number;
  notes: string[];
  createdAtIso: string;
  finishedAtIso?: string;
};

export default function SessionSummaryPage() {
  const params = useParams<{ sessionId: string }>();
  const { user, isLoading, accessToken } = useAuth();

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const sessionId = params.sessionId;

  useEffect(() => {
    if (!sessionId) return;
    if (!accessToken) return;
    if (!user || user.role !== "Teacher") return;

    const fetchSummary = async () => {
      setLoadingSummary(true);
      setError(null);
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const res = await fetch(`${baseUrl}/v1/sessions/${sessionId}/summary`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          console.error("session summary error status:", res.status);
          const errBody = await res.json().catch(() => null);
          console.error("session summary error body:", errBody);
          throw new Error("Failed to load session summary");
        }

        const data: SessionSummary = await res.json();
        setSummary(data);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Unexpected error loading summary";
        setError(msg);
      } finally {
        setLoadingSummary(false);
      }
    };

    void fetchSummary();
  }, [sessionId, accessToken, user]);

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
          <p className="text-slate-700">Checking your session...</p>
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
              You need to be logged in to view this session summary.
            </p>
            <Link href="/login">
              <Button>Go to login</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (user.role !== "Teacher") {
    return (
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
        <AppNavbar />
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="rounded-xl bg-card/90 p-6 shadow-lg ring-1 ring-border">
            <p className="text-lg font-semibold text-slate-800">
              Only teachers can view session summaries.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
      <AppNavbar />
      <main className="flex flex-1 justify-center px-4 py-6">
        <div className="flex w-full max-w-3xl flex-col gap-4 rounded-xl bg-card/90 p-6 shadow-lg ring-1 ring-border">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Session summary
              </h1>
              <p className="text-sm text-slate-600">
                Session ID: <span className="font-mono">{sessionId}</span>
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>

          {loadingSummary && (
            <div className="rounded-lg bg-slate-50 p-4 text-slate-700">
              Loading session summary...
            </div>
          )}

          {error && !loadingSummary && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {summary && !loadingSummary && !error && (
            <>
              <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Accuracy</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {summary.accuracyPercent}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Errors</span>
                  <span className="text-2xl font-bold text-rose-500">
                    {summary.errorPercent}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Trials</span>
                  <span className="text-2xl font-bold text-slate-800">
                    {summary.totalTrials}
                  </span>
                  <span className="text-xs text-slate-500">
                    {summary.correctTrials} correct · {summary.incorrectTrials}{" "}
                    incorrect
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                  Notes
                </h2>
                {summary.notes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No notes were added for this session.
                  </p>
                ) : (
                  <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-slate-800">
                    {summary.notes.map((note, idx) => (
                      <li key={`${summary.sessionId}-note-${idx}`}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

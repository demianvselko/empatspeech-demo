"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Copy, Check } from "lucide-react";

import GameContainer from "@/game/phaser/GameContainer";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export default function SessionPlayPage() {
  const params = useParams<{ sessionId: string }>();
  const { user, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const sessionId = params.sessionId;

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">sessionId in the URL is empty.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Loading session</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-900 text-slate-50">
        <p className="text-lg font-semibold">
          You need to be logged in to access this session.
        </p>
        <Link href="/login">
          <Button>Go to login</Button>
        </Link>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-5xl bg-slate-800 rounded-xl p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-slate-100">
            Memotest – Session {sessionId.slice(0, 8)}…
          </h1>

          {user.role === "Teacher" && (
            <Button
              variant="outline"
              className="bg-slate-700 text-slate-50 border-slate-500 hover:bg-slate-600"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-400" />
                  copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </>
              )}
            </Button>
          )}
        </div>

        <p className="mb-4 text-sm text-slate-300">
          Play with <span className="font-semibold">{user.email}</span> (
          {user.role})
        </p>

        <GameContainer sessionId={sessionId} userId={user.userId} />
      </div>
    </div>
  );
}

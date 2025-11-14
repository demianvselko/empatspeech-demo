"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";

import GameContainer from "@/game/phaser/GameContainer";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export default function SessionPlayPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const sessionId = params.sessionId;
  const meetingUrl = searchParams.get("meetingUrl") ?? "";
  const isGoogleMeet = meetingUrl.includes("meet.google.com");
  const hasCustomMeetingUrl = Boolean(meetingUrl);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-50">
        <p className="text-lg font-semibold">
          sessionId is missing in the URL.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-50">
        <p>Loading session...</p>
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

  const defaultJitsiUrl = `https://meet.jit.si/speech-therapy-${sessionId}`;

  const renderVideoCall = () => {
    if (hasCustomMeetingUrl) {
      if (isGoogleMeet) {
        return (
          <div className="flex flex-col items-center justify-center w-full min-h-[260px] rounded-lg border border-slate-700 bg-slate-900/60 px-4 text-center">
            <p className="text-sm text-slate-200 font-semibold mb-2">
              Google Meet cannot be embedded inside this page.
            </p>
            <p className="text-xs text-slate-400 mb-4 max-w-sm">
              For security reasons, Google Meet refuses to be loaded in an
              iframe. Open the call in a separate tab and keep this window with
              the game open.
            </p>
            <Button asChild className="bg-blue-500 hover:bg-blue-600 text-sm">
              <a href={meetingUrl} target="_blank" rel="noreferrer">
                Open call in new tab
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        );
      }

      return (
        <div className="relative w-full h-[260px] sm:h-[320px] lg:h-full min-h-[260px] rounded-lg border border-slate-700 overflow-hidden bg-black">
          <iframe
            src={meetingUrl}
            className="w-full h-full"
            allow="camera; microphone; fullscreen; display-capture"
            referrerPolicy="no-referrer"
            title="Custom embedded video call"
          />
        </div>
      );
    }

    return (
      <>
        <div className="relative w-full h-[260px] sm:h-[320px] lg:h-full min-h-[260px] rounded-lg border border-slate-700 overflow-hidden bg-black">
          <iframe
            src={defaultJitsiUrl}
            className="w-full h-full"
            allow="camera; microphone; fullscreen; display-capture"
            referrerPolicy="no-referrer"
            title="Default Jitsi video call"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2 px-1">
          This session uses a default Jitsi room linked to this session ID. The
          SLP can still share a custom call link (Meet, Zoom, Jitsi, etc.) by
          adding{" "}
          <code className="mx-1 text-[10px] bg-slate-800 px-1 py-0.5 rounded">
            ?meetingUrl=&lt;link&gt;
          </code>{" "}
          to the URL.
        </p>
      </>
    );
  };

  return (
    <div className="flex min-h-screen justify-center bg-slate-900 px-4 py-6">
      <div className="w-full max-w-7xl bg-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        {/* Header */}
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Memotest – Session {sessionId.slice(0, 8)}…
            </h1>
            <p className="text-sm text-slate-300">
              Playing as <span className="font-semibold">{user.email}</span> (
              {user.role})
            </p>
          </div>

          {user.role === "Teacher" && (
            <Button
              variant="outline"
              className="bg-slate-700 text-slate-50 border-slate-500 hover:bg-slate-600 self-start sm:self-auto"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy session ID
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Video call column */}
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-slate-200">Video call</h2>
            {renderVideoCall()}
          </div>

          {/* Game column */}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">
              Memotest game
            </h2>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60 p-3 lg:p-4 min-h-[640px]">
              <div className="w-full max-w-[900px] mx-auto flex justify-center">
                <GameContainer sessionId={sessionId} userId={user.userId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

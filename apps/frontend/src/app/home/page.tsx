"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { user, accessToken, isLoading, logout } = useAuth();

  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (!isLoading && (!user || !accessToken)) {
      router.replace("/");
    }
  }, [isLoading, user, accessToken, router]);

  if (isLoading || !user || !accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-center text-white mt-10">Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-900">
      <Card className="w-[420px] bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Hi {user.email} ({user.role})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {user.role === "Teacher" && (
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => router.push("/sessions/new")}
            >
              Create a new Session
            </Button>
          )}

          {user.role === "Student" && (
            <div className="space-y-2">
              <Label>ID Session</Label>
              <Input
                className="bg-white text-black"
                placeholder="Ej: 123e4567..."
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 mt-3"
                onClick={() =>
                  router.push(
                    `/sessions/${sessionId}/play?userId=${encodeURIComponent(
                      user.userId,
                    )}`,
                  )
                }
              >
                Join a session
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Close session
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

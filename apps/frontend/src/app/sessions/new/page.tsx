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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/auth-context";

type CreateSessionResponse = {
  sessionId: string;
  seed?: number;
  createdAtIso: string;
};

export default function NewSessionPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuth();

  const [studentEmail, setStudentEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [seed, setSeed] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateSessionResponse | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !accessToken)) {
      router.replace("/");
    }
  }, [isLoading, user, accessToken, router]);

  async function handleCreateSession() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!accessToken || !user) {
        throw new Error("No estás autenticado");
      }
      if (user.role !== "Teacher") {
        throw new Error("Solo Teachers pueden crear sesiones");
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const body = {
        studentEmail: studentEmail.trim(),
        notes: notes.trim() || undefined,
        seed: seed ? Number(seed) : undefined,
      };

      const res = await fetch(`${baseUrl}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("create session error body:", errBody);
        throw new Error("No se pudo crear la sesión");
      }

      const data = (await res.json()) as CreateSessionResponse;
      setResult(data);

      const teacherUserId = user.userId;

      router.push(
        `/sessions/${data.sessionId}/play?userId=${encodeURIComponent(
          teacherUserId,
        )}`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !user || !accessToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-200">Verificando sesión...</p>
      </main>
    );
  }

  if (user.role !== "Teacher") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md bg-slate-800 text-white border-slate-700">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              IOnly Teachers pueden crear sesiones
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full bg-slate-700 hover:bg-slate-600"
              onClick={() => router.push("/home")}
            >
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <Card className="w-full max-w-lg bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Create a new Session
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentEmail">Email student</Label>
            <Input
              id="studentEmail"
              type="email"
              placeholder="student@example.com"
              className="bg-white text-black"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seed">
              Seed (optional, for a Table with specific cards)
            </Label>
            <Input
              id="seed"
              type="number"
              className="bg-white text-black"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              className="bg-white text-black"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          {result && (
            <div className="mt-2 rounded-md bg-slate-700 p-3 text-sm space-y-1">
              <p>
                <span className="font-semibold">Session ID:</span>{" "}
                <code className="break-all">{result.sessionId}</code>
              </p>
              {result.seed !== undefined && (
                <p>
                  <span className="font-semibold">Seed:</span> {result.seed}
                </p>
              )}
              <p>
                <span className="font-semibold">Creada en:</span>{" "}
                {result.createdAtIso}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleCreateSession}
            disabled={loading}
          >
            {loading ? "Creating..." : "create session"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-200"
            onClick={() => router.push("/home")}
          >
            back to Home
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

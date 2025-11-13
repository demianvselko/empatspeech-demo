"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useSessionWs } from "@/hooks/useSessionWs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function SessionPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();

  const sessionId = params.sessionId;
  const userId = searchParams.get("userId") ?? "";

  const [noteDraft, setNoteDraft] = useState("");

  const { state, status, sendMove, sendNote, finish } = useSessionWs({
    sessionId,
    userId,
  });

  const disabled = status !== "connected" || !state;

  // Si por algún motivo no hay sessionId, evitamos el .slice y mostramos algo seguro
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Sesión no encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Falta el parámetro <code>sessionId</code> en la URL.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Sesión {sessionId.slice(0, 8)}…</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">Socket: {status}</Badge>
            {state && (
              <>
                <Badge variant="secondary">Turno: {state.currentTurn}</Badge>
                <Badge variant="secondary">{state.totalTrials} intentos</Badge>
                <Badge variant="secondary">
                  {state.accuracyPercent}% acierto
                </Badge>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Usuario actual:{" "}
            <span className="font-mono">{userId || "sin userId"}</span>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={disabled}
              onClick={() => sendMove(true)}
            >
              Jugada correcta
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              disabled={disabled}
              onClick={() => sendMove(false)}
            >
              Jugada incorrecta
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas del SLP</label>
            <Textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Observaciones de la sesión…"
              rows={3}
            />
            <Button
              variant="outline"
              disabled={status !== "connected"}
              onClick={() => sendNote(noteDraft || undefined)}
            >
              Guardar nota
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            {state?.finishedAtIso ? "Sesión finalizada" : "Sesión en curso"}
          </div>
          <Button
            variant="outline"
            disabled={disabled || Boolean(state?.finishedAtIso)}
            onClick={finish}
          >
            Terminar sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

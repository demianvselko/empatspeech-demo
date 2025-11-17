"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/auth-context";
import {
  newSessionSchema,
  type NewSessionFormValues,
} from "@/lib/validation/session";
import { PageShell } from "@/components/layouts/PageShell";

// ---------- Seed mapping ----------

const SEED_LABEL_TO_ID = {
  animals: 1,
  countries: 2,
} as const;

type SeedLabel = keyof typeof SEED_LABEL_TO_ID;
type SeedId = (typeof SEED_LABEL_TO_ID)[SeedLabel];

const SEED_ID_TO_LABEL: Record<SeedId, SeedLabel> = Object.fromEntries(
  Object.entries(SEED_LABEL_TO_ID).map(([label, id]) => [id, label]),
) as Record<SeedId, SeedLabel>;

// ---------- Types ----------

type CreateSessionResponse = {
  sessionId: string;
  seed?: number;
  createdAtIso: string;
};

export default function NewSessionPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateSessionResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<NewSessionFormValues>({
    resolver: zodResolver(newSessionSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      seed: "",
      difficulty: "easy", // 👈 default desde el front
      notes: "",
    },
  });

  useEffect(() => {
    if (!isLoading && (!user || !accessToken)) {
      router.replace("/");
    }
  }, [isLoading, user, accessToken, router]);

  const handleCreateSession = async (values: NewSessionFormValues) => {
    setServerError(null);
    setResult(null);

    try {
      if (!accessToken || !user) {
        throw new Error("You are not authenticated.");
      }
      if (user.role !== "Teacher") {
        throw new Error("Only Teachers can create sessions.");
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const seedLabelRaw = values.seed?.trim();

      const seedId =
        seedLabelRaw && seedLabelRaw in SEED_LABEL_TO_ID
          ? SEED_LABEL_TO_ID[seedLabelRaw as keyof typeof SEED_LABEL_TO_ID]
          : undefined;

      const body = {
        studentEmail: values.email.trim(),
        notes:
          values.notes && values.notes.trim().length > 0
            ? values.notes.trim()
            : undefined,
        seed: seedId,
      };

      const res = await fetch(`${baseUrl}/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("create session error status:", res.status);
        const errBody = await res.json().catch(() => null);
        console.error("create session error body:", errBody);
        throw new Error("Failed to create the session");
      }

      const data: CreateSessionResponse = await res.json();
      setResult(data);

      const seedFromBackend =
        data.seed === undefined ? "" : SEED_ID_TO_LABEL[data.seed as SeedId];

      let labelForUrl = "";
      if (seedFromBackend) {
        labelForUrl = seedFromBackend;
      } else if (seedLabelRaw && seedLabelRaw.length > 0) {
        labelForUrl = seedLabelRaw as SeedLabel;
      }

      let query = "";

      if (labelForUrl.length > 0) {
        query += `${query ? "&" : "?"}seed=${encodeURIComponent(labelForUrl)}`;
      }

      const difficulty = values.difficulty ?? "easy";
      if (difficulty) {
        query += `${query ? "&" : "?"}difficulty=${encodeURIComponent(
          difficulty,
        )}`;
      }

      router.push(`/sessions/${data.sessionId}/play${query}`);

      reset({
        email: "",
        seed: "",
        difficulty: "easy",
        notes: "",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setServerError(message);
    }
  };

  if (isLoading || !user || !accessToken) {
    return (
      <PageShell
        title="Checking your access…"
        subtitle="Please wait a moment while we verify your account."
      >
        <p className="text-sm text-slate-700">Loading...</p>
      </PageShell>
    );
  }

  if (user.role !== "Teacher") {
    return (
      <PageShell
        title="Only therapists can create sessions"
        subtitle="Ask your therapist to start the session for you."
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-700">
            You are logged in as{" "}
            <span className="font-semibold">{user.email}</span> ({user.role}).
            Only Therapist accounts can create new sessions.
          </p>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => router.push("/")}
          >
            Back to home
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Create a new speech therapy session"
      subtitle="Invite a child to a simple, focused practice session."
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(handleCreateSession)}
        noValidate
      >
        {/* Student email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-900">
            Student email<span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="student@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Seed */}
        <div className="space-y-2">
          <label htmlFor="seed" className="text-sm font-medium text-slate-900">
            Seed (optional, to control the board)
          </label>
          <select
            id="seed"
            {...register("seed")}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          >
            <option value="">Random board</option>
            {Object.entries(SEED_LABEL_TO_ID).map(([label, id]) => (
              <option key={id} value={label}>
                {label}
              </option>
            ))}
          </select>
          {errors.seed && (
            <p className="text-xs text-red-500">{errors.seed.message}</p>
          )}
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label
            htmlFor="difficulty"
            className="text-sm font-medium text-slate-900"
          >
            Board size / difficulty
          </label>
          <select
            id="difficulty"
            {...register("difficulty")}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          >
            <option value="easy">Easy (small board)</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard (larger board)</option>
          </select>
          {errors.difficulty && (
            <p className="text-xs text-red-500">{errors.difficulty.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-slate-900">
            Notes for this session (optional)
          </label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Short notes about goals, behavior, or anything important."
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-xs text-red-500">{errors.notes.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-red-500" role="alert">
            {serverError}
          </p>
        )}

        {result && (
          <div className="space-y-1 rounded-md bg-slate-100 p-3 text-xs text-slate-800">
            <p>
              <span className="font-semibold">Session ID:</span>{" "}
              <code className="break-all">{result.sessionId}</code>
            </p>
            {result.seed !== undefined && (
              <p>
                <span className="font-semibold">Seed (backend id):</span>{" "}
                {String(result.seed)}
              </p>
            )}
            <p>
              <span className="font-semibold">Created at:</span>{" "}
              {result.createdAtIso}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
          >
            Back to home
          </Button>

          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create session"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}

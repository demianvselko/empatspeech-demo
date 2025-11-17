"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layouts/PageShell";
import { useAuth } from "@/context/auth-context";

const joinSessionSchema = z.object({
  sessionLinkOrId: z
    .string()
    .min(1, "Session link or ID is required")
    .max(500, "Value is too long"),
});

type JoinSessionFormValues = z.infer<typeof joinSessionSchema>;

export default function JoinSessionPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<JoinSessionFormValues>({
    resolver: zodResolver(joinSessionSchema),
    mode: "onChange",
    defaultValues: {
      sessionLinkOrId: "",
    },
  });

  useEffect(() => {
    if (!isLoading && (!user || !accessToken)) {
      router.replace("/");
    }
  }, [isLoading, user, accessToken, router]);

  const handleJoinSession = (values: JoinSessionFormValues) => {
    setServerError(null);

    const raw = values.sessionLinkOrId.trim();

    if (!raw) {
      setServerError("Session link or ID is required.");
      return;
    }

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      router.push(raw);
      reset({ sessionLinkOrId: "" });
      return;
    }

    const sessionId = raw;
    router.push(`/sessions/${sessionId}/play`);
    reset({ sessionLinkOrId: "" });
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

  if (user.role !== "Student") {
    return (
      <PageShell
        title="Students only"
        subtitle="This page is for students joining an existing session."
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-700">
            You are logged in as{" "}
            <span className="font-semibold">{user.email}</span> ({user.role}).
            This screen is meant for student accounts joining a session created
            by their therapist.
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
      title="Join a speech therapy session"
      subtitle="Paste the link or ID your therapist shared with you."
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(handleJoinSession)}
        noValidate
      >
        <div className="space-y-2">
          <label
            htmlFor="sessionLinkOrId"
            className="text-sm font-medium text-slate-900"
          >
            Session link or ID<span className="text-red-500">*</span>
          </label>
          <Input
            id="sessionLinkOrId"
            type="text"
            placeholder="Paste the full link or session ID here"
            {...register("sessionLinkOrId")}
          />
          {errors.sessionLinkOrId && (
            <p className="text-xs text-red-500">
              {errors.sessionLinkOrId.message}
            </p>
          )}
          <p className="text-xs text-slate-600">
            You can paste the full URL your therapist sent (for example:
            https://…/sessions/&lt;id&gt;/play?seed=animals&meetingUrl=…) or
            just the session ID.
          </p>
        </div>

        {serverError && (
          <p className="text-sm text-red-500" role="alert">
            {serverError}
          </p>
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
            {isSubmitting ? "Joining..." : "Join session"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}

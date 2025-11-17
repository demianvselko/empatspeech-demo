"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useAuth } from "@/context/auth-context";
import { PageShell } from "@/components/layouts/PageShell";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "Teacher",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values);

      // Redirección según rol
      const targetPath =
        values.role === "Teacher" ? "/sessions/new" : "/sessions/join";

      router.push(targetPath);
    } catch {
      setFormError("Login failed. Please check your email and role.");
    }
  };

  return (
    <PageShell
      title="Log in to your speech practice space"
      subtitle="Therapists can create sessions, students can join with a shared link or ID."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-100">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-slate-100">
            User type
          </label>
          <select
            id="role"
            {...register("role")}
            className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-slate-500 placeholder:text-slate-500 focus:border-slate-400 focus:ring-1"
          >
            <option value="Teacher">Therapist</option>
            <option value="Student">Student</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-400">{errors.role.message}</p>
          )}
        </div>

        {formError && (
          <p className="text-sm text-red-400" role="alert">
            {formError}
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
            {isSubmitting ? "Signing in..." : "Log in"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}

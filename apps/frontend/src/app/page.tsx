"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppNavbar } from "@/components/layouts/AppNavbar";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-indigo-50 to-amber-50">
      <AppNavbar />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Speech practice sessions for children
            </h1>
            <p className="text-sm text-slate-700 sm:text-base">
              A calm, friendly space where speech therapists and children can
              connect, play simple games, and track progress over time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Teacher: puede crear sesión */}
            {!isLoading && user?.role === "Teacher" && (
              <Link href="/sessions/new">
                <Button variant="outline" size="lg">
                  Start a new session
                </Button>
              </Link>
            )}

            {/* Student: solo unirse a sesión */}
            {!isLoading && user?.role === "Student" && (
              <Link href="/sessions/join">
                <Button variant="outline" size="lg">
                  Join a session
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

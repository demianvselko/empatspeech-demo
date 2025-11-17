"use client";

import type { FC, ReactNode } from "react";
import { AppNavbar } from "./AppNavbar";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export const PageShell: FC<PageShellProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#e0f2fe,_#eef2ff)]">
      <AppNavbar />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl rounded-2xl bg-card/90 p-6 shadow-lg ring-1 ring-border">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
};

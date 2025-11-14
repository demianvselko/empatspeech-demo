"use client";

import type { AppRole, AuthUser } from "@/types/auth";

const STORAGE_KEY = "auth";

type StoredAuth = {
  accessToken: string;
  user: {
    userId: string;
    email: string;
    role: AppRole;
  };
};

export function saveAuth(accessToken: string, user: AuthUser): void {
  if (typeof window === "undefined") return;

  const payload: StoredAuth = {
    accessToken,
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  // Compatibilidad con código viejo
  localStorage.setItem("token", accessToken);
  localStorage.setItem("email", user.email);
  localStorage.setItem("role", user.role);
  localStorage.setItem("userId", user.userId);
}

export function loadAuth(): { accessToken: string; user: AuthUser } | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    return {
      accessToken: parsed.accessToken,
      user: {
        userId: parsed.user.userId,
        email: parsed.user.email,
        role: parsed.user.role,
      },
    };
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
}

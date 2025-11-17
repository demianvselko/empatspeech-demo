// apps/frontend/src/context/auth-context.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppRole, AuthState, AuthUser, JwtPayload } from "@/types/auth";
import { clearAuth, loadAuth, saveAuth } from "@/lib/auth-storage";

type LoginInput = {
  email: string;
  role: AppRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwt(token: string): JwtPayload {
  const [, payloadB64] = token.split(".");

  const normalized = payloadB64.replaceAll("-", "+").replaceAll("_", "/");
  const json = atob(normalized);
  return JSON.parse(json) as JwtPayload;
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  // Estado inicial siempre vacío (SSR y primer render del cliente)
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    user: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargamos desde localStorage SOLO en el cliente, después de hidratar
  useEffect(() => {
    const loaded = loadAuth();

    if (loaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({
        accessToken: loaded.accessToken,
        user: loaded.user,
      });
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    const res = await fetch(`${baseUrl}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        role: input.role,
      }),
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data = (await res.json()) as { accessToken: string };

    const payload = decodeJwt(data.accessToken);

    const user: AuthUser = {
      email: payload.email ?? input.email,
      role: payload.role,
      userId: payload.sub,
    };

    saveAuth(data.accessToken, user);
    setState({ accessToken: data.accessToken, user });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setState({ user: null, accessToken: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      isLoading,
      login,
      logout,
    }),
    [state.user, state.accessToken, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

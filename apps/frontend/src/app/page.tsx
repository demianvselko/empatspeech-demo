// apps/frontend/src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
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

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useAuth } from "@/context/auth-context";
import type { AppRole } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, user } = useAuth();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("Teacher");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/home");
    }
  }, [isLoading, user, router]);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    try {
      await login({ email, role });
      router.push("/home");
    } catch (err) {
      setError((err as Error).message || "Error logging in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-900">
      <Card className="w-[380px] bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-xl">Init session</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="your-email@example.com"
              className="bg-white text-black mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger className="bg-white text-black mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={handleLogin}
            disabled={loading || isLoading}
          >
            {loading || isLoading ? "Entering..." : "Enter"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

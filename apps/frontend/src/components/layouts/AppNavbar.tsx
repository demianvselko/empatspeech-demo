"use client";

import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export const AppNavbar: FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const handleClick = () => {
    if (user) {
      logout();
      router.push("/");
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logos/logo.png"
            alt="Speech practice logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-md object-contain"
            priority
          />
        </Link>

        <Button size="sm" onClick={handleClick} disabled={isLoading}>
          {user ? "Log out" : "Log in"}
        </Button>
      </nav>
    </header>
  );
};

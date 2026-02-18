"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";

const HIDDEN_PATHS: string[] = [];

export function Header() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-[var(--color-surface)]",
        "border-[var(--color-border)]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center px-[var(--space-4)]">
        <Link href="/" aria-label="집콕신혼 홈">
          <Logo size="md" />
        </Link>
      </div>
    </header>
  );
}

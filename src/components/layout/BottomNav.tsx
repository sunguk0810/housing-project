"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Map, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "홈", icon: Home, href: "/", key: "home" },
  { label: "검색", icon: Search, href: "/search", key: "search" },
  { label: "지도", icon: Map, href: "/results", key: "results" },
  { label: "비교", icon: BarChart3, href: "/compare", key: "compare", disabled: true },
  { label: "MY", icon: User, href: "/mypage", key: "mypage", disabled: true },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-1 lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        const disabled = "disabled" in item && item.disabled;

        if (disabled) {
          return (
            <span
              key={item.key}
              className="flex flex-col items-center gap-0.5 text-[10px] text-[var(--color-neutral-400)] opacity-40"
            >
              <Icon size={20} />
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10px] no-underline",
              active
                ? "font-bold text-[var(--color-brand-500)]"
                : "text-[var(--color-neutral-400)]",
            )}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export type DetailTabKey = "overview" | "budget" | "commute" | "childcare" | "safety";

interface TabDefinition {
  readonly key: DetailTabKey;
  readonly label: string;
}

const TABS: ReadonlyArray<TabDefinition> = [
  { key: "overview", label: "개요" },
  { key: "budget", label: "예산" },
  { key: "commute", label: "통근" },
  { key: "childcare", label: "보육" },
  { key: "safety", label: "안전" },
];

interface StickyTabsProps {
  activeTab: DetailTabKey;
  onTabChange: (tab: DetailTabKey) => void;
  className?: string;
}

function isValidTabKey(hash: string): hash is DetailTabKey {
  return TABS.some((t) => t.key === hash);
}

export function StickyTabs({ activeTab, onTabChange, className }: StickyTabsProps) {
  const activateTab = useCallback(
    (targetKey: DetailTabKey) => {
      onTabChange(targetKey);
      history.replaceState(null, "", `#${targetKey}`);
      document.getElementById(`tab-${targetKey}`)?.focus();
    },
    [onTabChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const currentIndex = TABS.findIndex((t) => t.key === activeTab);
      let targetKey: DetailTabKey | null = null;

      switch (e.key) {
        case "ArrowRight":
          targetKey = TABS[(currentIndex + 1) % TABS.length].key;
          break;
        case "ArrowLeft":
          targetKey = TABS[(currentIndex - 1 + TABS.length) % TABS.length].key;
          break;
        case "Home":
          targetKey = TABS[0].key;
          break;
        case "End":
          targetKey = TABS[TABS.length - 1].key;
          break;
        default:
          return;
      }

      e.preventDefault();
      activateTab(targetKey);
    },
    [activeTab, activateTab],
  );

  // Respond to browser back/forward navigation
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.slice(1);
      if (isValidTabKey(hash)) {
        onTabChange(hash);
      }
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [onTabChange]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-10 -mx-[var(--space-4)] overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)]",
        className,
      )}
      role="tablist"
      aria-label="상세 정보 탭"
    >
      <div className="flex min-w-max lg:justify-center px-[var(--space-4)]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={(e) => { e.preventDefault(); activateTab(tab.key); }}
              onKeyDown={handleKeyDown}
              className={cn(
                "relative min-h-[44px] flex-1 whitespace-nowrap px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-body-sm)] font-medium transition-colors",
                isActive
                  ? "text-[var(--color-brand-500)]"
                  : "text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]",
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-brand-500)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

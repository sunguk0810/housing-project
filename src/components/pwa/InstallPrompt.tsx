"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_install_dismissed";

/**
 * Shows a bottom banner prompting the user to install the app.
 * Only appears when the browser fires the `beforeinstallprompt` event.
 * Dismissed state persists in localStorage for 7 days.
 */
export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if previously dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const ts = Number(dismissed);
      if (Date.now() - ts < 7 * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredRef.current) return;
    const result = await deferredRef.current.prompt();
    if (result.outcome === "accepted") {
      setShow(false);
    }
    deferredRef.current = null;
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 safe-area-inset-bottom animate-in slide-in-from-bottom-4">
      <div className="mx-auto flex max-w-lg items-center gap-[var(--space-3)] border-t border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-4)] shadow-lg">
        <Download size={20} className="shrink-0 text-[var(--color-brand-500)]" />
        <div className="flex-1">
          <p className="text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)]">
            홈 화면에 추가하기
          </p>
          <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            앱처럼 바로 접근할 수 있어요
          </p>
        </div>
        <Button size="sm" onClick={handleInstall}>
          설치
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 text-[var(--color-on-surface-muted)]"
          aria-label="닫기"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

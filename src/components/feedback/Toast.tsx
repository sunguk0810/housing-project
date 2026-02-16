"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, visible, onClose, duration = 2000 }: ToastProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    if (!visible) return;

    setPhase("enter"); // eslint-disable-line react-hooks/set-state-in-effect -- sync animation phase to visibility prop
    const holdTimer = setTimeout(() => setPhase("hold"), 200);
    const exitTimer = setTimeout(() => setPhase("exit"), 200 + duration);
    const closeTimer = setTimeout(() => onClose(), 200 + duration + 150);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-[var(--space-6)] left-1/2 z-50 -translate-x-1/2",
        "rounded-[var(--radius-s7-lg)] bg-[var(--color-neutral-800)] px-[var(--space-6)] py-[var(--space-3)]",
        "text-[length:var(--text-body-sm)] text-white shadow-[var(--shadow-s7-lg)]",
      )}
      style={{
        animation:
          phase === "enter"
            ? "slideUp 200ms var(--ease-out-expo) forwards"
            : phase === "exit"
              ? "fadeOut 150ms ease forwards"
              : undefined,
      }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

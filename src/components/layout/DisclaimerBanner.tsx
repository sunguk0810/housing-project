"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { DISCLAIMER_TEXTS, SESSION_KEYS } from "@/lib/constants";

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SESSION_KEYS.disclaimerSeen);
    } catch {
      return true;
    }
  });

  function handleClose() {
    sessionStorage.setItem(SESSION_KEYS.disclaimerSeen, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="relative bg-[var(--color-brand-50)] px-[var(--space-4)] py-[var(--space-3)]"
      role="alert"
      data-disclaimer="banner"
    >
      <div className="mx-auto flex max-w-5xl items-start gap-[var(--space-3)]">
        <p className="flex-1 text-[length:var(--text-caption)] leading-[var(--text-caption-lh)] text-[var(--color-brand-800)]">
          {DISCLAIMER_TEXTS.banner}
        </p>
        <button
          onClick={handleClose}
          className="shrink-0 rounded p-1 text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)]"
          aria-label="닫기"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

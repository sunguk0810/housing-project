"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { POLICY_VERSION, SESSION_KEYS } from "@/lib/constants";
import { trackEvent } from "@/lib/tracking";
import { BlurredPreviewCard } from "./BlurredPreviewCard";
import type { ConsentState } from "@/types/ui";

interface InlineConsentProps {
  consent: ConsentState;
  onChange: (consent: ConsentState) => void;
  className?: string;
}

const CONSENT_ITEMS: ReadonlyArray<{
  key: keyof ConsentState;
  label: string;
  required: boolean;
}> = [
  { key: "terms", label: "이용약관 동의", required: true },
  { key: "privacy", label: "개인정보 처리방침 동의", required: true },
  { key: "marketing", label: "마케팅 정보 수신 동의", required: false },
];

export function InlineConsent({
  consent,
  onChange,
  className,
}: InlineConsentProps) {
  const [expanded, setExpanded] = useState(false);

  // Restore consent from session
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(SESSION_KEYS.consent);
      if (saved === "true") {
        onChange({ terms: true, privacy: true, marketing: consent.marketing });
      }
    } catch {
      // ignore
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allChecked = consent.terms && consent.privacy && consent.marketing;
  const requiredDone = consent.terms && consent.privacy;

  function handleAllChange() {
    const next = !allChecked;
    const newConsent = { terms: next, privacy: next, marketing: next };
    onChange(newConsent);
    if (next) {
      trackEvent({ name: "consent_accepted", policyVersion: POLICY_VERSION });
      sessionStorage.setItem(SESSION_KEYS.consent, "true");
    }
  }

  function handleItemChange(key: keyof ConsentState) {
    const next = { ...consent, [key]: !consent[key] };
    onChange(next);
    if (next.terms && next.privacy) {
      trackEvent({ name: "consent_accepted", policyVersion: POLICY_VERSION });
      sessionStorage.setItem(SESSION_KEYS.consent, "true");
    }
  }

  return (
    <div className={cn("space-y-[var(--space-3)]", className)}>
      {/* Blurred preview card to motivate consent */}
      {!requiredDone && <BlurredPreviewCard />}

      {/* All consent toggle */}
      <button
        type="button"
        onClick={handleAllChange}
        className={cn(
          "flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-s7-md)]",
          "border border-[var(--color-border)] px-[var(--space-4)] py-[var(--space-3)]",
          "text-left transition-colors",
          allChecked && "border-[var(--color-primary)] bg-[var(--color-brand-50)]",
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border",
            allChecked
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-[var(--color-neutral-400)]",
          )}
        >
          {allChecked && "✓"}
        </span>
        <span className="text-[length:var(--text-body-sm)] font-semibold text-[var(--color-on-surface)]">
          전체 동의
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          aria-expanded={expanded}
          aria-label="동의 항목 펼치기"
          className="ml-auto min-h-[44px] min-w-[44px] text-center text-[var(--color-on-surface-muted)]"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </button>

      {/* Individual items */}
      {expanded && (
        <div className="space-y-[var(--space-2)] pl-[var(--space-2)]">
          {CONSENT_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleItemChange(item.key)}
              className="flex w-full items-center gap-[var(--space-3)] px-[var(--space-2)] py-[var(--space-2)] text-left"
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border text-[10px]",
                  consent[item.key]
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-neutral-400)]",
                )}
              >
                {consent[item.key] && "✓"}
              </span>
              <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface)]">
                {item.required ? (
                  <span className="mr-1 text-[var(--color-error)]">[필수]</span>
                ) : (
                  <span className="mr-1 text-[var(--color-on-surface-muted)]">[선택]</span>
                )}
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

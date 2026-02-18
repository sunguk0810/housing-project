"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { POLICY_VERSION, SESSION_KEYS } from "@/lib/constants";
import { trackEvent } from "@/lib/tracking";
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

  function handleAllChange(checked: boolean) {
    const newConsent = { terms: checked, privacy: checked, marketing: checked };
    onChange(newConsent);
    if (checked) {
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
      {/* All consent toggle */}
      <div
        className={cn(
          "rounded-[var(--radius-s7-xl)] border px-[var(--space-4)] py-[var(--space-3)] transition-colors",
          "border-[var(--color-border)]",
        )}
      >
        <div className="flex items-center gap-[var(--space-3)]">
          <Checkbox
            id="consent-all"
            checked={allChecked}
            onCheckedChange={(checked) => handleAllChange(!!checked)}
          />
          <label
            htmlFor="consent-all"
            className="flex-1 cursor-pointer text-[length:var(--text-body-sm)] font-semibold text-[var(--color-on-surface)]"
          >
            전체 동의
          </label>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="동의 항목 펼치기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-on-surface-muted)] hover:bg-[var(--color-neutral-100)]"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Individual items */}
        {expanded && (
          <div className="mt-[var(--space-3)] space-y-[var(--space-2)] border-t border-[var(--color-border)] pt-[var(--space-3)]">
            {CONSENT_ITEMS.map((item) => (
              <label
                key={item.key}
                htmlFor={`consent-${item.key}`}
                className="flex cursor-pointer items-center gap-[var(--space-3)]"
              >
                <Checkbox
                  id={`consent-${item.key}`}
                  checked={consent[item.key]}
                  onCheckedChange={() => handleItemChange(item.key)}
                />
                <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface)]">
                  {item.required ? (
                    <span className="mr-1 text-[var(--color-error)]">[필수]</span>
                  ) : (
                    <span className="mr-1 text-[var(--color-on-surface-muted)]">[선택]</span>
                  )}
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

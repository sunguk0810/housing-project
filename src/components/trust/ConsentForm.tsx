"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { POLICY_VERSION } from "@/lib/constants";
import { trackEvent } from "@/lib/tracking";
import type { ConsentState } from "@/types/ui";

interface ConsentFormProps {
  consent: ConsentState;
  onChange: (consent: ConsentState) => void;
  className?: string;
}

const CONSENT_ITEMS: Array<{
  key: keyof ConsentState;
  label: string;
  required: boolean;
  description: string;
}> = [
  {
    key: "terms",
    label: "이용약관 동의",
    required: true,
    description: "서비스 이용을 위한 필수 약관입니다.",
  },
  {
    key: "privacy",
    label: "개인정보 처리방침 동의",
    required: true,
    description: "개인정보 처리에 관한 필수 동의입니다.",
  },
  {
    key: "marketing",
    label: "마케팅 정보 수신 동의",
    required: false,
    description: "선택 사항이며, 동의하지 않아도 서비스를 이용할 수 있습니다.",
  },
];

export function ConsentForm({ consent, onChange, className }: ConsentFormProps) {
  function handleChange(key: keyof ConsentState, checked: boolean) {
    const next = { ...consent, [key]: checked };
    onChange(next);

    if (next.terms && next.privacy) {
      trackEvent({ name: "consent_accepted", policyVersion: POLICY_VERSION });
    }
  }

  function handleAllChange(checked: boolean) {
    onChange({ terms: checked, privacy: checked, marketing: checked });
    if (checked) {
      trackEvent({ name: "consent_accepted", policyVersion: POLICY_VERSION });
    }
  }

  const allChecked = consent.terms && consent.privacy && consent.marketing;

  return (
    <div className={cn("space-y-[var(--space-3)]", className)} data-testid="consent-form">
      {/* Select all */}
      <label className="flex items-center gap-[var(--space-3)] cursor-pointer">
        <Checkbox
          checked={allChecked}
          onCheckedChange={(checked) => handleAllChange(checked === true)}
        />
        <span className="text-[length:var(--text-body)] font-semibold text-[var(--color-on-surface)]">
          전체 동의
        </span>
      </label>

      <hr className="border-[var(--color-border)]" />

      {CONSENT_ITEMS.map((item) => (
        <label key={item.key} className="flex items-start gap-[var(--space-3)] cursor-pointer">
          <Checkbox
            checked={consent[item.key]}
            onCheckedChange={(checked) => handleChange(item.key, checked === true)}
            className="mt-0.5"
          />
          <div>
            <span className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface)]">
              {item.required && (
                <span className="mr-1 text-[var(--color-error)]">[필수]</span>
              )}
              {!item.required && (
                <span className="mr-1 text-[var(--color-on-surface-muted)]">[선택]</span>
              )}
              {item.label}
            </span>
            <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              {item.description}
            </p>
          </div>
        </label>
      ))}
    </div>
  );
}

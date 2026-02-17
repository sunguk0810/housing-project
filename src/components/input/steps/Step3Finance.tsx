"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { AmountField, QUICK_BUTTONS } from "@/components/onboarding/AmountField";
import { CustomKeypad } from "@/components/onboarding/CustomKeypad";
import { InlineConsent } from "@/components/onboarding/InlineConsent";
import type { ConsentState } from "@/types/ui";

interface Step3Props {
  cash: number;
  income: number;
  loans: number;
  monthlyBudget: number;
  onCashChange: (value: number) => void;
  onIncomeChange: (value: number) => void;
  onLoansChange: (value: number) => void;
  onMonthlyBudgetChange: (value: number) => void;
  consent: ConsentState;
  onConsentChange: (consent: ConsentState) => void;
  /** Notify parent when keypad opens/closes */
  onKeypadToggle?: (open: boolean) => void;
}

type FieldKey = "cash" | "income" | "loans" | "monthlyBudget";

interface FieldConfig {
  key: FieldKey;
  label: string;
  exceptionLabel?: string;
}

const FIELDS: readonly FieldConfig[] = [
  { key: "cash", label: "보유 자산 (현금성)" },
  { key: "income", label: "월 가구 소득", exceptionLabel: "현재 소득이 없어요" },
  { key: "loans", label: "월 대출 상환액", exceptionLabel: "대출이 없어요" },
  { key: "monthlyBudget", label: "월 주거비 예산" },
];

export function Step3Finance({
  cash,
  income,
  loans,
  monthlyBudget,
  onCashChange,
  onIncomeChange,
  onLoansChange,
  onMonthlyBudgetChange,
  consent,
  onConsentChange,
  onKeypadToggle,
}: Step3Props) {
  const [activeField, setActiveField] = useState<FieldKey>("cash");
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [exceptions, setExceptions] = useState<Record<string, boolean>>({});

  const values = useMemo<Record<FieldKey, number>>(
    () => ({ cash, income, loans, monthlyBudget }),
    [cash, income, loans, monthlyBudget],
  );
  const setters = useMemo<Record<FieldKey, (v: number) => void>>(
    () => ({
      cash: onCashChange,
      income: onIncomeChange,
      loans: onLoansChange,
      monthlyBudget: onMonthlyBudgetChange,
    }),
    [onCashChange, onIncomeChange, onLoansChange, onMonthlyBudgetChange],
  );

  // Notify parent of keypad state
  useEffect(() => {
    onKeypadToggle?.(keypadOpen);
  }, [keypadOpen, onKeypadToggle]);

  function handleFieldFocus(key: FieldKey) {
    setActiveField(key);
    setKeypadOpen(true);
  }

  function handleDone() {
    setKeypadOpen(false);
  }

  const handleDigit = useCallback(
    (digit: string) => {
      if (exceptions[activeField]) return;
      const current = values[activeField].toString();
      const next = current === "0" ? digit : current + digit;
      const num = parseInt(next, 10);
      if (!isNaN(num)) setters[activeField](num);
    },
    [activeField, values, setters, exceptions],
  );

  const handleDoubleZero = useCallback(() => {
    if (exceptions[activeField]) return;
    const current = values[activeField].toString();
    if (current === "0") return;
    const next = current + "00";
    const num = parseInt(next, 10);
    if (!isNaN(num)) setters[activeField](num);
  }, [activeField, values, setters, exceptions]);

  const handleBackspace = useCallback(() => {
    if (exceptions[activeField]) {
      setExceptions((prev) => ({ ...prev, [activeField]: false }));
      return;
    }
    const current = values[activeField].toString();
    const next = current.length > 1 ? current.slice(0, -1) : "0";
    setters[activeField](parseInt(next, 10));
  }, [activeField, values, setters, exceptions]);

  function handleException(key: FieldKey) {
    setExceptions((prev) => ({ ...prev, [key]: true }));
    setters[key](0);
  }

  function handleQuickAdd(amount: number) {
    if (exceptions[activeField]) return;
    setters[activeField](values[activeField] + amount);
  }

  return (
    <div className={cn("space-y-[var(--space-6)]", keypadOpen ? "pb-[320px]" : "pb-24")}>
      <TrustBadge variant="full" />

      {/* Amount fields */}
      <div className="space-y-[var(--space-4)]">
        {FIELDS.map((field) => (
          <AmountField
            key={field.key}
            label={field.label}
            value={values[field.key]}
            active={activeField === field.key}
            onFocus={() => handleFieldFocus(field.key)}
            exceptionLabel={field.exceptionLabel}
            onException={
              field.exceptionLabel
                ? () => handleException(field.key)
                : undefined
            }
            isException={exceptions[field.key]}
            compact={keypadOpen}
          />
        ))}
      </div>

      {/* Inline Consent */}
      <InlineConsent consent={consent} onChange={onConsentChange} />

      <TrustBadge variant="mini" />

      {/* Keypad slide-up panel */}
      <div
        className={cn(
          "fixed bottom-14 left-0 right-0 z-20",
          "border-t border-[var(--color-border)] bg-[var(--color-surface)]",
          "transition-transform duration-300 ease-out",
          "lg:bottom-0",
          keypadOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto max-w-lg px-[var(--space-4)] pb-[var(--space-2)] pt-[var(--space-2)]">
          {/* "완료" button — top right */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDone}
              className={cn(
                "min-h-[44px] px-[var(--space-3)] py-[var(--space-1)]",
                "text-[length:var(--text-body-sm)] font-medium text-[var(--color-primary)]",
              )}
            >
              완료
            </button>
          </div>

          {/* Quick add buttons */}
          <div className="mb-[var(--space-2)] flex gap-[var(--space-2)]">
            {QUICK_BUTTONS.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => handleQuickAdd(btn.value)}
                className={cn(
                  "flex-1 rounded-[var(--radius-s7-md)] border border-[var(--color-border)]",
                  "min-h-[36px] text-[length:var(--text-caption)] font-medium",
                  "text-[var(--color-on-surface)] transition-colors",
                  "hover:bg-[var(--color-surface-sunken)]",
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <CustomKeypad
            onDigit={handleDigit}
            onDoubleZero={handleDoubleZero}
            onBackspace={handleBackspace}
          />
        </div>
      </div>
    </div>
  );
}

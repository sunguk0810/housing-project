"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmountField } from "@/components/onboarding/AmountField";
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
  onKeypadToggle?: (open: boolean) => void;
}

type FieldKey = "cash" | "income" | "loans" | "monthlyBudget";

const FIELD_MAX: Record<FieldKey, number> = {
  cash: 5_000_000,
  income: 1_000_000,
  loans: 5_000_000,
  monthlyBudget: 10_000,
};

interface FieldConfig {
  key: FieldKey;
  label: string;
  exceptionLabel?: string;
}

interface QuickButton {
  label: string;
  value: number;
}

const FIELD_QUICK_BUTTONS: Record<FieldKey, readonly QuickButton[]> = {
  cash: [
    { label: "+100만", value: 100 },
    { label: "+500만", value: 500 },
    { label: "+1,000만", value: 1000 },
    { label: "+5,000만", value: 5000 },
    { label: "+1억", value: 10000 },
  ],
  income: [
    { label: "+50만", value: 50 },
    { label: "+100만", value: 100 },
    { label: "+300만", value: 300 },
    { label: "+500만", value: 500 },
  ],
  loans: [
    { label: "+10만", value: 10 },
    { label: "+50만", value: 50 },
    { label: "+100만", value: 100 },
    { label: "+200만", value: 200 },
  ],
  monthlyBudget: [
    { label: "+10만", value: 10 },
    { label: "+30만", value: 30 },
    { label: "+50만", value: 50 },
    { label: "+100만", value: 100 },
  ],
};

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
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
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

  useEffect(() => {
    onKeypadToggle?.(keypadOpen);
  }, [keypadOpen, onKeypadToggle]);

  /* Bug fix: auto-clear exception when user taps the field */
  function handleFieldFocus(key: FieldKey) {
    if (exceptions[key]) {
      setExceptions((prev) => ({ ...prev, [key]: false }));
    }
    setActiveField(key);
    setKeypadOpen(true);
  }

  function handleDone() {
    setKeypadOpen(false);
    setActiveField(null);
  }

  const handleDigit = useCallback(
    (digit: string) => {
      if (!activeField || exceptions[activeField]) return;
      const current = values[activeField].toString();
      const next = current === "0" ? digit : current + digit;
      const num = parseInt(next, 10);
      if (!isNaN(num)) setters[activeField](Math.min(num, FIELD_MAX[activeField]));
    },
    [activeField, values, setters, exceptions],
  );

  const handleDoubleZero = useCallback(() => {
    if (!activeField || exceptions[activeField]) return;
    const current = values[activeField].toString();
    if (current === "0") return;
    const next = current + "00";
    const num = parseInt(next, 10);
    if (!isNaN(num)) setters[activeField](Math.min(num, FIELD_MAX[activeField]));
  }, [activeField, values, setters, exceptions]);

  const handleBackspace = useCallback(() => {
    if (!activeField) return;
    if (exceptions[activeField]) {
      setExceptions((prev) => ({ ...prev, [activeField]: false }));
      return;
    }
    const current = values[activeField].toString();
    const next = current.length > 1 ? current.slice(0, -1) : "0";
    setters[activeField](parseInt(next, 10));
  }, [activeField, values, setters, exceptions]);

  /* Bidirectional toggle: Switch ON → set exception, Switch OFF → clear exception */
  function handleExceptionToggle(key: FieldKey, checked: boolean) {
    if (checked) {
      setExceptions((prev) => ({ ...prev, [key]: true }));
      setters[key](0);
      if (activeField === key) {
        setKeypadOpen(false);
        setActiveField(null);
      }
    } else {
      setExceptions((prev) => ({ ...prev, [key]: false }));
      setActiveField(key);
      setKeypadOpen(true);
    }
  }

  function handleQuickAdd(amount: number) {
    if (!activeField || exceptions[activeField]) return;
    setters[activeField](Math.min(values[activeField] + amount, FIELD_MAX[activeField]));
  }

  return (
    <div className="space-y-[var(--space-4)]">
      {/* Privacy inline note */}
      <p className="flex items-center gap-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        <Lock size={12} className="shrink-0" />
        입력 정보는 저장되지 않으며, 분석 후 즉시 폐기됩니다.
      </p>

      {/* Amount fields — compact list */}
      <div className="space-y-[var(--space-2)]">
        {FIELDS.map((field) => (
          <AmountField
            key={field.key}
            label={field.label}
            value={values[field.key]}
            active={activeField === field.key}
            onFocus={() => handleFieldFocus(field.key)}
            exceptionLabel={field.exceptionLabel}
            onExceptionToggle={
              field.exceptionLabel
                ? (checked: boolean) => handleExceptionToggle(field.key, checked)
                : undefined
            }
            isException={exceptions[field.key]}
          />
        ))}
      </div>

      {/* Inline Consent — compact */}
      <InlineConsent consent={consent} onChange={onConsentChange} />

      {/* Keypad slide-up panel */}
      {keypadOpen && (
      <div
        className={cn(
          "fixed bottom-14 left-0 right-0 z-20",
          "border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
          "animate-[slideUp_200ms_var(--ease-out-expo)]",
          "lg:bottom-0",
        )}
      >
        <div className="mx-auto max-w-lg px-[var(--space-4)] pt-[var(--space-2)] pb-[var(--space-2)]">
          {/* Quick buttons + 완료 */}
          <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
            <div className="flex flex-1 items-center gap-[var(--space-1)] overflow-x-auto scrollbar-none">
              {activeField &&
                FIELD_QUICK_BUTTONS[activeField].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleQuickAdd(btn.value)}
                    className={cn(
                      "shrink-0 rounded-[var(--radius-s7-full)]",
                      "border border-[var(--color-brand-400)] bg-[var(--color-surface)]",
                      "min-h-[36px] px-[var(--space-3)] text-[length:var(--text-caption)] font-semibold",
                      "text-[var(--color-brand-500)] transition-colors",
                      "active:bg-[var(--color-brand-50)]",
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={handleDone}
              className={cn(
                "shrink-0 min-h-[36px] rounded-[var(--radius-s7-full)] px-[var(--space-4)]",
                "bg-[var(--color-brand-500)] text-[length:var(--text-caption)] font-semibold text-white",
                "transition-colors hover:bg-[var(--color-brand-600)]",
              )}
            >
              완료
            </button>
          </div>

          <CustomKeypad
            onDigit={handleDigit}
            onDoubleZero={handleDoubleZero}
            onBackspace={handleBackspace}
          />
        </div>
      </div>
      )}
    </div>
  );
}

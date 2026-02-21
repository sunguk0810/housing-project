"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmountField } from "@/components/onboarding/AmountField";
import { CustomKeypad } from "@/components/onboarding/CustomKeypad";
import { InlineConsent } from "@/components/onboarding/InlineConsent";
import { calculateBudget } from "@/lib/engines/budget";
import { formatPrice } from "@/lib/format";
import type { ConsentState } from "@/types/ui";
import type { BudgetProfileKey, LoanProgramKey } from "@/types/engine";
import type { DesiredAreaKey } from "@/types/api";

const AREA_OPTIONS: readonly { key: DesiredAreaKey; label: string }[] = [
  { key: "small", label: "10평대 (≤49㎡)" },
  { key: "medium", label: "20평대 (50~69㎡)" },
  { key: "large", label: "30평대+ (70㎡~)" },
];

interface Step3Props {
  cash: number;
  income: number;
  onCashChange: (value: number) => void;
  onIncomeChange: (value: number) => void;
  consent: ConsentState;
  onConsentChange: (consent: ConsentState) => void;
  onKeypadToggle?: (open: boolean) => void;
  tradeType?: "sale" | "jeonse" | "monthly";
  budgetProfile: BudgetProfileKey;
  loanProgram: LoanProgramKey;
  desiredAreas: readonly DesiredAreaKey[];
  onDesiredAreasChange: (areas: DesiredAreaKey[]) => void;
}

type FieldKey = "cash" | "income";

const FIELD_MAX: Record<FieldKey, number> = {
  cash: 5_000_000,
  income: 1_200_000,
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
    { label: "+500만", value: 500 },
    { label: "+1,000만", value: 1000 },
    { label: "+3,000만", value: 3000 },
    { label: "+5,000만", value: 5000 },
    { label: "+1억", value: 10000 },
  ],
};

const FIELDS: readonly FieldConfig[] = [
  { key: "cash", label: "보유 자산 (현금성)" },
  { key: "income", label: "연 가구 소득", exceptionLabel: "현재 소득이 없어요" },
];

export function Step3Finance({
  cash,
  income,
  onCashChange,
  onIncomeChange,
  consent,
  onConsentChange,
  onKeypadToggle,
  tradeType,
  budgetProfile,
  loanProgram,
  desiredAreas,
  onDesiredAreasChange,
}: Step3Props) {
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [exceptions, setExceptions] = useState<Record<string, boolean>>({});

  const values = useMemo<Record<FieldKey, number>>(
    () => ({ cash, income }),
    [cash, income],
  );
  const setters = useMemo<Record<FieldKey, (v: number) => void>>(
    () => ({
      cash: onCashChange,
      income: onIncomeChange,
    }),
    [onCashChange, onIncomeChange],
  );

  const budgetPreview = useMemo(() => {
    if (cash === 0 && income === 0) return null;
    const result = calculateBudget({
      cash,
      income,
      loans: 0,
      monthlyBudget: 0,
      tradeType: tradeType ?? "sale",
      budgetProfile,
      loanProgram,
    });
    return result.maxPrice;
  }, [cash, income, tradeType, budgetProfile, loanProgram]);

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

  /* Bidirectional toggle: Switch ON -> set exception, Switch OFF -> clear exception */
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

      {/* Budget preview */}
      {budgetPreview != null && budgetPreview > 0 && (
        <div className="rounded-[var(--radius-s4-md)] bg-[var(--color-brand-50)] px-[var(--space-4)] py-[var(--space-3)]">
          <p className="text-[length:var(--text-body)] font-medium text-[var(--color-brand-600)]">
            예상 가능 예산: 약 {formatPrice(budgetPreview)}
          </p>
        </div>
      )}

      {/* Desired area selection chips */}
      <div className="space-y-[var(--space-2)]">
        <p className="text-[length:var(--text-body)] font-medium text-[var(--color-on-surface)]">
          원하는 평수 (복수 선택 가능)
        </p>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {AREA_OPTIONS.map((opt) => {
            const selected = desiredAreas.includes(opt.key);
            const isLastSelected = selected && desiredAreas.length === 1;
            return (
              <button
                key={opt.key}
                type="button"
                aria-pressed={selected}
                disabled={isLastSelected}
                onClick={() => {
                  if (isLastSelected) return;
                  const next = selected
                    ? desiredAreas.filter((k) => k !== opt.key)
                    : [...desiredAreas, opt.key];
                  onDesiredAreasChange(next as DesiredAreaKey[]);
                }}
                className={cn(
                  "rounded-[var(--radius-s7-full)] border px-[var(--space-3)] py-[var(--space-2)]",
                  "text-[length:var(--text-caption)] font-medium transition-colors",
                  selected
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface-muted)]",
                  isLastSelected && "cursor-not-allowed opacity-60",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
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
          {/* Quick buttons + done */}
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

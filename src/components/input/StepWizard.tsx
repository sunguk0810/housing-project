"use client";

import { Fragment, useState, useCallback } from "react";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEP_DEFINITIONS, SESSION_KEYS } from "@/lib/constants";
import { trackEvent } from "@/lib/tracking";
import { useStepForm } from "@/hooks/useStepForm";
import { ConsentForm } from "@/components/trust/ConsentForm";
import { Step1TradeChild } from "./steps/Step1TradeChild";
import { Step2Jobs } from "./steps/Step2Jobs";
import { Step3Income } from "./steps/Step3Income";
import { Step4Loans } from "./steps/Step4Loans";
import { Step5Analysis } from "./steps/Step5Analysis";
import type { ConsentState } from "@/types/ui";

export function StepWizard() {
  const {
    form,
    currentStep,
    goNext,
    goPrev,
    goToStep,
    isFirstStep,
    isLastInputStep,
    isAnalysisStep,
  } = useStepForm();

  const [consent, setConsent] = useState<ConsentState>({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [consentDone, setConsentDone] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_KEYS.consent) === "true";
  });

  const { watch, setValue, formState: { errors } } = form;
  const values = watch();

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return !!values.tradeType;
      case 2:
        return values.job1.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, values]);

  function handleNext() {
    if (currentStep < 5) {
      trackEvent({ name: "step_complete", step: currentStep });
    }
    goNext();
  }

  // C2: Step0 consent screen
  if (!consentDone) {
    return (
      <div className="mx-auto max-w-lg px-[var(--space-4)] py-[var(--space-6)]">
        <h2 className="mb-[var(--space-4)] text-[length:var(--text-title)] font-semibold">
          시작하기 전에
        </h2>
        <ConsentForm consent={consent} onChange={setConsent} />
        <button
          type="button"
          disabled={!consent.terms || !consent.privacy}
          onClick={() => {
            sessionStorage.setItem(SESSION_KEYS.consent, "true");
            setConsentDone(true);
          }}
          className="mt-[var(--space-6)] w-full rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] py-[var(--space-3)] text-[var(--color-on-primary)] disabled:opacity-40"
        >
          동의하고 시작
        </button>
      </div>
    );
  }

  if (isAnalysisStep) {
    return <Step5Analysis formData={values} onGoPrev={goPrev} />;
  }

  return (
    <div className="mx-auto max-w-lg px-[var(--space-4)] py-[var(--space-6)] pb-24">
      {/* C3: Numbered step bar + B2: a11y group */}
      <div
        role="group"
        aria-label={`온보딩 진행 (4단계 중 ${currentStep}단계)`}
        className="mb-[var(--space-6)]"
      >
        <div className="flex items-center justify-center gap-[var(--space-1)]">
          {STEP_DEFINITIONS.slice(0, 4).map((step, i) => (
            <Fragment key={step.step}>
              {i > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-6",
                    currentStep > i
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-neutral-300)]",
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => currentStep > step.step ? goToStep(step.step) : undefined}
                disabled={currentStep <= step.step}
                aria-current={currentStep === step.step ? "step" : undefined}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  currentStep === step.step
                    ? "bg-[var(--color-primary)] text-white"
                    : currentStep > step.step
                      ? "bg-[var(--color-brand-100)] text-[var(--color-primary)] hover:bg-[var(--color-brand-200)]"
                      : "bg-[var(--color-neutral-200)] text-[var(--color-neutral-400)] cursor-default",
                )}
              >
                {currentStep > step.step ? "\u2713" : step.step}
              </button>
            </Fragment>
          ))}
        </div>
        <p className="mt-[var(--space-2)] text-center text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {STEP_DEFINITIONS[currentStep - 1]?.title}
        </p>
      </div>

      {/* Step header */}
      <div className="mb-[var(--space-6)]">
        <h2 className="text-[length:var(--text-title)] font-semibold">
          {STEP_DEFINITIONS[currentStep - 1]?.title}
        </h2>
        <p className="mt-1 text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          {STEP_DEFINITIONS[currentStep - 1]?.description}
        </p>
      </div>

      {/* Step content */}
      <div className="mb-[var(--space-8)]">
        {currentStep === 1 && (
          <Step1TradeChild
            tradeType={values.tradeType}
            childPlan={values.childPlan}
            onTradeTypeChange={(v) => setValue("tradeType", v)}
            onChildPlanChange={(v) => setValue("childPlan", v)}
          />
        )}
        {currentStep === 2 && (
          <Step2Jobs
            job1={values.job1}
            job2={values.job2}
            onJob1Change={(v) => setValue("job1", v)}
            onJob2Change={(v) => setValue("job2", v)}
            job1Error={errors.job1?.message}
          />
        )}
        {currentStep === 3 && (
          <Step3Income
            cash={values.cash}
            income={values.income}
            onCashChange={(v) => setValue("cash", v)}
            onIncomeChange={(v) => setValue("income", v)}
            cashError={errors.cash?.message}
            incomeError={errors.income?.message}
          />
        )}
        {currentStep === 4 && (
          <Step4Loans
            loans={values.loans}
            monthlyBudget={values.monthlyBudget}
            weightProfile={values.weightProfile}
            onLoansChange={(v) => setValue("loans", v)}
            onMonthlyBudgetChange={(v) => setValue("monthlyBudget", v)}
            onWeightProfileChange={(v) => setValue("weightProfile", v)}
            loansError={errors.loans?.message}
            monthlyBudgetError={errors.monthlyBudget?.message}
          />
        )}
      </div>

      {/* C5: Bottom CTA bar with safe area padding */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg items-center gap-[var(--space-3)]">
          {!isFirstStep && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="이전 단계로"
              className="flex items-center gap-1 rounded-[var(--radius-s7-md)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-sunken)]"
            >
              <ChevronLeft size={16} />
              이전
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            aria-label={isLastInputStep ? "분석 시작하기" : "다음 단계로"}
            className={cn(
              "ml-auto flex items-center gap-[var(--space-2)] rounded-[var(--radius-s7-md)]",
              "px-[var(--space-6)] py-[var(--space-3)] font-medium transition-colors",
              canProceed()
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)]"
                : "cursor-not-allowed bg-[var(--color-neutral-200)] text-[var(--color-neutral-400)]",
            )}
          >
            {isLastInputStep ? "분석 시작" : "다음"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

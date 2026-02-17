'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { SESSION_KEYS } from '@/lib/constants';
import { trackEvent } from '@/lib/tracking';
import { useStepForm } from '@/hooks/useStepForm';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { BottomCTA } from '@/components/onboarding/BottomCTA';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2Workplace } from './steps/Step2Workplace';
import { Step3Finance } from './steps/Step3Finance';
import { Step4Priorities } from './steps/Step4Priorities';
import { Step5Loading } from './steps/Step5Loading';
import type { ConsentState } from '@/types/ui';

export function StepWizard() {
  const { form, currentStep, goNext, goPrev, isFirstStep, isLastInputStep, isAnalysisStep } =
    useStepForm();

  const [consent, setConsent] = useState<ConsentState>(() => {
    if (typeof window === 'undefined') return { terms: false, privacy: false, marketing: false };
    const saved = sessionStorage.getItem(SESSION_KEYS.consent);
    return saved === 'true'
      ? { terms: true, privacy: true, marketing: false }
      : { terms: false, privacy: false, marketing: false };
  });

  const [keypadOpen, setKeypadOpen] = useState(false);

  const { watch, setValue } = form;
  const values = watch();

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return !!values.tradeType && !!values.marriagePlannedAt;
      case 2:
        return values.job1.length > 0 || values.job1Remote;
      case 3:
        return consent.terms && consent.privacy;
      case 4:
        return (
          !!values.childPlan &&
          values.livingAreas.length >= 1 &&
          Object.values(values.priorityWeights).some((value) => value > 0)
        );
      default:
        return false;
    }
  }, [currentStep, values, consent]);

  const handleKeypadToggle = useCallback((open: boolean) => {
    setKeypadOpen(open);
  }, []);

  function handleNext() {
    if (currentStep < 5) {
      trackEvent({ name: 'step_complete', step: currentStep });
    }
    goNext();
  }

  // Step 5: Loading (full screen, no chrome)
  if (isAnalysisStep) {
    return <Step5Loading formData={values} onGoPrev={goPrev} />;
  }

  return (
    <div className="mx-auto max-w-lg px-[var(--space-4)] py-[var(--space-6)] pb-24">
      {/* Progress bar */}
      <ProgressBar currentStep={currentStep} totalSteps={4} className="mb-[var(--space-6)]" />

      {/* Step title */}
      <div className="mb-[var(--space-6)]">
        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {currentStep} / 4
        </p>
      </div>

      {/* Step content with fade transition */}
      <div
        key={currentStep}
        className={cn('mb-[var(--space-8)]', 'animate-[fadeSlideIn_300ms_ease-out]')}
      >
        {currentStep === 1 && (
          <Step1BasicInfo
            tradeType={values.tradeType}
            marriagePlannedAt={values.marriagePlannedAt}
            onTradeTypeChange={(v) => setValue('tradeType', v)}
            onMarriagePlannedAtChange={(v) => setValue('marriagePlannedAt', v)}
            onAutoAdvance={handleNext}
          />
        )}
        {currentStep === 2 && (
          <Step2Workplace
            job1={values.job1}
            job2={values.job2}
            job1Remote={values.job1Remote}
            job2Remote={values.job2Remote}
            onJob1Change={(v) => setValue('job1', v)}
            onJob2Change={(v) => setValue('job2', v)}
            onJob1RemoteChange={(v) => setValue('job1Remote', v)}
            onJob2RemoteChange={(v) => setValue('job2Remote', v)}
          />
        )}
        {currentStep === 3 && (
          <Step3Finance
            cash={values.cash}
            income={values.income}
            loans={values.loans}
            monthlyBudget={values.monthlyBudget}
            onCashChange={(v) => setValue('cash', v)}
            onIncomeChange={(v) => setValue('income', v)}
            onLoansChange={(v) => setValue('loans', v)}
            onMonthlyBudgetChange={(v) => setValue('monthlyBudget', v)}
            consent={consent}
            onConsentChange={setConsent}
            onKeypadToggle={handleKeypadToggle}
          />
        )}
        {currentStep === 4 && (
          <Step4Priorities
            priorityWeights={values.priorityWeights}
            livingAreas={values.livingAreas}
            childPlan={values.childPlan}
            onPriorityWeightsChange={(v) => setValue('priorityWeights', v)}
            onLivingAreasChange={(v) => setValue('livingAreas', v)}
            onChildPlanChange={(v) => setValue('childPlan', v)}
          />
        )}
      </div>

      {/* Bottom CTA — hidden for Step 1 (auto-advance) */}
      {currentStep !== 1 && (
        <BottomCTA
          label={isLastInputStep ? '분석 시작' : '다음'}
          disabled={!canProceed()}
          onClick={handleNext}
          showBack={!isFirstStep}
          onBack={goPrev}
          className={cn(
            'transition-opacity duration-200',
            currentStep === 3 && keypadOpen ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
        />
      )}

      {/* Step 1: back/next for when user returns via back button */}
      {currentStep === 1 && values.marriagePlannedAt && (
        <BottomCTA label="다음" disabled={!canProceed()} onClick={handleNext} showBack={false} />
      )}

    </div>
  );
}

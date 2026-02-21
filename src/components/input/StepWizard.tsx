'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

const DEFAULT_CONSENT: ConsentState = { terms: false, privacy: false, marketing: false };

export function StepWizard() {
  const router = useRouter();
  const { form, currentStep, goNext, goPrev, isFirstStep, isLastInputStep, isAnalysisStep } =
    useStepForm();

  const [consent, setConsent] = useState<ConsentState>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(SESSION_KEYS.consent);
      if (saved === 'true') {
        return { terms: true, privacy: true, marketing: false };
      }
    }
    return DEFAULT_CONSENT;
  });

  const [keypadOpen, setKeypadOpen] = useState(false);

  const { watch, setValue } = form;
  const values = watch();

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return !!values.tradeType;
      case 2:
        return values.job1.length > 0 || values.job1Remote;
      case 3:
        return consent.terms && consent.privacy && values.desiredAreas.length >= 1;
      case 4:
        return !!values.weightProfile;
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
    if (isLastInputStep) {
      trackEvent({ name: 'min_input_complete' });
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
            budgetProfile={values.budgetProfile}
            loanProgram={values.loanProgram}
            onTradeTypeChange={(v) => setValue('tradeType', v)}
            onBudgetProfileChange={(v) => setValue('budgetProfile', v)}
            onLoanProgramChange={(v) => setValue('loanProgram', v)}
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
            onCashChange={(v) => setValue('cash', v)}
            onIncomeChange={(v) => setValue('income', v)}
            consent={consent}
            onConsentChange={setConsent}
            onKeypadToggle={handleKeypadToggle}
            tradeType={values.tradeType}
            budgetProfile={values.budgetProfile}
            loanProgram={values.loanProgram}
            desiredAreas={values.desiredAreas}
            onDesiredAreasChange={(v) => setValue('desiredAreas', v)}
          />
        )}
        {currentStep === 4 && (
          <Step4Priorities
            weightProfile={values.weightProfile}
            onWeightProfileChange={(v) => setValue('weightProfile', v)}
          />
        )}
      </div>

      {/* Bottom CTA — always visible with back/next */}
      <BottomCTA
        label={isLastInputStep ? '분석 시작' : '다음'}
        disabled={!canProceed()}
        onClick={handleNext}
        showBack
        onBack={isFirstStep ? () => router.back() : goPrev}
        className={cn(
          'transition-opacity duration-200',
          currentStep === 3 && keypadOpen ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      />

    </div>
  );
}

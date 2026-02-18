'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SESSION_KEYS } from '@/lib/constants';
import { prioritiesToPriorityWeights, priorityWeightsToWeightProfile } from '@/lib/priorities';
import type { PriorityWeights } from '@/types/ui';

const FORM_SCHEMA_VERSION = 3;

const stepFormSchema = z.object({
  tradeType: z.enum(['sale', 'jeonse', 'monthly']).optional(),
  marriagePlannedAt: z.enum(['within_6m', 'within_1y', 'undecided']).optional(),
  childPlan: z.enum(['yes', 'maybe', 'no']).optional(),
  job1: z.string(),
  job2: z.string(),
  job1Remote: z.boolean(),
  job2Remote: z.boolean(),
  cash: z.number().int().min(0).max(5_000_000),
  income: z.number().int().min(0).max(1_000_000),
  loans: z.number().int().min(0).max(5_000_000),
  monthlyBudget: z.number().int().min(0).max(10_000),
  weightProfile: z.enum(['balanced', 'budget_focused', 'commute_focused']),
  livingAreas: z
    .array(z.enum(['gangnam', 'yeouido', 'pangyo', 'magok', 'gwanghwamun', 'jamsil']))
    .max(3),
});

export type StepFormData = z.infer<typeof stepFormSchema>;

const TOTAL_STEPS = 5;

const DEFAULT_VALUES: StepFormData = {
  tradeType: undefined,
  marriagePlannedAt: undefined,
  childPlan: undefined,
  job1: '',
  job2: '',
  job1Remote: false,
  job2Remote: false,
  cash: 0,
  income: 0,
  loans: 0,
  monthlyBudget: 0,
  weightProfile: 'balanced',
  livingAreas: [],
};

// v2 schema for migration
const priorityWeightSchema = z.number().int().min(0).max(100);
const v2DataSchema = z.object({
  tradeType: z.enum(['sale', 'jeonse', 'monthly']).optional(),
  marriagePlannedAt: z.enum(['within_6m', 'within_1y', 'undecided']).optional(),
  childPlan: z.enum(['yes', 'maybe', 'no']).optional(),
  job1: z.string(),
  job2: z.string(),
  job1Remote: z.boolean(),
  job2Remote: z.boolean(),
  cash: z.number().int().min(0).max(5_000_000),
  income: z.number().int().min(0).max(1_000_000),
  loans: z.number().int().min(0).max(5_000_000),
  monthlyBudget: z.number().int().min(0).max(10_000),
  priorityWeights: z.object({
    commute: priorityWeightSchema,
    childcare: priorityWeightSchema,
    safety: priorityWeightSchema,
    budget: priorityWeightSchema,
  }),
  livingAreas: z
    .array(z.enum(['gangnam', 'yeouido', 'pangyo', 'magok', 'gwanghwamun', 'jamsil']))
    .max(3),
});

// Legacy v1 schema
const legacyStepFormSchema = z.object({
  tradeType: z.enum(['sale', 'jeonse', 'monthly']).optional(),
  childPlan: z.enum(['yes', 'maybe', 'no']).optional(),
  job1: z.string().optional(),
  job2: z.string().optional(),
  job1Remote: z.boolean().optional(),
  job2Remote: z.boolean().optional(),
  cash: z.number().int().min(0).max(5_000_000).optional(),
  income: z.number().int().min(0).max(1_000_000).optional(),
  loans: z.number().int().min(0).max(5_000_000).optional(),
  monthlyBudget: z.number().int().min(0).max(10_000).optional(),
  priorities: z.array(z.enum(['commute', 'childcare', 'safety', 'budget'])).optional(),
});

const stepFormSessionSchema = z.object({
  schemaVersion: z.literal(FORM_SCHEMA_VERSION),
  data: stepFormSchema,
});

interface UseStepFormReturn {
  form: UseFormReturn<StepFormData>;
  currentStep: number;
  totalSteps: number;
  goNext: () => void;
  goPrev: () => void;
  goToStep: (step: number) => void;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastInputStep: boolean;
  isAnalysisStep: boolean;
  saveToSession: () => void;
}

function migrateV2ToV3(weights: PriorityWeights): StepFormData['weightProfile'] {
  return priorityWeightsToWeightProfile(weights);
}

function restoreFromSession(): StepFormData | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = sessionStorage.getItem(SESSION_KEYS.formData);
    if (!item) return null;
    const raw = JSON.parse(item) as unknown;

    // v3: current schema
    const v3Result = stepFormSessionSchema.safeParse(raw);
    if (v3Result.success) return v3Result.data.data;

    // v3 direct (no wrapper)
    const directV3Result = stepFormSchema.safeParse(raw);
    if (directV3Result.success) return directV3Result.data;

    // v2: priorityWeights → weightProfile migration
    const v2Wrapped = z.object({ schemaVersion: z.literal(2), data: v2DataSchema }).safeParse(raw);
    if (v2Wrapped.success) {
      const d = v2Wrapped.data.data;
      return {
        tradeType: d.tradeType,
        marriagePlannedAt: d.marriagePlannedAt,
        childPlan: d.childPlan,
        job1: d.job1,
        job2: d.job2,
        job1Remote: d.job1Remote,
        job2Remote: d.job2Remote,
        cash: d.cash,
        income: d.income,
        loans: d.loans,
        monthlyBudget: d.monthlyBudget,
        weightProfile: migrateV2ToV3(d.priorityWeights),
        livingAreas: d.livingAreas,
      };
    }

    // v2 direct (no wrapper)
    const directV2Result = v2DataSchema.safeParse(raw);
    if (directV2Result.success) {
      const d = directV2Result.data;
      return {
        tradeType: d.tradeType,
        marriagePlannedAt: d.marriagePlannedAt,
        childPlan: d.childPlan,
        job1: d.job1,
        job2: d.job2,
        job1Remote: d.job1Remote,
        job2Remote: d.job2Remote,
        cash: d.cash,
        income: d.income,
        loans: d.loans,
        monthlyBudget: d.monthlyBudget,
        weightProfile: migrateV2ToV3(d.priorityWeights),
        livingAreas: d.livingAreas,
      };
    }

    // v1: legacy priorities[] → priorityWeights → weightProfile
    const legacyResult = legacyStepFormSchema.safeParse(raw);
    if (legacyResult.success) {
      const legacy = legacyResult.data;
      const weights = prioritiesToPriorityWeights(legacy.priorities ?? []);
      return {
        tradeType: legacy.tradeType,
        marriagePlannedAt: DEFAULT_VALUES.marriagePlannedAt,
        childPlan: legacy.childPlan,
        job1: legacy.job1 ?? DEFAULT_VALUES.job1,
        job2: legacy.job2 ?? DEFAULT_VALUES.job2,
        job1Remote: legacy.job1Remote ?? DEFAULT_VALUES.job1Remote,
        job2Remote: legacy.job2Remote ?? DEFAULT_VALUES.job2Remote,
        cash: legacy.cash ?? DEFAULT_VALUES.cash,
        income: legacy.income ?? DEFAULT_VALUES.income,
        loans: legacy.loans ?? DEFAULT_VALUES.loans,
        monthlyBudget: legacy.monthlyBudget ?? DEFAULT_VALUES.monthlyBudget,
        weightProfile: priorityWeightsToWeightProfile(weights),
        livingAreas: DEFAULT_VALUES.livingAreas,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function useStepForm(): UseStepFormReturn {
  const [currentStep, setCurrentStep] = useState(1);

  const [savedData] = useState(restoreFromSession);

  const form = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: savedData ?? DEFAULT_VALUES,
    mode: 'onChange',
  });

  const saveToSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const data = form.getValues();
      sessionStorage.setItem(
        SESSION_KEYS.formData,
        JSON.stringify({ schemaVersion: FORM_SCHEMA_VERSION, data }),
      );
    } catch {
      // Silently ignore
    }
  }, [form]);

  // Auto-save on value changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- RHF subscription pattern; watch() is correctly cleaned up
    const subscription = form.watch(() => {
      saveToSession();
    });
    return () => subscription.unsubscribe();
  }, [form, saveToSession]);

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), TOTAL_STEPS));
  }, []);

  return {
    form,
    currentStep,
    totalSteps: TOTAL_STEPS,
    goNext,
    goPrev,
    goToStep,
    canGoNext: currentStep < TOTAL_STEPS,
    isFirstStep: currentStep === 1,
    isLastInputStep: currentStep === 4,
    isAnalysisStep: currentStep === 5,
    saveToSession,
  };
}

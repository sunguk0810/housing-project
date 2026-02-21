'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SESSION_KEYS } from '@/lib/constants';
import { prioritiesToPriorityWeights, priorityWeightsToWeightProfile } from '@/lib/priorities';
import { WEIGHT_PROFILE_KEYS } from '@/types/engine';
import type { PriorityWeights } from '@/types/ui';

const FORM_SCHEMA_VERSION = 6;

const DESIRED_AREA_KEYS = ['small', 'medium', 'large'] as const;

const stepFormSchema = z.object({
  tradeType: z.enum(['sale', 'jeonse', 'monthly']).optional(),
  job1: z.string(),
  job2: z.string(),
  job1Remote: z.boolean(),
  job2Remote: z.boolean(),
  cash: z.number().int().min(0).max(5_000_000),
  income: z.number().int().min(0).max(1_200_000),
  weightProfile: z.enum(WEIGHT_PROFILE_KEYS),
  budgetProfile: z.enum(['firstTime', 'noProperty', 'homeowner']),
  loanProgram: z.enum(['bankMortgage', 'bogeumjari']),
  desiredAreas: z.array(z.enum(DESIRED_AREA_KEYS)).min(1).max(3),
});

export type StepFormData = z.infer<typeof stepFormSchema>;

const TOTAL_STEPS = 5;

const DEFAULT_VALUES: StepFormData = {
  tradeType: undefined,
  job1: '',
  job2: '',
  job1Remote: false,
  job2Remote: false,
  cash: 0,
  income: 0,
  weightProfile: 'balanced',
  budgetProfile: 'noProperty',
  loanProgram: 'bankMortgage',
  desiredAreas: ['small', 'medium', 'large'],
};

// v5 schema (previous version without desiredAreas)
const v5DataSchema = z.object({
  tradeType: z.enum(['sale', 'jeonse', 'monthly']).optional(),
  job1: z.string(),
  job2: z.string(),
  job1Remote: z.boolean(),
  job2Remote: z.boolean(),
  cash: z.number().int().min(0).max(5_000_000),
  income: z.number().int().min(0).max(1_200_000),
  weightProfile: z.enum(WEIGHT_PROFILE_KEYS),
  budgetProfile: z.enum(['firstTime', 'noProperty', 'homeowner']),
  loanProgram: z.enum(['bankMortgage', 'bogeumjari']),
});

// v4 schema (previous version with removed fields)
const v4DataSchema = z.object({
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
  weightProfile: z.enum(WEIGHT_PROFILE_KEYS),
  budgetProfile: z.enum(['firstTime', 'noProperty', 'homeowner']),
  loanProgram: z.enum(['bankMortgage', 'bogeumjari']),
  livingAreas: z
    .array(z.enum(['gangnam', 'yeouido', 'pangyo', 'magok', 'gwanghwamun', 'jamsil']))
    .max(3),
});

// v3 schema (previous version without budgetProfile/loanProgram)
const v3DataSchema = z.object({
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
  weightProfile: z.enum(WEIGHT_PROFILE_KEYS),
  livingAreas: z
    .array(z.enum(['gangnam', 'yeouido', 'pangyo', 'magok', 'gwanghwamun', 'jamsil']))
    .max(3),
});

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

/** Add desiredAreas default for v5 → v6 */
function migrateV5ToV6(d: z.infer<typeof v5DataSchema>): StepFormData {
  return { ...d, desiredAreas: DEFAULT_VALUES.desiredAreas };
}

/** Remove fields and convert monthly income → annual income for v4 → v6 */
function migrateV4ToV6(d: z.infer<typeof v4DataSchema>): StepFormData {
  return {
    tradeType: d.tradeType,
    job1: d.job1,
    job2: d.job2,
    job1Remote: d.job1Remote,
    job2Remote: d.job2Remote,
    cash: d.cash,
    income: Math.min(d.income * 12, 1_200_000),
    weightProfile: d.weightProfile,
    budgetProfile: d.budgetProfile,
    loanProgram: d.loanProgram,
    desiredAreas: DEFAULT_VALUES.desiredAreas,
  };
}

/** Add budgetProfile/loanProgram defaults to v3 data, then migrate to v6 */
function migrateV3ToV6(d: z.infer<typeof v3DataSchema>): StepFormData {
  return migrateV4ToV6({
    ...d,
    budgetProfile: DEFAULT_VALUES.budgetProfile,
    loanProgram: DEFAULT_VALUES.loanProgram,
  });
}

function restoreFromSession(): StepFormData | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = sessionStorage.getItem(SESSION_KEYS.formData);
    if (!item) return null;
    const raw = JSON.parse(item) as unknown;

    // v6: current schema
    const v6Result = stepFormSessionSchema.safeParse(raw);
    if (v6Result.success) return v6Result.data.data;

    // v6 direct (no wrapper)
    const directV6Result = stepFormSchema.safeParse(raw);
    if (directV6Result.success) return directV6Result.data;

    // v5 wrapped → v6 migration
    const v5Wrapped = z.object({ schemaVersion: z.literal(5), data: v5DataSchema }).safeParse(raw);
    if (v5Wrapped.success) return migrateV5ToV6(v5Wrapped.data.data);

    // v5 direct
    const directV5Result = v5DataSchema.safeParse(raw);
    if (directV5Result.success) return migrateV5ToV6(directV5Result.data);

    // v4 wrapped → v6 migration
    const v4Wrapped = z.object({ schemaVersion: z.literal(4), data: v4DataSchema }).safeParse(raw);
    if (v4Wrapped.success) return migrateV4ToV6(v4Wrapped.data.data);

    // v4 direct
    const directV4Result = v4DataSchema.safeParse(raw);
    if (directV4Result.success) return migrateV4ToV6(directV4Result.data);

    // v3 wrapped → v6 migration
    const v3Wrapped = z.object({ schemaVersion: z.literal(3), data: v3DataSchema }).safeParse(raw);
    if (v3Wrapped.success) return migrateV3ToV6(v3Wrapped.data.data);

    // v3 direct
    const directV3Result = v3DataSchema.safeParse(raw);
    if (directV3Result.success) return migrateV3ToV6(directV3Result.data);

    // v2: priorityWeights → weightProfile migration → v6
    const v2Wrapped = z.object({ schemaVersion: z.literal(2), data: v2DataSchema }).safeParse(raw);
    if (v2Wrapped.success) {
      const d = v2Wrapped.data.data;
      return {
        tradeType: d.tradeType,
        job1: d.job1,
        job2: d.job2,
        job1Remote: d.job1Remote,
        job2Remote: d.job2Remote,
        cash: d.cash,
        income: Math.min(d.income * 12, 1_200_000),
        weightProfile: migrateV2ToV3(d.priorityWeights),
        budgetProfile: DEFAULT_VALUES.budgetProfile,
        loanProgram: DEFAULT_VALUES.loanProgram,
        desiredAreas: DEFAULT_VALUES.desiredAreas,
      };
    }

    // v2 direct (no wrapper)
    const directV2Result = v2DataSchema.safeParse(raw);
    if (directV2Result.success) {
      const d = directV2Result.data;
      return {
        tradeType: d.tradeType,
        job1: d.job1,
        job2: d.job2,
        job1Remote: d.job1Remote,
        job2Remote: d.job2Remote,
        cash: d.cash,
        income: Math.min(d.income * 12, 1_200_000),
        weightProfile: migrateV2ToV3(d.priorityWeights),
        budgetProfile: DEFAULT_VALUES.budgetProfile,
        loanProgram: DEFAULT_VALUES.loanProgram,
        desiredAreas: DEFAULT_VALUES.desiredAreas,
      };
    }

    // v1: legacy priorities[] → priorityWeights → weightProfile → v6
    const legacyResult = legacyStepFormSchema.safeParse(raw);
    if (legacyResult.success) {
      const legacy = legacyResult.data;
      const weights = prioritiesToPriorityWeights(legacy.priorities ?? []);
      return {
        tradeType: legacy.tradeType,
        job1: legacy.job1 ?? DEFAULT_VALUES.job1,
        job2: legacy.job2 ?? DEFAULT_VALUES.job2,
        job1Remote: legacy.job1Remote ?? DEFAULT_VALUES.job1Remote,
        job2Remote: legacy.job2Remote ?? DEFAULT_VALUES.job2Remote,
        cash: legacy.cash ?? DEFAULT_VALUES.cash,
        income: Math.min((legacy.income ?? DEFAULT_VALUES.income) * 12, 1_200_000),
        weightProfile: priorityWeightsToWeightProfile(weights),
        budgetProfile: DEFAULT_VALUES.budgetProfile,
        loanProgram: DEFAULT_VALUES.loanProgram,
        desiredAreas: DEFAULT_VALUES.desiredAreas,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function useStepForm(): UseStepFormReturn {
  const [currentStep, setCurrentStep] = useState(1);

  // Always start with DEFAULT_VALUES to avoid SSR hydration mismatch.
  // Session data is restored in useEffect after mount.
  const form = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  // Restore session data after hydration (client-only)
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (restored) return;
    const saved = restoreFromSession();
    if (saved) {
      form.reset(saved);
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restored]);

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

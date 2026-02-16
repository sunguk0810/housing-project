"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SESSION_KEYS } from "@/lib/constants";

// Frontend form schema: backend schema + childPlan
const stepFormSchema = z.object({
  tradeType: z.enum(["sale", "jeonse"]),
  childPlan: z.enum(["yes", "maybe", "no"]),
  job1: z.string().min(1),
  job2: z.string(),
  cash: z.number().int().min(0).max(5_000_000),
  income: z.number().int().min(0).max(1_000_000),
  loans: z.number().int().min(0).max(5_000_000),
  monthlyBudget: z.number().int().min(0).max(10_000),
  weightProfile: z.enum(["balanced", "budget_focused", "commute_focused"]),
});

export type StepFormData = z.infer<typeof stepFormSchema>;

const TOTAL_STEPS = 5;

const DEFAULT_VALUES: StepFormData = {
  tradeType: "jeonse",
  childPlan: "maybe",
  job1: "",
  job2: "",
  cash: 0,
  income: 0,
  loans: 0,
  monthlyBudget: 0,
  weightProfile: "balanced",
};

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

export function useStepForm(): UseStepFormReturn {
  const [currentStep, setCurrentStep] = useState(1);

  // Restore from session — lazy initializer runs only on first render
  const [savedData] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const item = sessionStorage.getItem(SESSION_KEYS.formData);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  });

  const form = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: savedData ?? DEFAULT_VALUES,
    mode: "onChange",
  });

  const saveToSession = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const data = form.getValues();
      sessionStorage.setItem(SESSION_KEYS.formData, JSON.stringify(data));
    } catch {
      // Silently ignore
    }
  }, [form]);

  // Auto-save on value changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch API
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

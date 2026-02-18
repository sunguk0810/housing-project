'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ANALYSIS_STEPS, SESSION_KEYS } from '@/lib/constants';
import { priorityWeightsToWeightProfile } from '@/lib/priorities';
import { LoadingStage } from '@/components/onboarding/LoadingStage';
import type { StepFormData } from '@/hooks/useStepForm';
import type { RecommendResponse } from '@/types/api';

interface Step5Props {
  formData: StepFormData;
  onGoPrev?: () => void;
}

export function Step5Loading({ formData, onGoPrev }: Step5Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isEmptyResult, setIsEmptyResult] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const formDataRef = useRef(formData);
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    setActiveIndex(0);
    setError(null);
    setIsEmptyResult(false);

    const controller = new AbortController();
    const startTime = Date.now();

    // Cumulative timing based on ANALYSIS_STEPS durations
    let cumulative = 0;
    const timers = ANALYSIS_STEPS.map((step, i) => {
      const delay = cumulative;
      cumulative += step.durationMs;
      return setTimeout(() => setActiveIndex(i), delay);
    });

    const totalAnimTime = cumulative;

    async function analyze() {
      try {
        const { marriagePlannedAt, livingAreas, priorityWeights, job1Remote, job2Remote, ...rest } =
          formDataRef.current;
        void marriagePlannedAt;
        void livingAreas;

        // Build API payload: map priorityWeights → weightProfile, handle remote jobs.
        // marriagePlannedAt/livingAreas are kept in session only for future expansion.
        const apiPayload = {
          ...rest,
          job1Remote,
          job2Remote,
          job1: rest.job1,
          job2: job2Remote ? '' : rest.job2,
          weightProfile: priorityWeightsToWeightProfile(priorityWeights),
        };

        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message ?? '분석에 실패했습니다.');
        }

        const data: RecommendResponse = await res.json();

        if (data.recommendations.length === 0) {
          setIsEmptyResult(true);
          setError('조건에 맞는 단지를 찾지 못했습니다. 예산이나 주거 조건을 조정해보세요.');
          return;
        }

        sessionStorage.setItem(SESSION_KEYS.results, JSON.stringify(data));

        // Wait for max(apiTime, totalAnimTime) + 500ms
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalAnimTime - elapsed) + 500;
        navigateTimerRef.current = setTimeout(() => router.push('/results'), remaining);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : '분석에 실패했습니다.');
      }
    }

    analyze();

    return () => {
      timers.forEach(clearTimeout);
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
      controller.abort();
    };
  }, [retryCount, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-10)]">
        <p className="text-[length:var(--text-body)] text-[var(--color-error)]">{error}</p>
        {isEmptyResult && onGoPrev ? (
          <button
            onClick={onGoPrev}
            className="rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-primary)]"
          >
            조건 변경하기
          </button>
        ) : (
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-primary)]"
          >
            다시 시도
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-[var(--space-10)]">
      <h2 className="mb-[var(--space-8)] text-[length:var(--text-title)] font-semibold">
        분석 중입니다
      </h2>
      <LoadingStage stages={ANALYSIS_STEPS} activeIndex={activeIndex} />
    </div>
  );
}

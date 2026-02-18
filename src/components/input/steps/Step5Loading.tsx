'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ANALYSIS_STEPS, SESSION_KEYS } from '@/lib/constants';
import { LoadingStage } from '@/components/onboarding/LoadingStage';
import { AnalysisProgressRing } from '@/components/onboarding/AnalysisProgressRing';
import { AnalysisTipCard } from '@/components/onboarding/AnalysisTipCard';
import { SearchX, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { StepFormData } from '@/hooks/useStepForm';
import type { RecommendResponse } from '@/types/api';

type LoadingPhase = 'running' | 'pausing' | 'complete' | 'exiting';

interface Step5Props {
  formData: StepFormData;
  onGoPrev?: () => void;
}

const TICK_MS = 50;
const PAUSE_DURATION = 800;
const COMPLETE_DURATION = 500;
const EXIT_DURATION = 400;

export function Step5Loading({ formData, onGoPrev }: Step5Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<LoadingPhase>('running');
  const [error, setError] = useState<string | null>(null);
  const [isEmptyResult, setIsEmptyResult] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const formDataRef = useRef(formData);
  const apiDoneRef = useRef(false);

  // Pre-compute cumulative boundaries: [0, 2000, 4500, 6500, 8000]
  const cumulativeBounds = useMemo(() => {
    const bounds = [0];
    let sum = 0;
    for (const step of ANALYSIS_STEPS) {
      sum += step.durationMs;
      bounds.push(sum);
    }
    return bounds;
  }, []);

  const totalDuration = cumulativeBounds[cumulativeBounds.length - 1];

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Main running loop
  useEffect(() => {
    setActiveIndex(0);
    setPercent(0);
    setPhase('running');
    setError(null);
    setIsEmptyResult(false);
    apiDoneRef.current = false;

    const controller = new AbortController();
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= totalDuration) {
        if (apiDoneRef.current) {
          // API done, advance to pausing
          setActiveIndex(ANALYSIS_STEPS.length);
          setPercent(100);
          setPhase('pausing');
          clearInterval(timer);
        } else {
          // API not done yet, hold at 99% on last step
          setActiveIndex(ANALYSIS_STEPS.length - 1);
          setPercent(99);
        }
        return;
      }

      // Find current step from cumulative bounds
      let stepIdx = 0;
      for (let i = 1; i < cumulativeBounds.length; i++) {
        if (elapsed >= cumulativeBounds[i]) {
          stepIdx = i;
        } else {
          break;
        }
      }

      // Calculate percent: (completedSteps * 25) + (stepProgress * 25)
      const stepStart = cumulativeBounds[stepIdx];
      const stepEnd = cumulativeBounds[stepIdx + 1];
      const stepElapsed = elapsed - stepStart;
      const stepDuration = stepEnd - stepStart;
      const stepProgress = Math.min(stepElapsed / stepDuration, 1);
      const computedPercent = Math.round(stepIdx * 25 + stepProgress * 25);

      setActiveIndex(stepIdx);
      setPercent(Math.min(computedPercent, 99));
    }, TICK_MS);

    async function analyze() {
      try {
        const {
          marriagePlannedAt,
          livingAreas,
          job1Remote,
          job2Remote,
          ...rest
        } = formDataRef.current;
        void marriagePlannedAt;
        void livingAreas;

        const apiPayload = {
          ...rest,
          job1Remote,
          job2Remote,
          job1: rest.job1,
          job2: job2Remote ? '' : rest.job2,
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
          setError(
            '조건에 맞는 단지를 찾지 못했습니다. 예산이나 주거 조건을 조정해보세요.',
          );
          return;
        }

        sessionStorage.setItem(SESSION_KEYS.results, JSON.stringify(data));
        apiDoneRef.current = true;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : '분석에 실패했습니다.');
      }
    }

    analyze();

    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [retryCount, totalDuration, cumulativeBounds]);

  // Completion sequence: pausing → complete → exiting → navigate
  useEffect(() => {
    if (phase === 'pausing') {
      router.prefetch('/results');
      const t = setTimeout(() => setPhase('complete'), PAUSE_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === 'complete') {
      const t = setTimeout(() => setPhase('exiting'), COMPLETE_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === 'exiting') {
      const t = setTimeout(() => router.push('/results'), EXIT_DURATION);
      return () => clearTimeout(t);
    }
  }, [phase, router]);

  // When API finishes after totalDuration, transition to pausing
  useEffect(() => {
    if (phase !== 'running') return;
    if (!apiDoneRef.current) return;

    // If percent is 99 (held waiting for API), the interval will pick it up
    // But if interval already cleared and phase is still running, handle it
    const check = setInterval(() => {
      if (apiDoneRef.current && percent === 99) {
        setActiveIndex(ANALYSIS_STEPS.length);
        setPercent(100);
        setPhase('pausing');
        clearInterval(check);
      }
    }, TICK_MS);

    return () => clearInterval(check);
  }, [phase, percent]);

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  if (error) {
    if (isEmptyResult) {
      return (
        <EmptyState
          icon={SearchX}
          iconVariant="info"
          title="조건에 맞는 단지를 찾지 못했어요"
          description="조건을 조금 조정하면 더 많은 결과를 찾을 수 있어요"
          tips={[
            '전세 ↔ 매매로 거래 유형을 바꿔보세요',
            '예산 범위를 3,000만~5,000만원 정도 넓혀보세요',
          ]}
          primaryAction={{ label: '조건 변경하기', icon: SlidersHorizontal, onClick: onGoPrev }}
          secondaryAction={{ label: '처음부터 다시', icon: RotateCcw, href: '/search' }}
        />
      );
    }

    return (
      <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-10)]">
        <p className="text-[length:var(--text-body)] text-[var(--color-error)]">
          {error}
        </p>
        <Button onClick={handleRetry}>다시 시도</Button>
      </div>
    );
  }

  const isComplete = phase === 'complete' || phase === 'exiting';
  const isExiting = phase === 'exiting';

  return (
    <div
      role="status"
      aria-label="분석 진행 중"
      className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-sm flex-col items-center
                 px-[var(--space-4)] py-[var(--space-10)]
                 animate-[fadeIn_400ms_ease-out]"
      style={isExiting ? { animation: `fadeOut ${EXIT_DURATION}ms ease-in forwards` } : undefined}
    >
      <h2
        key={isComplete ? 'done' : 'loading'}
        className="text-[length:var(--text-title)] font-semibold"
        style={isComplete ? { animation: 'fadeSlideUp 400ms ease-out' } : undefined}
      >
        {isComplete ? '분석 완료!' : '분석 중입니다'}
      </h2>

      <AnalysisProgressRing
        percent={percent}
        isComplete={isComplete}
        className="mt-[var(--space-8)]"
      />

      <div className="mt-[var(--space-8)] w-full">
        <LoadingStage stages={ANALYSIS_STEPS} activeIndex={activeIndex} />
      </div>

      <div className="flex-1" />

      <AnalysisTipCard className="mb-[var(--space-2)] w-full" />

      {/* Screen reader live region */}
      <div aria-live="polite" className="sr-only">
        {isComplete
          ? '분석 완료'
          : `${ANALYSIS_STEPS[activeIndex]?.label ?? '분석'} 진행 중, ${percent}%`}
      </div>
    </div>
  );
}

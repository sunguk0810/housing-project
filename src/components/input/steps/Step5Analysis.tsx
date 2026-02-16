"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Train, BarChart3, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANALYSIS_STEPS as ANALYSIS_STEP_DEFS, SESSION_KEYS } from "@/lib/constants";
import type { StepFormData } from "@/hooks/useStepForm";
import type { RecommendResponse } from "@/types/api";

interface Step5Props {
  formData: StepFormData;
  onGoPrev?: () => void;
}

const ICON_MAP: Record<string, typeof Building> = { Building, Train, BarChart3, Map };
const ANALYSIS_STEPS = ANALYSIS_STEP_DEFS.map((s) => ({
  label: s.label,
  Icon: ICON_MAP[s.iconName],
}));

export function Step5Analysis({ formData, onGoPrev }: Step5Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isEmptyResult, setIsEmptyResult] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  useEffect(() => {
    setActiveIndex(0);
    setError(null);

    const controller = new AbortController();
    const startTime = Date.now();

    // Step animation progression
    const timers = ANALYSIS_STEPS.map((_, i) =>
      setTimeout(() => setActiveIndex(i), i * 800),
    );

    async function analyze() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { childPlan, ...apiPayload } = formDataRef.current;
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message ?? "분석에 실패했습니다.");
        }

        const data: RecommendResponse = await res.json();

        if (data.recommendations.length === 0) {
          setIsEmptyResult(true);
          setError("조건에 맞는 단지를 찾지 못했습니다. 예산이나 주거 조건을 조정해보세요.");
          return;
        }

        // Save results to sessionStorage
        sessionStorage.setItem(SESSION_KEYS.results, JSON.stringify(data));

        // Wait for animation to finish, then navigate
        const minAnimTime = ANALYSIS_STEPS.length * 800 + 500;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minAnimTime - elapsed);
        setTimeout(() => router.push("/results"), remaining);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "분석에 실패했습니다.");
      }
    }

    analyze();

    return () => {
      timers.forEach(clearTimeout);
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

      <div className="w-full max-w-sm space-y-[var(--space-4)]">
        {ANALYSIS_STEPS.map(({ label, Icon }, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-[var(--space-3)] rounded-[var(--radius-s7-md)] p-[var(--space-3)] transition-all duration-500",
              i <= activeIndex
                ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                : "text-[var(--color-on-surface-muted)]",
            )}
            style={{
              opacity: i <= activeIndex ? 1 : 0.4,
              animation: i === activeIndex ? "fadeIn var(--duration-normal) ease" : undefined,
            }}
          >
            <Icon size={20} />
            <span className="text-[length:var(--text-body-sm)] font-medium">{label}</span>
            {i < activeIndex && (
              <span className="ml-auto text-[length:var(--text-caption)] text-[var(--color-success)]">
                완료
              </span>
            )}
            {i === activeIndex && (
              <span className="ml-auto text-[length:var(--text-caption)]">진행 중...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

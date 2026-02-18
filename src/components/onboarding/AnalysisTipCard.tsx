"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TIPS = [
  "통근 시간은 대중교통 기준으로 계산됩니다.",
  "예산 적합도는 월 고정 지출 대비 비율로 산출합니다.",
  "분석 결과는 공공데이터 기반 참고 정보입니다.",
  "수도권 주요 생활권 1,000여 개 단지를 비교합니다.",
] as const;

const ROTATION_INTERVAL = 4500;

interface AnalysisTipCardProps {
  className?: string;
}

export function AnalysisTipCard({ className }: AnalysisTipCardProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card
      className={cn(
        "border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-none py-0",
        className,
      )}
    >
      <CardContent className="px-[var(--space-4)] py-[var(--space-3)]">
        <p className="text-[length:var(--text-caption)] font-semibold text-[var(--color-neutral-500)] mb-[var(--space-1)]">
          TIP
        </p>
        <p
          key={tipIndex}
          className="text-[length:var(--text-body-sm)] text-[var(--color-neutral-600)]"
          style={{ animation: "fadeSlideUp 400ms ease-out" }}
        >
          {TIPS[tipIndex]}
        </p>
      </CardContent>
    </Card>
  );
}

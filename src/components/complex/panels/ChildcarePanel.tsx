"use client";

import { Building2, BookOpen } from "lucide-react";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { ProgressiveDisclosure } from "@/components/complex/ProgressiveDisclosure";
import { InsightCard } from "@/components/complex/InsightCard";
import { getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";
import type { NearbyChildcareItem, NearbySchoolItem } from "@/types/api";

interface ChildcarePanelProps {
  nearby: {
    readonly childcare: {
      readonly count: number;
      readonly items: ReadonlyArray<NearbyChildcareItem>;
    };
    readonly schools: ReadonlyArray<NearbySchoolItem>;
  };
  childcareScore?: number | null;
}

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
  elem: "초등",
  middle: "중등",
  high: "고등",
};

export function ChildcarePanel({ nearby, childcareScore }: ChildcarePanelProps) {
  const hasChildcare = nearby.childcare.count > 0;
  const hasSchools = nearby.schools.length > 0;
  const hasAnyData = hasChildcare || hasSchools;

  const elementary = nearby.schools.filter((s) => s.schoolLevel === "elem");
  const middle = nearby.schools.filter((s) => s.schoolLevel === "middle");
  const high = nearby.schools.filter((s) => s.schoolLevel === "high");
  const other = nearby.schools.filter(
    (s) => s.schoolLevel == null || !["elem", "middle", "high"].includes(s.schoolLevel)
  );

  const schoolGroups = [
    { label: "초등학교", count: elementary.length },
    { label: "중학교", count: middle.length },
    { label: "고등학교", count: high.length },
    ...(other.length > 0 ? [{ label: "기타", count: other.length }] : []),
  ].filter((g) => g.count > 0);

  const score = childcareScore != null ? Math.round(childcareScore * 100) : null;
  const grade = score !== null ? getScoreGrade(score) : null;

  const totalFacilities = nearby.childcare.count + nearby.schools.length;

  if (!hasAnyData) {
    return (
      <section className="rounded-[var(--radius-s7-lg)] border border-dashed border-[var(--color-border)] p-[var(--space-4)]">
        <p className="text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          주변 시설 정보가 아직 수집되지 않았습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-[var(--space-4)]">
      {/* Childcare insight card */}
      {grade !== null && (
        <InsightCard
          icon={Building2}
          insight={
            totalFacilities >= 10
              ? "보육·교육 시설이 풍부해요"
              : totalFacilities >= 5
                ? "보육·교육 시설이 보통 수준이에요"
                : "보육·교육 시설이 부족한 편이에요"
          }
          value={GRADE_LABELS[grade]}
          valueLabel={`주변 ${totalFacilities}개 시설`}
          grade={grade}
        />
      )}

      {/* Schools */}
      {hasSchools && (
        <div className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
            <BookOpen size={18} />
            교육 환경
          </h2>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-[var(--space-3)]">
            {schoolGroups.map((g) => (
              <div
                key={g.label}
                className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-[var(--space-3)] text-center"
              >
                <Building2
                  size={14}
                  className="mx-auto mb-1 text-[var(--color-on-surface-muted)]"
                />
                <p className="text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">
                  {g.count}
                </p>
                <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                  {g.label}
                </p>
              </div>
            ))}
          </div>

          {/* School detail list */}
          <div className="mt-[var(--space-3)] space-y-[var(--space-2)]">
            {nearby.schools.slice(0, 5).map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between text-[length:var(--text-caption)]"
              >
                <span>
                  {school.name}
                  <span className="ml-1 text-[var(--color-on-surface-muted)]">
                    ({SCHOOL_LEVEL_LABELS[school.schoolLevel ?? ""] ?? "기타"})
                  </span>
                </span>
                <span className="text-[var(--color-on-surface-muted)]">
                  {Math.round(school.distanceMeters)}m
                  {school.achievementScore != null && ` (성취도 ${school.achievementScore}점)`}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            반경 1.5km 이내 시설 수
          </p>
          <DataSourceTag
            type="public"
            label="교육부 학교정보"
            className="mt-[var(--space-1)]"
          />
        </div>
      )}

      {/* Childcare facilities */}
      {hasChildcare && (
        <div className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
            <Building2 size={18} />
            보육 환경
          </h2>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-[var(--space-3)]">
            <div className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-[var(--space-3)] text-center">
              <p className="text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">
                {nearby.childcare.count}
              </p>
              <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                보육시설
              </p>
            </div>
          </div>
          <div className="mt-[var(--space-3)] space-y-[var(--space-2)]">
            {nearby.childcare.items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-[length:var(--text-caption)]"
              >
                <span>{item.name}</span>
                <span className="text-[var(--color-on-surface-muted)]">
                  {Math.round(item.distanceMeters)}m
                  {item.evaluationGrade && ` (${item.evaluationGrade})`}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            반경 800m 이내 시설
          </p>
          <DataSourceTag
            type="childcare"
            label="사회보장정보원 보육시설"
            className="mt-[var(--space-1)]"
          />
        </div>
      )}

      <ProgressiveDisclosure
        summary="보육 점수는 어떻게 산출되나요?"
        detail="단지 반경 내 어린이집·학교의 수, 거리, 평가등급을 종합합니다."
      />
    </section>
  );
}

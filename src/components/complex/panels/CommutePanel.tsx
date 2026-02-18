"use client";

import { Train, Briefcase } from "lucide-react";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { ProgressiveDisclosure } from "@/components/complex/ProgressiveDisclosure";
import { InsightCard } from "@/components/complex/InsightCard";
import { formatCommuteTime } from "@/lib/format";
import { getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";
import type { CommuteInfo } from "@/types/api";
import type { DetailSessionData } from "@/lib/detail-session";

interface CommutePanelProps {
  commute: CommuteInfo;
  session: DetailSessionData;
}

const REGION_COMMUTES = [
  { label: "강남", key: "toGbd" as const },
  { label: "여의도", key: "toYbd" as const },
  { label: "종로", key: "toCbd" as const },
  { label: "판교", key: "toPangyo" as const },
];

export function CommutePanel({ commute, session }: CommutePanelProps) {
  const hasWorkplaceData = session.job1 !== null || session.job1Remote;
  const hasRegionData =
    commute.toGbd !== null ||
    commute.toYbd !== null ||
    commute.toCbd !== null ||
    commute.toPangyo !== null;

  const commuteScore = session.dimensions
    ? Math.round(session.dimensions.commute * 100)
    : null;
  const commuteGrade = commuteScore !== null ? getScoreGrade(commuteScore) : null;

  return (
    <section className="space-y-[var(--space-4)]">
      {/* Commute insight card */}
      {commuteGrade !== null && commuteScore !== null && session.commuteTime1 !== null && (
        <InsightCard
          icon={Train}
          insight={
            session.job1Remote
              ? "재택근무로 통근이 필요없어요"
              : `직장까지 ${formatCommuteTime(session.commuteTime1)} 거리예요`
          }
          value={GRADE_LABELS[commuteGrade]}
          valueLabel="통근 편의"
          grade={commuteGrade}
        />
      )}

      {/* Workplace commute (session-based) */}
      <div className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
        <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
          <Briefcase size={18} />
          직장 기반 통근
        </h2>
        {hasWorkplaceData ? (
          <div className="space-y-[var(--space-3)]">
            {/* Job 1 */}
            <div className="rounded-[var(--radius-s7-md)] bg-[var(--color-surface-elevated)] p-[var(--space-3)]">
              <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                직장 1
              </p>
              <p className="text-[length:var(--text-body-sm)] font-medium">
                {session.job1Remote ? "재택근무" : session.job1}
              </p>
              {!session.job1Remote && session.commuteTime1 !== null && (
                <p className="mt-1 text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">
                  {formatCommuteTime(session.commuteTime1)}
                </p>
              )}
            </div>
            {/* Job 2 */}
            {(session.job2 !== null || session.job2Remote) && (
              <div className="rounded-[var(--radius-s7-md)] bg-[var(--color-surface-elevated)] p-[var(--space-3)]">
                <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                  직장 2
                </p>
                <p className="text-[length:var(--text-body-sm)] font-medium">
                  {session.job2Remote ? "재택근무" : session.job2}
                </p>
                {!session.job2Remote && session.commuteTime2 !== null && (
                  <p className="mt-1 text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">
                    {formatCommuteTime(session.commuteTime2)}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            분석 결과 페이지에서 접근하면 개인 통근 정보를 확인할 수 있어요
          </p>
        )}
      </div>

      {/* Region commute (API-based) */}
      <div className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
        <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
          <Train size={18} />
          주요 지역 통근 참고
        </h2>
        {hasRegionData ? (
          <>
            <div className="flex gap-[var(--space-3)]">
              {REGION_COMMUTES.filter((c) => commute[c.key] !== null).map((c) => (
                <div
                  key={c.label}
                  className="flex-1 rounded-[var(--radius-s7-md)] bg-[var(--color-surface-elevated)] p-[var(--space-3)] text-center"
                >
                  <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                    {c.label}
                  </p>
                  <p className="text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">
                    {formatCommuteTime(commute[c.key]!)}
                  </p>
                </div>
              ))}
            </div>
            <DataSourceTag
              type="transit"
              label="ODsay 대중교통 경로 기준"
              className="mt-[var(--space-2)]"
            />
          </>
        ) : (
          <p className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            통근 시간 데이터가 아직 수집되지 않았습니다.
          </p>
        )}
      </div>
      <ProgressiveDisclosure
        summary="통근 시간은 어떻게 산출되나요?"
        detail="단지에서 직장까지 대중교통 경로 기반 추정치입니다."
      />
    </section>
  );
}

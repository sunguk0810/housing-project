"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FullScreenSearch } from "@/components/onboarding/FullScreenSearch";
import { ExceptionButton } from "@/components/onboarding/ExceptionButton";
import type { KakaoLocalPlace } from "@/hooks/useKakaoLocalSearch";

interface Step2Props {
  job1: string;
  job2: string;
  job1Remote: boolean;
  job2Remote: boolean;
  onJob1Change: (address: string) => void;
  onJob2Change: (address: string) => void;
  onJob1RemoteChange: (remote: boolean) => void;
  onJob2RemoteChange: (remote: boolean) => void;
}

type SearchTarget = "job1" | "job2" | null;

export function Step2Workplace({
  job1,
  job2,
  job1Remote,
  job2Remote,
  onJob1Change,
  onJob2Change,
  onJob1RemoteChange,
  onJob2RemoteChange,
}: Step2Props) {
  const [searchTarget, setSearchTarget] = useState<SearchTarget>(null);

  function handleSelect(place: KakaoLocalPlace) {
    const address = place.roadAddressName || place.addressName;
    if (searchTarget === "job1") {
      onJob1Change(address);
      onJob1RemoteChange(false);
    } else if (searchTarget === "job2") {
      onJob2Change(address);
      onJob2RemoteChange(false);
    }
    setSearchTarget(null);
  }

  function handleJob1Remote() {
    onJob1RemoteChange(true);
    onJob1Change("");
  }

  function handleJob2Remote() {
    onJob2RemoteChange(true);
    onJob2Change("");
  }

  return (
    <>
      <div className="space-y-[var(--space-6)]">
        <h3 className="text-[length:var(--text-title)] font-semibold">
          출퇴근하는 직장 주소를 입력해주세요
        </h3>

        {/* Job 1 */}
        <div>
          <button
            type="button"
            onClick={() => !job1Remote && setSearchTarget("job1")}
            className={cn(
              "w-full border-b-2 pb-[var(--space-2)] pt-[var(--space-1)] text-left transition-colors",
              "border-[var(--color-primary)]",
            )}
          >
            <span className="block text-[length:var(--text-caption)] font-medium text-[var(--color-primary)]">
              직장 1 (필수)
            </span>
            <span
              className={cn(
                "block text-[length:var(--text-body)]",
                job1 || job1Remote
                  ? "text-[var(--color-on-surface)]"
                  : "text-[var(--color-neutral-400)]",
              )}
            >
              {job1Remote ? "재택근무" : job1 || "탭하여 검색"}
            </span>
          </button>
          <div className="mt-[var(--space-2)]">
            <ExceptionButton
              label="재택근무예요"
              onClick={handleJob1Remote}
            />
          </div>
        </div>

        {/* Job 2 */}
        <div>
          <button
            type="button"
            onClick={() => !job2Remote && setSearchTarget("job2")}
            className={cn(
              "w-full border-b-2 pb-[var(--space-2)] pt-[var(--space-1)] text-left transition-colors",
              "border-[var(--color-neutral-300)]",
            )}
          >
            <span className="block text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]">
              직장 2 (선택)
            </span>
            <span
              className={cn(
                "block text-[length:var(--text-body)]",
                job2 || job2Remote
                  ? "text-[var(--color-on-surface)]"
                  : "text-[var(--color-neutral-400)]",
              )}
            >
              {job2Remote ? "재택근무" : job2 || "탭하여 검색"}
            </span>
          </button>
          <div className="mt-[var(--space-2)]">
            <ExceptionButton
              label="재택근무예요"
              onClick={handleJob2Remote}
            />
          </div>
        </div>

        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          맞벌이인 경우 두 번째 직장도 입력하면 더 정확한 통근 분석이 가능합니다.
        </p>
      </div>

      <FullScreenSearch
        open={searchTarget !== null}
        onClose={() => setSearchTarget(null)}
        onSelect={handleSelect}
        placeholder="직장 주소를 검색해주세요"
      />
    </>
  );
}

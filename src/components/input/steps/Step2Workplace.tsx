"use client";

import { useState } from "react";
import { MapPin, Search, Home, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { FullScreenSearch } from "@/components/onboarding/FullScreenSearch";
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

function JobCard({
  label,
  placeName,
  address,
  isRemote,
  required,
  onTap,
  onRemoteToggle,
  onClearRemote,
  helperText,
}: {
  label: string;
  placeName: string;
  address: string;
  isRemote: boolean;
  required?: boolean;
  onTap: () => void;
  onRemoteToggle: (checked: boolean) => void;
  onClearRemote: () => void;
  helperText?: string;
}) {
  const hasValue = !!address || isRemote;
  const checkboxId = `remote-${label}`;

  return (
    <div className="space-y-[var(--space-2)]">
      {/* Card container */}
      <div
        className={cn(
          "relative flex items-center gap-[var(--space-3)] rounded-[var(--radius-s7-xl)] p-[var(--space-4)] transition-all",
          required ? "border border-[var(--color-border)]" : "border border-dashed border-[var(--color-neutral-200)]",
          hasValue && "border-solid border-[var(--color-brand-400)]",
        )}
      >
        {/* Tap area */}
        <button
          type="button"
          onClick={onTap}
          className="absolute inset-0 z-0 rounded-[var(--radius-s7-xl)]"
          aria-label={`${label} 주소 검색`}
        />

        {/* Left icon */}
        <div
          className={cn(
            "pointer-events-none relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]",
            "dark:bg-[var(--color-surface-elevated)] dark:text-[var(--color-neutral-400)]",
          )}
        >
          {isRemote ? <Home size={18} strokeWidth={1.6} /> : <MapPin size={18} strokeWidth={1.6} />}
        </div>

        {/* Text */}
        <div className="pointer-events-none relative z-10 min-w-0 flex-1">
          <span
            className={cn(
              "block text-[length:var(--text-caption)] font-medium",
              required ? "text-[var(--color-brand-500)]" : "text-[var(--color-on-surface-muted)]",
            )}
          >
            {label}
          </span>
          {isRemote ? (
            <span className="block text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)]">
              재택근무
            </span>
          ) : hasValue ? (
            <>
              {placeName && (
                <span className="block truncate text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)]">
                  {placeName}
                </span>
              )}
              <span className="block truncate text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                {address}
              </span>
            </>
          ) : (
            <span className="block text-[length:var(--text-body-sm)] text-[var(--color-neutral-400)]">
              탭하여 주소 검색
            </span>
          )}
        </div>

        {/* Right: X button (remote) or Search icon */}
        {isRemote ? (
          <button
            type="button"
            onClick={onClearRemote}
            className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-on-surface)]"
            aria-label="재택근무 해제"
          >
            <X size={16} />
          </button>
        ) : (
          <div className="pointer-events-none relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
            <Search size={16} className={hasValue ? "text-[var(--color-neutral-400)]" : "text-[var(--color-neutral-300)]"} />
          </div>
        )}
      </div>

      {/* Remote work checkbox */}
      {!isRemote && (
        <label
          htmlFor={checkboxId}
          className="inline-flex cursor-pointer items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-1)]"
        >
          <Checkbox
            id={checkboxId}
            checked={false}
            onCheckedChange={() => onRemoteToggle(true)}
          />
          <span className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            재택근무예요
          </span>
        </label>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="px-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-neutral-400)]">
          {helperText}
        </p>
      )}
    </div>
  );
}

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
  const [job1PlaceName, setJob1PlaceName] = useState("");
  const [job2PlaceName, setJob2PlaceName] = useState("");

  function handleSelect(place: KakaoLocalPlace) {
    const address = place.roadAddressName || place.addressName;
    if (searchTarget === "job1") {
      onJob1Change(address);
      onJob1RemoteChange(false);
      setJob1PlaceName(place.placeName);
    } else if (searchTarget === "job2") {
      onJob2Change(address);
      onJob2RemoteChange(false);
      setJob2PlaceName(place.placeName);
    }
    setSearchTarget(null);
  }

  return (
    <>
      <div className="space-y-[var(--space-6)]">
        <h3 className="text-[length:var(--text-title)] font-semibold">
          출퇴근하는 직장 주소를 입력해주세요
        </h3>

        <JobCard
          label="직장 1 (필수)"
          placeName={job1PlaceName}
          address={job1}
          isRemote={job1Remote}
          required
          onTap={() => setSearchTarget("job1")}
          onRemoteToggle={() => {
            onJob1RemoteChange(true);
            onJob1Change("");
            setJob1PlaceName("");
          }}
          onClearRemote={() => {
            onJob1RemoteChange(false);
            onJob1Change("");
            setJob1PlaceName("");
          }}
        />

        <JobCard
          label="직장 2 (선택)"
          placeName={job2PlaceName}
          address={job2}
          isRemote={job2Remote}
          onTap={() => setSearchTarget("job2")}
          onRemoteToggle={() => {
            onJob2RemoteChange(true);
            onJob2Change("");
            setJob2PlaceName("");
          }}
          onClearRemote={() => {
            onJob2RemoteChange(false);
            onJob2Change("");
            setJob2PlaceName("");
          }}
          helperText="맞벌이인 경우 입력하면 더 정확한 통근 분석이 가능합니다."
        />
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

"use client";

import { useCallback, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKakaoAddress } from "@/hooks/useKakaoAddress";

interface AddressSearchProps {
  label: string;
  value: string;
  onChange: (address: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function AddressSearch({
  label,
  value,
  onChange,
  error,
  required = false,
  className,
}: AddressSearchProps) {
  const { open, isLoaded } = useKakaoAddress();
  const [sdkNotice, setSdkNotice] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!isLoaded) {
      setSdkNotice("주소 검색 SDK가 로드되지 않았습니다. 직접 입력해주세요.");
      return;
    }
    setSdkNotice(null);
    try {
      const result = await open();
      onChange(result.roadAddress || result.jibunAddress);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "cancelled") return;
      setSdkNotice("주소 검색 중 오류가 발생했습니다. 직접 입력해주세요.");
    }
  }, [open, onChange, isLoaded]);

  return (
    <div className={cn("w-full", className)}>
      <label className="mb-1 block text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
      </label>
      <div className="flex gap-[var(--space-2)]">
        <div
          className={cn(
            "flex-1 rounded-[var(--radius-s7-md)] border px-[var(--space-4)] py-[var(--space-3)]",
            "flex items-center gap-[var(--space-2)]",
            "text-[length:var(--text-body)] bg-[var(--color-surface-sunken)]",
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)]",
          )}
        >
          <MapPin size={16} className="shrink-0 text-[var(--color-on-surface-muted)]" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="주소를 입력해주세요 (예: 강남, 판교)"
            className={cn(
              "flex-1 bg-transparent outline-none",
              "text-[var(--color-on-surface)] placeholder:text-[var(--color-neutral-400)]",
            )}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className={cn(
            "shrink-0 rounded-[var(--radius-s7-md)] px-[var(--space-4)] py-[var(--space-3)]",
            "bg-[var(--color-primary)] text-[var(--color-on-primary)]",
            "text-[length:var(--text-body-sm)] font-medium",
            "hover:bg-[var(--color-primary-hover)] transition-colors",
            !isLoaded && "opacity-70",
          )}
        >
          주소 검색
        </button>
      </div>
      {sdkNotice && (
        <p className="mt-1 text-[length:var(--text-caption)] text-[var(--color-warning)]">
          {sdkNotice}
        </p>
      )}
      {error && (
        <p className="mt-1 text-[length:var(--text-caption)] text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

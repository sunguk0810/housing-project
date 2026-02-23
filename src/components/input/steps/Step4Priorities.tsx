'use client';

import { useState, useCallback } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { EmojiCardSelector } from '@/components/onboarding/EmojiCardSelector';
import { WEIGHT_PROFILE_ICONS } from '@/components/onboarding/card-icons';
import { CustomWeightSlider } from '@/components/input/CustomWeightSlider';
import { WEIGHT_PROFILES } from '@/lib/engines/scoring';
import type { WeightProfile } from '@/types/api';
import type { CustomWeights } from '@/types/engine';

const PRESET_OPTIONS = [
  {
    value: 'balanced' as const,
    label: '균형잡기',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.balanced,
    description: '모든 조건을 골고루 살펴요',
  },
  {
    value: 'budget_focused' as const,
    label: '가성비 우선',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.budget_focused,
    description: '월 고정비를 가장 먼저 따져요',
  },
  {
    value: 'commute_focused' as const,
    label: '통근 우선',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.commute_focused,
    description: '출퇴근 시간을 가장 먼저 따져요',
  },
  {
    value: 'complex_focused' as const,
    label: '대단지 우선',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.complex_focused,
    description: '세대수가 많은 단지를 우선해요',
  },
  {
    value: 'value_maximized' as const,
    label: '가치 극대화',
    emoji: '',
    icon: WEIGHT_PROFILE_ICONS.value_maximized,
    description: '예산 안에서 최고 품질을 찾아요',
  },
] as const;

/** Convert WEIGHT_PROFILES entry (0-1 per dim) to CustomWeights (0-100, sum=100) */
function profileToCustomWeights(profile: WeightProfile): CustomWeights {
  if (profile === 'custom') {
    return { budget: 28, commute: 24, childcare: 14, safety: 14, school: 12, complexScale: 8 };
  }
  const w = WEIGHT_PROFILES[profile];
  return {
    budget: Math.round(w.budget * 100),
    commute: Math.round(w.commute * 100),
    childcare: Math.round(w.childcare * 100),
    safety: Math.round(w.safety * 100),
    school: Math.round(w.school * 100),
    complexScale: Math.round(w.complexScale * 100),
  };
}

interface Step4Props {
  weightProfile: WeightProfile;
  onWeightProfileChange: (value: WeightProfile) => void;
  customWeights?: CustomWeights;
  onCustomWeightsChange?: (weights: CustomWeights) => void;
}

export function Step4Priorities({
  weightProfile,
  onWeightProfileChange,
  customWeights,
  onCustomWeightsChange,
}: Step4Props) {
  const [isCustomMode, setIsCustomMode] = useState(weightProfile === 'custom');

  const handlePresetSelect = useCallback(
    (value: WeightProfile) => {
      setIsCustomMode(false);
      onWeightProfileChange(value);
      onCustomWeightsChange?.(profileToCustomWeights(value));
    },
    [onWeightProfileChange, onCustomWeightsChange],
  );

  const handleToggleCustom = useCallback(() => {
    if (isCustomMode) {
      setIsCustomMode(false);
      onWeightProfileChange('balanced');
      onCustomWeightsChange?.(profileToCustomWeights('balanced'));
    } else {
      setIsCustomMode(true);
      onWeightProfileChange('custom');
      if (!customWeights) {
        onCustomWeightsChange?.(profileToCustomWeights(weightProfile));
      }
    }
  }, [isCustomMode, weightProfile, customWeights, onWeightProfileChange, onCustomWeightsChange]);

  const handleCustomWeightsChange = useCallback(
    (weights: CustomWeights) => {
      onCustomWeightsChange?.(weights);
      onWeightProfileChange('custom');
      setIsCustomMode(true);
    },
    [onCustomWeightsChange, onWeightProfileChange],
  );

  const effectiveCustomWeights =
    customWeights ?? profileToCustomWeights(weightProfile);

  return (
    <div className="space-y-[var(--space-6)]">
      <div>
        <h3 className="text-[length:var(--text-title)] font-semibold">
          가장 중요한 조건을 알려주세요
        </h3>
        <p className="mt-[var(--space-2)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          분석 프로필을 선택하거나, 직접 가중치를 설정해보세요
        </p>
      </div>

      {/* Preset selector — 2 cols mobile, larger cards */}
      <EmojiCardSelector
        options={PRESET_OPTIONS}
        value={isCustomMode ? undefined : (weightProfile as Exclude<WeightProfile, 'custom'>)}
        onSelect={handlePresetSelect}
        columns="2"
        ariaLabel="분석 프로필 선택"
        className="[&>button]:min-h-[148px] [&>button]:p-[var(--space-4)]"
      />

      {/* Custom toggle — full-width card-like button */}
      <button
        type="button"
        onClick={handleToggleCustom}
        className={`flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-s7-xl)] px-[var(--space-5)] py-[var(--space-4)] text-left transition-all duration-200 ${
          isCustomMode
            ? 'border-2 border-[var(--color-neutral-700)] bg-[var(--color-surface)] shadow-[var(--shadow-s7-sm)]'
            : 'border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)]'
        }`}
        aria-expanded={isCustomMode}
        aria-controls="custom-weight-panel"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            isCustomMode
              ? 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-800)]'
              : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
          }`}
        >
          <SlidersHorizontal size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-[length:var(--text-body)] font-semibold">
            직접 설정
          </span>
          <span className="block text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            6개 축 가중치를 세밀하게 조절해요
          </span>
        </div>
        {isCustomMode ? (
          <ChevronUp size={18} className="shrink-0 text-[var(--color-neutral-700)]" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-[var(--color-on-surface-muted)]" />
        )}
      </button>

      {/* Custom weight sliders */}
      {isCustomMode && (
        <div
          id="custom-weight-panel"
          className="rounded-[var(--radius-s7-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-6)] shadow-[var(--shadow-s7-sm)]"
          style={{ animation: 'fadeSlideUp 200ms var(--ease-out-expo) both' }}
        >
          <CustomWeightSlider
            weights={effectiveCustomWeights}
            onChange={handleCustomWeightsChange}
          />
        </div>
      )}
    </div>
  );
}

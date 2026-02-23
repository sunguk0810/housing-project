'use client';

import { useState, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
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
      // Sync slider values to show what the preset looks like
      onCustomWeightsChange?.(profileToCustomWeights(value));
    },
    [onWeightProfileChange, onCustomWeightsChange],
  );

  const handleToggleCustom = useCallback(() => {
    if (isCustomMode) {
      // Switch back to preset — restore balanced
      setIsCustomMode(false);
      onWeightProfileChange('balanced');
      onCustomWeightsChange?.(profileToCustomWeights('balanced'));
    } else {
      // Switch to custom — start from current preset values
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
      <h3 className="text-[length:var(--text-title)] font-semibold">
        가장 중요한 조건을 알려주세요
      </h3>

      {/* Preset selector */}
      <EmojiCardSelector
        options={PRESET_OPTIONS}
        value={isCustomMode ? undefined : (weightProfile as Exclude<WeightProfile, 'custom'>)}
        onSelect={handlePresetSelect}
        columns="4"
        ariaLabel="분석 프로필 선택"
        className="[&>button]:min-h-[120px]"
      />

      {/* Custom toggle */}
      <button
        type="button"
        onClick={handleToggleCustom}
        className={`flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-s7-lg)] border-[1.5px] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors ${
          isCustomMode
            ? 'border-[var(--color-brand-400)] bg-[var(--color-brand-50)]'
            : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-brand-200)]'
        }`}
        aria-expanded={isCustomMode}
        aria-controls="custom-weight-panel"
      >
        <SlidersHorizontal
          size={18}
          className={
            isCustomMode
              ? 'text-[var(--color-brand-500)]'
              : 'text-[var(--color-on-surface-muted)]'
          }
        />
        <span className="flex-1 text-[length:var(--text-body)] font-medium">
          직접 설정하기
        </span>
        <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {isCustomMode ? '접기' : '6개 축 가중치를 세밀하게 조절'}
        </span>
      </button>

      {/* Custom weight sliders */}
      {isCustomMode && (
        <div
          id="custom-weight-panel"
          className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-5)]"
          style={{ animation: 'fadeSlideUp 200ms var(--ease-out-expo) both' }}
        >
          <p className="mb-[var(--space-4)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            슬라이더를 조절하면 나머지 항목이 자동으로 균형을 맞춥니다. 합계는 항상 100%입니다.
          </p>
          <CustomWeightSlider
            weights={effectiveCustomWeights}
            onChange={handleCustomWeightsChange}
          />
        </div>
      )}
    </div>
  );
}

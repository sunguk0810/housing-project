/**
 * Application constants for M3 frontend.
 * Source of Truth: M3 spec Section 3
 */

import type { LucideIcon } from 'lucide-react';
import { Building2, BarChart3, Map, Train, Trophy, Wallet } from 'lucide-react';
import type {
  ChildPlan,
  LivingAreaKey,
  MarriagePlannedAt,
  PriorityKey,
  StepDefinition,
} from '@/types/ui';
import type { TradeType, BudgetProfile, LoanProgram } from '@/types/api';

// Disclaimer touch-points (5 total per PHASE0 compliance)
export const DISCLAIMER_TEXTS = {
  footer:
    '본 서비스는 참고용 분석 정보를 제공하며, 부동산 거래를 중개하지 않습니다. 모든 투자 결정은 이용자 본인의 판단과 책임 하에 이루어져야 합니다.',
  banner: '본 서비스는 공공 데이터 기반 참고 정보이며, 실제 거래 조건과 다를 수 있습니다.',
  dataSource: '출처: 공공데이터포털, KOSIS 등 공공 데이터 기반 분석 결과',
  externalLink:
    '외부 사이트로 이동합니다. 해당 사이트의 내용은 본 서비스와 무관하며, 별도의 이용약관이 적용됩니다.',
  termsService:
    '본 서비스는 부동산 거래를 중개하는 서비스가 아니며, 공공 데이터에 기반한 참고 정보만을 제공합니다.',
} as const;

export const STEP_DEFINITIONS: ReadonlyArray<StepDefinition> = [
  { step: 1, title: '기본 정보', description: '어떤 형태의 집을 찾고 계세요?' },
  { step: 2, title: '통근지', description: '출퇴근하는 직장 주소를 입력해주세요' },
  { step: 3, title: '재무 정보', description: '소득과 자산 정보를 알려주세요' },
  { step: 4, title: '선호 조건', description: '가장 중요한 조건을 골라주세요' },
  { step: 5, title: '분석 중', description: '최적 단지를 분석하고 있습니다' },
];

export const SESSION_KEYS = {
  formData: 'hc_form_data',
  results: 'hc_results',
  consent: 'hc_consent',
  disclaimerSeen: 'hc_disclaimer_seen',
  visitedApts: 'hc_visited_apts',
  compareItems: 'hc_compare_items',
} as const;

export const POLICY_VERSION = '2026-02-16-v1';

// CTA external links (placeholder — replace with actual URLs when ready)
export const CTA_LINKS = {
  concierge: 'https://example.com/concierge',
  inquiry: 'https://example.com/inquiry',
} as const;

// FORBIDDEN_PHRASES: Defined in test files only (src/__tests__/compliance/)
// to avoid compliance scan false-positives on the definition itself.

export const QUICK_AMOUNT_BUTTONS = {
  small: { label: '+1,000만', value: 1000 },
  medium: { label: '+5,000만', value: 5000 },
  large: { label: '+1억', value: 10000 },
} as const;

export const SORT_OPTIONS: ReadonlyArray<{
  readonly value: 'score' | 'budget' | 'commute';
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: LucideIcon;
}> = [
  { value: 'score', label: '종합 점수순', shortLabel: '종합', icon: Trophy },
  { value: 'budget', label: '예산 적합도순', shortLabel: '예산', icon: Wallet },
  { value: 'commute', label: '통근 시간순', shortLabel: '통근', icon: Train },
];

export interface AnalysisStep {
  readonly label: string;
  readonly subLabel: string;
  readonly icon: LucideIcon;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly durationMs: number;
}

export const ANALYSIS_STEPS: readonly AnalysisStep[] = [
  {
    label: '입력 조건 분석',
    subLabel: '입력값 검증 및 파싱 중...',
    icon: Building2,
    iconBg: '#CFFAFE',
    iconColor: '#0E7490',
    durationMs: 2000,
  },
  {
    label: '통근 경로 계산',
    subLabel: '대중교통 경로 탐색 중...',
    icon: Train,
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
    durationMs: 2500,
  },
  {
    label: '예산 적합도 시뮬레이션',
    subLabel: '소득 대비 상환 비율 산출 중...',
    icon: BarChart3,
    iconBg: '#FFFBEB',
    iconColor: '#B45309',
    durationMs: 2000,
  },
  {
    label: '조건 부합 단지 탐색',
    subLabel: '1,000여 개 단지 필터링 중...',
    icon: Map,
    iconBg: '#F0FDF4',
    iconColor: '#15803D',
    durationMs: 1500,
  },
];

export interface EmojiCardOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  readonly emoji: string;
}

export const TRADE_OPTIONS_V2: ReadonlyArray<EmojiCardOption<TradeType>> = [
  { value: 'sale', label: '매매', emoji: '🏠' },
  { value: 'jeonse', label: '전세', emoji: '🏢' },
];

export const BUDGET_PROFILE_OPTIONS: ReadonlyArray<EmojiCardOption<BudgetProfile> & { description: string }> = [
  { value: 'firstTime', label: '생애최초', emoji: '🏠', description: 'LTV 70%, 첫 주택 구입' },
  { value: 'noProperty', label: '무주택', emoji: '🔑', description: '처분조건부 1주택 포함' },
  { value: 'homeowner', label: '1주택자', emoji: '📋', description: '규제지역 매매대출 불가' },
];

export const LOAN_PROGRAM_OPTIONS: ReadonlyArray<EmojiCardOption<LoanProgram> & { description: string }> = [
  { value: 'bankMortgage', label: '은행 주담대', emoji: '🏦', description: '15억 이하 대출 가능' },
  { value: 'bogeumjari', label: '보금자리론', emoji: '📋', description: '6억 이하 주택 전용' },
];

export const PRIORITY_OPTIONS: ReadonlyArray<EmojiCardOption<PriorityKey>> = [
  { value: 'commute', label: '통근', emoji: '🚇' },
  { value: 'childcare', label: '육아', emoji: '👶' },
  { value: 'safety', label: '안전', emoji: '🛡️' },
  { value: 'budget', label: '가성비', emoji: '💰' },
];

export const MARRIAGE_PLAN_OPTIONS: ReadonlyArray<EmojiCardOption<MarriagePlannedAt>> = [
  { value: 'within_6m', label: '6개월 내', emoji: '📅' },
  { value: 'within_1y', label: '1년 내', emoji: '🗓️' },
  { value: 'undecided', label: '미정', emoji: '🤔' },
];

export const CHILD_PLAN_OPTIONS: ReadonlyArray<EmojiCardOption<ChildPlan>> = [
  { value: 'yes', label: '계획있음', emoji: '👶' },
  { value: 'maybe', label: '고민중', emoji: '🙂' },
  { value: 'no', label: '없음', emoji: '🚫' },
];

export const LIVING_AREA_OPTIONS: ReadonlyArray<{
  readonly value: LivingAreaKey;
  readonly label: string;
}> = [
  { value: 'gangnam', label: '강남권' },
  { value: 'yeouido', label: '여의도권' },
  { value: 'pangyo', label: '판교권' },
  { value: 'magok', label: '마곡권' },
  { value: 'gwanghwamun', label: '광화문권' },
  { value: 'jamsil', label: '잠실권' },
];

/**
 * URL-based search condition sharing.
 * Encodes non-sensitive search parameters into a base64 URL parameter.
 * Financial data (cash, income) is excluded per NFR-1 (PII/financial data protection).
 */

import type { CustomWeights } from '@/types/engine';

/** Shareable subset of search conditions — excludes financial info */
export interface ShareableCondition {
  tradeType?: 'sale' | 'jeonse' | 'monthly';
  job1: string;
  job2: string;
  job1Remote: boolean;
  job2Remote: boolean;
  weightProfile: string;
  budgetProfile: string;
  loanProgram: string;
  desiredAreas: string[];
  customWeights?: CustomWeights;
}

/**
 * Encode shareable conditions to a URL-safe base64 string.
 * Uses a compact JSON representation.
 */
export function encodeShareableCondition(
  condition: ShareableCondition,
): string {
  const compact = {
    t: condition.tradeType,
    j1: condition.job1,
    j2: condition.job2,
    j1r: condition.job1Remote,
    j2r: condition.job2Remote,
    wp: condition.weightProfile,
    bp: condition.budgetProfile,
    lp: condition.loanProgram,
    da: condition.desiredAreas,
    ...(condition.customWeights ? { cw: condition.customWeights } : {}),
  };

  const json = JSON.stringify(compact);
  // Use btoa for base64 encoding, handle Unicode with encodeURIComponent
  const base64 = btoa(
    encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1: string) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
  return base64;
}

/**
 * Decode a base64 URL parameter back to shareable conditions.
 * Returns null if the parameter is invalid.
 */
export function decodeShareableCondition(
  encoded: string,
): ShareableCondition | null {
  try {
    const json = decodeURIComponent(
      Array.from(atob(encoded))
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const compact = JSON.parse(json) as Record<string, unknown>;

    if (typeof compact !== 'object' || compact === null) return null;

    return {
      tradeType: compact.t as ShareableCondition['tradeType'],
      job1: String(compact.j1 ?? ''),
      job2: String(compact.j2 ?? ''),
      job1Remote: Boolean(compact.j1r),
      job2Remote: Boolean(compact.j2r),
      weightProfile: String(compact.wp ?? 'balanced'),
      budgetProfile: String(compact.bp ?? 'noProperty'),
      loanProgram: String(compact.lp ?? 'bankMortgage'),
      desiredAreas: Array.isArray(compact.da)
        ? (compact.da as string[])
        : ['small', 'medium', 'large'],
      customWeights: compact.cw as CustomWeights | undefined,
    };
  } catch {
    return null;
  }
}

/** Build a shareable URL from the current origin and search conditions */
export function buildShareUrl(condition: ShareableCondition): string {
  const encoded = encodeShareableCondition(condition);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/search?s=${encoded}`;
}

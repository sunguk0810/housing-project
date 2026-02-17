/**
 * MiniPreview HTML content generator for Kakao CustomOverlay.
 * Not a React component — generates HTML strings for the map SDK.
 *
 * Design spec (ref_1-2 E5): 280-320px, score badge + address line
 */

import { getScoreGrade } from "@/lib/score-utils";
import { GRADE_LABELS } from "@/lib/score-utils";
import { formatPrice, formatTradeTypeLabel } from "@/lib/format";
import { escapeHtml } from "@/lib/sanitize";

export function createMiniPreviewContent(
  aptName: string,
  score: number,
  tradeType: "sale" | "jeonse" | "monthly",
  averagePrice: number,
  address?: string,
): string {
  const grade = getScoreGrade(score);
  const gradeLabel = GRADE_LABELS[grade];
  const gradeColor = `var(--color-score-${grade})`;

  return `
    <div style="
      position: relative;
      min-width: 280px;
      max-width: 320px;
      background: var(--color-surface);
      border-radius: var(--radius-s7-xl);
      padding: var(--space-3) var(--space-4);
      box-shadow: var(--shadow-s7-md);
      cursor: pointer;
      border: 1px solid var(--color-border);
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(aptName)}
          </div>
          ${address ? `<div style="font-size: 11px; color: var(--color-on-surface-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(address)}</div>` : ""}
          <div style="font-size: 12px; color: var(--color-on-surface-muted); margin-top: 4px;">
            ${formatTradeTypeLabel(tradeType)} ${formatPrice(averagePrice)}
          </div>
        </div>
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${gradeColor};
            color: #FFFFFF;
            font-size: 14px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
          ">${Math.round(score)}</div>
          <span style="font-size: 10px; font-weight: 600; color: ${gradeColor}; margin-top: 2px;">${gradeLabel}</span>
        </div>
      </div>
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        width: 12px;
        height: 12px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
        transform: translateX(-50%) rotate(45deg);
      "></div>
    </div>
  `;
}

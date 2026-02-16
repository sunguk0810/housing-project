/**
 * MiniPreview HTML content generator for Kakao CustomOverlay.
 * Not a React component — generates HTML strings for the map SDK.
 */

import { getScoreGrade } from "@/lib/score-utils";
import { formatPrice, formatTradeTypeLabel } from "@/lib/format";
import { escapeHtml } from "@/lib/sanitize";

export function createMiniPreviewContent(
  aptName: string,
  score: number,
  tradeType: "sale" | "jeonse",
  averagePrice: number,
): string {
  const grade = getScoreGrade(score);

  return `
    <div style="
      position: relative;
      background: var(--color-surface);
      border-radius: 12px;
      padding: 10px 14px;
      box-shadow: 0 4px 16px rgb(0 0 0 / 0.12);
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
      border: 1px solid var(--color-border);
    ">
      <div style="font-weight: 700; margin-bottom: 2px;">${escapeHtml(aptName)}</div>
      <div style="font-size: 11px; color: var(--color-on-surface-muted);">
        <span style="color: var(--color-score-${grade}); font-weight: 600;">${Math.round(score)}점</span>
        · ${formatTradeTypeLabel(tradeType)} ${formatPrice(averagePrice)}
      </div>
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
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

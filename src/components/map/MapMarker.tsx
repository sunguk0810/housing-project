/**
 * MapMarker HTML content generator for Kakao CustomOverlay.
 * Not a React component — generates HTML strings for the map SDK.
 */

import type { MapMarkerState } from "@/types/ui";
import { getScoreGrade } from "@/lib/score-utils";

const STATE_STYLES: Record<MapMarkerState, { bg: string; border: string; text: string }> = {
  default: {
    bg: "var(--color-surface)",
    border: "var(--color-border)",
    text: "var(--color-on-surface)",
  },
  selected: {
    bg: "var(--color-primary)",
    border: "var(--color-primary)",
    text: "var(--color-on-primary)",
  },
  visited: {
    bg: "var(--color-surface-sunken)",
    border: "var(--color-neutral-400)",
    text: "var(--color-on-surface-muted)",
  },
};

export function createMarkerContent(
  rank: number,
  score: number,
  state: MapMarkerState,
): string {
  const grade = getScoreGrade(score);
  const styles = STATE_STYLES[state];

  return `
    <div style="
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 999px;
      background: ${styles.bg};
      border: 2px solid ${styles.border};
      color: ${styles.text};
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
      white-space: nowrap;
    " data-marker-id="${rank}">
      <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--color-score-${grade});
        color: white;
        font-size: 10px;
      ">${rank}</span>
      <span>${Math.round(score)}</span>
    </div>
  `;
}

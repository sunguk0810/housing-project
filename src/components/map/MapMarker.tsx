/**
 * MapMarker HTML content generator for Kakao CustomOverlay.
 * Not a React component — generates HTML strings for the map SDK.
 *
 * Design spec: grade-color based markers (ref_1-1 label-pin pattern)
 * - default: white bg + grade-color text
 * - selected: grade-color bg + white text + scale 1.15
 * - visited: white bg (opacity 0.7) + grade-color text
 */

import type { MapMarkerState } from "@/types/ui";
import { getScoreGrade } from "@/lib/score-utils";

interface MarkerStyle {
  bg: string;
  text: string;
  shadow: string;
  opacity: string;
  scale: string;
}

function getMarkerStyle(grade: string, state: MapMarkerState): MarkerStyle {
  const gradeColor = `var(--color-score-${grade})`;

  switch (state) {
    case "selected":
      return {
        bg: gradeColor,
        text: "#FFFFFF",
        shadow: `0 4px 16px color-mix(in srgb, ${gradeColor} 25%, transparent)`,
        opacity: "1",
        scale: "scale(1.15)",
      };
    case "visited":
      return {
        bg: "#FFFFFF",
        text: gradeColor,
        shadow: "var(--shadow-s7-sm)",
        opacity: "0.7",
        scale: "scale(1)",
      };
    default:
      return {
        bg: "#FFFFFF",
        text: gradeColor,
        shadow: "var(--shadow-s7-base)",
        opacity: "1",
        scale: "scale(1)",
      };
  }
}

export function createMarkerContent(
  rank: number,
  score: number,
  state: MapMarkerState,
): string {
  const grade = getScoreGrade(score);
  const style = getMarkerStyle(grade, state);

  return `
    <div style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border-radius: 9999px;
      background: ${style.bg};
      color: ${style.text};
      font-size: 13px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      box-shadow: ${style.shadow};
      opacity: ${style.opacity};
      transform: ${style.scale};
      transition: transform 150ms cubic-bezier(0.33, 1, 0.68, 1);
      white-space: nowrap;
    " data-marker-id="${rank}">
      ${Math.round(score)}
    </div>
  `;
}

/**
 * Common normalization and math utilities for engine modules.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine distance between two coordinates in km */
export function haversine(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const R = 6371;
  const dLat = toRad(b.y - a.y);
  const dLon = toRad(b.x - a.x);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.y)) * Math.cos(toRad(b.y)) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Linear normalization to 0~100 range */
export function linearNormalize(
  value: number,
  min: number,
  max: number,
): number {
  if (max === min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/** Inverse normalization to 0~100 (lower value = higher score) */
export function inverseNormalize(
  value: number,
  min: number,
  max: number,
): number {
  if (max === min) return 100;
  return clamp(((max - value) / (max - min)) * 100, 0, 100);
}

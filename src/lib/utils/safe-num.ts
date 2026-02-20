/**
 * Safe numeric cast helpers.
 * Prevents NaN/Infinity/empty-string pollution in DB→API boundaries.
 *
 * [V2] Number.isFinite based: NaN, Infinity, -Infinity, Number("")=0, Number("  ")=0 all blocked.
 * [V6] Log key standard: all events use `safeNum_` prefix for pipeline filtering.
 */

/**
 * Safe numeric cast: null-safe + NaN/Infinity/empty-string guard.
 * Use for nullable DB columns (type `number | null`).
 */
export function safeNum(v: unknown): number | null {
  if (v == null) return null;
  // [V2] Empty string → 0 guard: check before Number() cast
  if (typeof v === 'string' && v.trim() === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * Safe numeric cast for NOT NULL DB fields.
 * [T3+U2+V2] null/NaN/Infinity/empty-string all trigger warn log + fallback.
 * Use for NOT NULL DB columns (type `number`).
 */
export function safeNumRequired(v: unknown, fieldName: string, fallback = 0): number {
  if (v == null) {
    console.warn(JSON.stringify({ event: 'safeNum_required_null', field: fieldName }));
    return fallback;
  }
  if (typeof v === 'string' && v.trim() === '') {
    console.warn(JSON.stringify({ event: 'safeNum_empty_string', field: fieldName }));
    return fallback;
  }
  const n = Number(v);
  if (!Number.isFinite(n)) {
    console.warn(JSON.stringify({ event: 'safeNum_invalid', field: fieldName, rawValue: String(v) }));
    return fallback;
  }
  return n;
}

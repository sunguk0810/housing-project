/**
 * Sanitization utilities for user-facing strings.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape HTML special characters to prevent XSS in innerHTML contexts.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

/**
 * Sanitize cache key: allow only alphanumeric, Korean, spaces, hyphens, dots.
 * Prevents cache key injection via special characters like `:`.
 */
export function sanitizeCacheKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9가-힣\s\-.]/g, "");
}

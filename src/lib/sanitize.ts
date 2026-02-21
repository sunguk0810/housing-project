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
 * Strip dangerous HTML elements and attributes from trusted HTML strings.
 * Defense-in-depth for innerHTML contexts where content is generated internally.
 */
export function stripDangerousHtml(html: string): string {
  return html
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s>][\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript\s*:/gi, "");
}

/**
 * Sanitize cache key: allow only alphanumeric, Korean, spaces, hyphens, dots.
 * Prevents cache key injection via special characters like `:`.
 */
export function sanitizeCacheKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9가-힣\s\-.]/g, "");
}

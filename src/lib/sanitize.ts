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
    // Dangerous elements
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s>][\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s>][\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s>][\s\S]*?<\/embed>/gi, "")
    .replace(/<svg[\s>][\s\S]*?<\/svg>/gi, "")
    .replace(/<math[\s>][\s\S]*?<\/math>/gi, "")
    .replace(/<base[\s>][^>]*>/gi, "")
    .replace(/<form[\s>][\s\S]*?<\/form>/gi, "")
    .replace(/<link[\s>][^>]*>/gi, "")
    .replace(/<meta[\s>][^>]*>/gi, "")
    // Event handlers (quoted and unquoted)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    // Dangerous URI schemes
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:\s*text\/html/gi, "");
}

/**
 * Sanitize cache key: allow only alphanumeric, Korean, spaces, hyphens, dots.
 * Prevents cache key injection via special characters like `:`.
 */
export function sanitizeCacheKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9가-힣\s\-.]/g, "");
}

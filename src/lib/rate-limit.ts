import type { NextRequest } from 'next/server';

/**
 * Simple in-memory rate limiter.
 * Best-effort for serverless (resets per cold start).
 * Upgrade to Redis-backed implementation for production scale.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000; // 1 minute

const store = new Map<string, RateLimitEntry>();

function evictExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Returns true if the key has exceeded maxRequests within the window.
 * Use a composite key (e.g. route + ip) to avoid cross-endpoint bucket collisions.
 */
export function isRateLimited(key: string, maxRequests: number): boolean {
  evictExpired();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= maxRequests) return true;

  entry.count++;
  return false;
}

export function getClientIp(request: NextRequest): string {
  // Production topology: Viewer → CloudFront → nginx → app
  // 1. CloudFront-Viewer-Address: set by CloudFront, contains viewer IP (most trusted)
  // 2. X-Forwarded-For first entry: viewer IP added by CloudFront before nginx appends
  // 3. X-Real-IP: nginx $remote_addr = CloudFront edge IP (least useful, fallback only)
  const cfViewer = request.headers.get('cloudfront-viewer-address');
  if (cfViewer) {
    return stripPort(cfViewer);
  }

  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

/**
 * Strip port from an IP address string, IPv6-safe.
 * "1.2.3.4:12345"         → "1.2.3.4"
 * "2406:da14::1234:5678"  → "2406:da14::1234:5678"  (no port, returned as-is)
 * "[::1]:3000"            → "::1"
 */
function stripPort(addr: string): string {
  const trimmed = addr.trim();
  // Bracketed IPv6 with port: "[::1]:3000"
  if (trimmed.startsWith('[')) {
    const bracketEnd = trimmed.indexOf(']');
    if (bracketEnd !== -1) {
      return trimmed.slice(1, bracketEnd);
    }
  }
  // Plain IPv6 (contains multiple colons, no brackets) — return as-is
  if (trimmed.indexOf(':') !== trimmed.lastIndexOf(':')) {
    return trimmed;
  }
  // IPv4 with port: "1.2.3.4:12345", or plain IPv4
  const colonIdx = trimmed.lastIndexOf(':');
  return colonIdx !== -1 ? trimmed.slice(0, colonIdx) : trimmed;
}

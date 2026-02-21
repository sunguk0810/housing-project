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
  // Prefer x-real-ip (set by nginx to $remote_addr — most trusted).
  // Fallback: last entry of x-forwarded-for (appended by nginx, harder to spoof).
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',');
    return parts[parts.length - 1].trim();
  }

  return 'unknown';
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * In-memory sliding window rate limiter.
 * 5 requests per minute for POST API routes except
 * /api/recommend (route-level limiter: 10/min).
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const requestLog = new Map<string, number[]>();

// Periodic cleanup to prevent memory leak
const CLEANUP_INTERVAL_MS = 300_000; // 5 minutes
let lastCleanup = Date.now();

function cleanupStaleEntries(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, timestamps] of requestLog) {
    const filtered = timestamps.filter((t) => now - t < WINDOW_MS);
    if (filtered.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, filtered);
    }
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function middleware(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  if (pathname === "/api/recommend" || pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  const now = Date.now();
  cleanupStaleEntries(now);

  const ip = getClientIp(request);
  const timestamps = requestLog.get(ip) ?? [];
  const windowTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (windowTimestamps.length >= MAX_REQUESTS) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED" as const,
          message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        },
      },
      { status: 429 },
    );
  }

  windowTimestamps.push(now);
  requestLog.set(ip, windowTimestamps);

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

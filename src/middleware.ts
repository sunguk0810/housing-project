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
  // Production topology: Viewer → CloudFront → nginx → app
  // 1. CloudFront-Viewer-Address: set by CloudFront, contains viewer IP (most trusted)
  // 2. X-Forwarded-For first entry: viewer IP added by CloudFront before nginx appends
  // 3. X-Real-IP: nginx $remote_addr = CloudFront edge IP (least useful, fallback only)
  const cfViewer = request.headers.get("cloudfront-viewer-address");
  if (cfViewer) {
    return stripPort(cfViewer);
  }

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
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
  if (trimmed.startsWith("[")) {
    const bracketEnd = trimmed.indexOf("]");
    if (bracketEnd !== -1) {
      return trimmed.slice(1, bracketEnd);
    }
  }
  // Plain IPv6 (contains multiple colons, no brackets) — return as-is
  if (trimmed.indexOf(":") !== trimmed.lastIndexOf(":")) {
    return trimmed;
  }
  // IPv4 with port: "1.2.3.4:12345", or plain IPv4
  const colonIdx = trimmed.lastIndexOf(":");
  return colonIdx !== -1 ? trimmed.slice(0, colonIdx) : trimmed;
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

import { NextResponse } from "next/server";
import type { HealthResponse, HealthCheckItem } from "@/types/api";
import { sql } from "@/db/connection";
import { getRedis } from "@/lib/redis";

/**
 * GET /api/health — Health check endpoint.
 * Checks: PostgreSQL, Redis connectivity.
 *
 * Source of Truth: M2 spec Section 6.3
 */

export const dynamic = "force-dynamic";

async function checkPostgres(): Promise<HealthCheckItem> {
  const start = performance.now();
  try {
    await sql`SELECT 1`;
    return {
      name: "postgres",
      status: "ok",
      latencyMs: Math.round(performance.now() - start),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      name: "postgres",
      status: "error",
      latencyMs: Math.round(performance.now() - start),
      message: msg,
    };
  }
}

async function checkRedis(): Promise<HealthCheckItem> {
  const redis = getRedis();
  if (!redis) {
    return {
      name: "redis",
      status: "error",
      message: "REDIS_URL not configured",
    };
  }

  const start = performance.now();
  try {
    await redis.ping();
    return {
      name: "redis",
      status: "ok",
      latencyMs: Math.round(performance.now() - start),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      name: "redis",
      status: "error",
      latencyMs: Math.round(performance.now() - start),
      message: msg,
    };
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const checks = await Promise.all([checkPostgres(), checkRedis()]);

  const allOk = checks.every((c) => c.status === "ok");

  const response: HealthResponse = {
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.0.0",
    checks,
  };

  return NextResponse.json(response, { status: allOk ? 200 : 503 });
}

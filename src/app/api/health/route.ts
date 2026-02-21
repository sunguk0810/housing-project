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
  } catch {
    return {
      name: "postgres",
      status: "error",
      latencyMs: Math.round(performance.now() - start),
      message: "unavailable",
    };
  }
}

async function checkRedis(): Promise<HealthCheckItem> {
  const redis = getRedis();
  if (!redis) {
    return {
      name: "redis",
      status: "error",
      message: "not configured",
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
  } catch {
    return {
      name: "redis",
      status: "error",
      latencyMs: Math.round(performance.now() - start),
      message: "unavailable",
    };
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const checks = await Promise.all([checkPostgres(), checkRedis()]);

  const allOk = checks.every((c) => c.status === "ok");
  const pgOk = checks.find((c) => c.name === "postgres")?.status === "ok";

  const response: HealthResponse = {
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.NODE_ENV === "production" ? undefined : process.env.npm_package_version ?? "0.0.0",
    checks,
  };

  // DB healthy → 200 (Redis failure = degraded but still operational)
  // DB down → 503
  return NextResponse.json(response, { status: pgOk ? 200 : 503 });
}

/**
 * ODsay commute grid runner — DB writes enabled, daily limit aware.
 * Resume-safe: skips already-processed grid points.
 * Run daily: pnpm exec tsx --env-file=.env scripts/run-odsay.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

// Load .env
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  const { runCommuteGrid } = await import("@/etl/adapters/odsay-grid");
  const { closePool } = await import("@/db/connection");

  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(
      "Usage: pnpm exec tsx --env-file=.env scripts/run-odsay.ts [--max-points N] [--dry-run] [--full-refresh]",
    );
    console.log("  --max-points N   최대 처리 포인트 수 (예: 20)");
    console.log("  --dry-run        실행 로그/진행만 확인, DB 쓰기 없음");
    console.log("  --full-refresh   기존 commute_times/commute_grid를 지우고 전체 재계산");
    console.log("  ODSAY_DEBUG=true 디버그 JSON 로그 활성화");
    return;
  }

  const dryRun = args.includes("--dry-run");
  const fullRefresh = args.includes("--full-refresh") || args.includes("--rebuild");

  let maxPoints = Number.POSITIVE_INFINITY;
  const maxPointsArgIdx = args.findIndex((arg) => {
    if (arg === "--max-points" || arg === "--max") return true;
    if (arg.startsWith("--max-points=")) return true;
    if (arg.startsWith("--max=")) return true;
    return false;
  });

  if (maxPointsArgIdx >= 0) {
    const rawValue =
      args[maxPointsArgIdx] === "--max-points" || args[maxPointsArgIdx] === "--max"
        ? args[maxPointsArgIdx + 1]
        : args[maxPointsArgIdx].split("=")[1];
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed) && parsed > 0) {
      maxPoints = Math.floor(parsed);
    }
  }

  console.log(
    "=== ODsay Commute Grid ===",
  );
  console.log(
    JSON.stringify({
      event: "odsay_run_config",
      dryRun,
      fullRefresh,
      maxPoints,
      debug: process.env.ODSAY_DEBUG === "1" || process.env.ODSAY_DEBUG?.toLowerCase() === "true",
    }),
  );

  const count = await runCommuteGrid(dryRun, maxPoints, fullRefresh);
  console.log(
    `\nProcessed: ${count} points ${dryRun ? "(dry-run, no DB writes)" : "saved to DB"}`,
  );
  if (fullRefresh && !dryRun) {
    console.log("Mode: full refresh (commute_times and commute_grid truncated before run)");
  }

  await closePool();
}

main().catch((err) => {
  console.error("ODsay runner error:", err);
  process.exit(1);
});

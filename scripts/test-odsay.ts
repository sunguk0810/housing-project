/**
 * ODsay grid quick test — 3 points only, dry-run.
 * Run: pnpm exec tsx --env-file=.env scripts/test-odsay.ts
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

  console.log("ODsay grid test — max 3 points, dry-run\n");
  const count = await runCommuteGrid(true, 3);
  console.log(`\nProcessed: ${count} points (dry-run, no DB writes)`);
}

main().catch(console.error);

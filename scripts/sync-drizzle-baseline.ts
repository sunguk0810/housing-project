/**
 * One-shot script: Sync __drizzle_migrations to match the fresh baseline.
 *
 * Steps:
 * 1. Pre-flight: verify drizzle/ folder has exactly 1 SQL + 1 snapshot + 1 journal entry
 * 2. Pre-flight: verify __drizzle_migrations has exactly 2 rows with known hashes
 * 3. Backup existing rows to drizzle/_archived/
 * 4. Compute SHA-256 of the new baseline SQL
 * 5. In a transaction: DELETE all → INSERT 1 row → verify 1 row → COMMIT
 * 6. Close pool
 *
 * Usage: pnpm exec tsx scripts/sync-drizzle-baseline.ts
 */

import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { sql, closePool } from "../src/db/connection";

// Known hashes of original migration rows (for safety verification)
const KNOWN_HASHES: Record<number, string> = {
  1: "76590ec456080a185f8b15fb9712c0179707d218fa44882e936cf8b86702ce21",
  2: "8186790e8333e8c800234e64ff7190e8d9fac36dee665545fddb6a773acc5a01",
};

const PROJECT_ROOT = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
);
const DRIZZLE_DIR = path.join(PROJECT_ROOT, "drizzle");
const META_DIR = path.join(DRIZZLE_DIR, "meta");

function abort(msg: string): never {
  console.error(`\n[ABORT] ${msg}\n`);
  process.exit(1);
}

async function main(): Promise<void> {
  console.log("=== Drizzle Baseline Sync ===\n");

  // ── 1. Pre-flight: file system checks ──────────────────────
  console.log("1. File system checks...");

  // Journal
  const journalPath = path.join(META_DIR, "_journal.json");
  if (!fs.existsSync(journalPath)) {
    abort("_journal.json not found");
  }
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8")) as {
    entries: Array<{ tag: string }>;
  };
  if (journal.entries.length !== 1) {
    abort(`Expected 1 journal entry, found ${journal.entries.length}`);
  }
  const tag = journal.entries[0].tag;
  console.log(`   Journal: 1 entry (tag="${tag}") ✓`);

  // SQL file
  const sqlFiles = fs
    .readdirSync(DRIZZLE_DIR)
    .filter((f) => f.endsWith(".sql"));
  if (sqlFiles.length !== 1) {
    abort(`Expected 1 SQL file in drizzle/, found ${sqlFiles.length}`);
  }
  const sqlPath = path.join(DRIZZLE_DIR, sqlFiles[0]);
  const sqlContent = fs.readFileSync(sqlPath, "utf-8");
  if (sqlContent.trim().length === 0) {
    abort("SQL file is empty");
  }
  console.log(`   SQL: ${sqlFiles[0]} (${sqlContent.length} bytes) ✓`);

  // Snapshot
  const snapshots = fs
    .readdirSync(META_DIR)
    .filter((f) => f.endsWith("_snapshot.json"));
  if (snapshots.length !== 1) {
    abort(`Expected 1 snapshot, found ${snapshots.length}`);
  }
  console.log(`   Snapshot: ${snapshots[0]} ✓`);

  // ── 2. Pre-flight: DB checks ───────────────────────────────
  console.log("\n2. DB checks...");

  const rows = await sql`
    SELECT id, hash, created_at
    FROM drizzle."__drizzle_migrations"
    ORDER BY id
  `;

  if (rows.length !== 2) {
    abort(
      `Expected exactly 2 rows in __drizzle_migrations, found ${rows.length}`,
    );
  }

  for (const row of rows) {
    const id = row.id as number;
    const hash = row.hash as string;
    const expected = KNOWN_HASHES[id];
    if (!expected) {
      abort(`Unexpected row id=${id}`);
    }
    if (hash !== expected) {
      abort(
        `Hash mismatch for id=${id}.\n` +
          `  Expected: ${expected}\n` +
          `  Actual:   ${hash}\n` +
          `  This may be due to line-ending differences. Verify manually:\n` +
          `  shasum -a 256 drizzle/_archived/0000_*.sql`,
      );
    }
    console.log(`   Row id=${id}: hash matches ✓`);
  }

  // ── 3. Backup existing rows ────────────────────────────────
  console.log("\n3. Backing up existing rows...");

  const archiveDirs = fs
    .readdirSync(path.join(DRIZZLE_DIR, "_archived"))
    .filter((d) => d.includes("baseline_reset"))
    .sort();
  const latestArchive = archiveDirs[archiveDirs.length - 1];
  if (!latestArchive) {
    abort("No baseline_reset archive directory found");
  }

  const backupPath = path.join(
    DRIZZLE_DIR,
    "_archived",
    latestArchive,
    "__drizzle_migrations_backup.json",
  );
  const backupData = rows.map((r) => ({
    id: r.id,
    hash: r.hash,
    created_at: r.created_at,
  }));
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`   Saved to: ${backupPath} ✓`);

  // ── 4. Compute hash ────────────────────────────────────────
  console.log("\n4. Computing SHA-256 hash...");

  const newHash = crypto
    .createHash("sha256")
    .update(sqlContent)
    .digest("hex");
  console.log(`   Hash: ${newHash}`);
  console.log(
    `   Cross-check: shasum -a 256 ${sqlPath} should match above.`,
  );

  // ── 5. Transaction: DELETE + INSERT + verify ───────────────
  console.log("\n5. Applying transaction...");

  const createdAt = Date.now();

  try {
    await sql.begin(async (tx) => {
      // Delete all existing rows
      const deleted =
        await tx`DELETE FROM drizzle."__drizzle_migrations" RETURNING id`;
      console.log(`   Deleted ${deleted.length} rows`);

      // Insert new baseline row
      await tx`
        INSERT INTO drizzle."__drizzle_migrations" (hash, created_at)
        VALUES (${newHash}, ${createdAt})
      `;
      console.log(`   Inserted 1 row (hash=${newHash.slice(0, 16)}...)"`);

      // Verify exactly 1 row
      const verify = await tx`
        SELECT COUNT(*)::int AS cnt FROM drizzle."__drizzle_migrations"
      `;
      const cnt = verify[0].cnt as number;
      if (cnt !== 1) {
        throw new Error(
          `Post-insert verification failed: expected 1 row, found ${cnt}`,
        );
      }
      console.log(`   Verified: ${cnt} row ✓`);
    });

    console.log("   Transaction committed ✓");
  } catch (err) {
    console.error("   Transaction rolled back!");
    throw err;
  }

  // ── 6. Final read-back ─────────────────────────────────────
  console.log("\n6. Final read-back...");
  const final = await sql`
    SELECT id, hash, created_at FROM drizzle."__drizzle_migrations" ORDER BY id
  `;
  for (const r of final) {
    console.log(`   id=${r.id} hash=${(r.hash as string).slice(0, 16)}... created_at=${r.created_at}`);
  }

  console.log("\n=== Done! Baseline sync complete. ===\n");

  await closePool();
}

main().catch(async (err) => {
  console.error(err);
  await closePool().catch(() => {});
  process.exit(1);
});

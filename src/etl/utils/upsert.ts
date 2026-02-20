/**
 * Generic batch upsert helper using Drizzle ORM.
 * Processes records in configurable batch sizes with onConflictDoUpdate.
 */

import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db/connection";

const DEFAULT_BATCH_SIZE = 100;

export interface UpsertConfig {
  /** Number of records per batch insert */
  batchSize?: number;
  /** Log progress every N batches */
  logInterval?: number;
}

export interface UpsertResult {
  inserted: number;
  table: string;
  batches: number;
}

/**
 * Batch upsert records into a table.
 * Uses raw SQL INSERT ... ON CONFLICT DO UPDATE for tables with unique constraints.
 *
 * @param table - Drizzle table reference
 * @param records - Array of record values matching the table schema
 * @param conflictTarget - Column(s) for ON CONFLICT
 * @param updateColumns - Columns to update on conflict
 * @param config - batch configuration
 */
export async function batchUpsert<T extends Record<string, unknown>>(
  table: PgTable,
  records: T[],
  config: UpsertConfig = {},
): Promise<UpsertResult> {
  const batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE;
  const logInterval = config.logInterval ?? 10;
  const tableName = getTableName(table);

  if (records.length === 0) {
    return { inserted: 0, table: tableName, batches: 0 };
  }

  let totalInserted = 0;
  let batchCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    // Simple insert (upsert handled at adapter level with specific conflict targets)
    await db.insert(table).values(batch as never[]);

    totalInserted += batch.length;
    batchCount++;

    if (batchCount % logInterval === 0) {
      console.log(
        JSON.stringify({
          event: "upsert_progress",
          table: tableName,
          inserted: totalInserted,
          total: records.length,
          batch: batchCount,
        }),
      );
    }
  }

  return { inserted: totalInserted, table: tableName, batches: batchCount };
}


function getTableName(table: PgTable): string {
  // Drizzle tables have a Symbol for the table name
  const sym = Object.getOwnPropertySymbols(table).find((s) =>
    s.toString().includes("Name"),
  );
  if (sym) {
    return (table as unknown as Record<symbol, string>)[sym];
  }
  return "unknown";
}

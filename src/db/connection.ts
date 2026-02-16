import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database connection pool using postgres.js + Drizzle ORM.
 *
 * postgres.js internally manages a connection pool.
 * The `max` option controls pool size.
 *
 * Source of Truth: PHASE1 S1 (tech stack)
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "See .env.example for the expected format.",
  );
}

// postgres.js pool instance
export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
  prepare: true,
  transform: {
    undefined: null,
  },
  connection: {
    application_name: "housing-project",
  },
});

// Drizzle ORM instance with schema for relational queries
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// Graceful shutdown helper
export async function closePool(): Promise<void> {
  await sql.end();
}

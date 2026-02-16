/**
 * ETL adapter interface and error types.
 * Source of Truth: M2 spec Section 4.2
 */

/** All ETL data sources implement this interface */
export interface DataSourceAdapter<T> {
  /** Human-readable name for logging (no PII) */
  readonly name: string;

  /**
   * Fetch raw data from the source, validate, return parsed records.
   * @param params - source-specific query params (region code, date, etc.)
   */
  fetch(params: Record<string, unknown>): Promise<T[]>;
}

export type DataSourceErrorCode =
  | "FETCH_FAILED"
  | "VALIDATION_FAILED"
  | "RATE_LIMITED"
  | "TIMEOUT";

/** Error wrapper — no PII in message */
export class DataSourceError extends Error {
  constructor(
    public readonly source: string,
    public readonly code: DataSourceErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${source}] ${code}: ${message}`);
    this.name = "DataSourceError";
  }
}

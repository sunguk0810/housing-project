/**
 * Generic pagination helper for public APIs.
 * Supports data.go.kr (pageNo/numOfRows) and NEIS (pIndex/pSize) patterns.
 */

export interface PaginationConfig {
  /** Max items per page */
  pageSize: number;
  /** Max pages to fetch (safety cap) */
  maxPages: number;
  /** Delay between pages in ms */
  delayMs?: number;
}

const DEFAULT_CONFIG: PaginationConfig = {
  pageSize: 1000,
  maxPages: 100,
  delayMs: 200,
};

export interface PageResult<T> {
  items: T[];
  totalCount: number;
  pageNo: number;
}

/**
 * Fetch all pages from a paginated API.
 * @param fetchPage - async function that fetches one page. Returns items + totalCount.
 * @param config - pagination configuration
 * @returns all items concatenated
 */
export async function fetchAllPages<T>(
  fetchPage: (pageNo: number, pageSize: number) => Promise<PageResult<T>>,
  config: Partial<PaginationConfig> = {},
): Promise<T[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const allItems: T[] = [];
  let currentPage = 1;

  let lastTotalCount = 0;

  while (currentPage <= cfg.maxPages) {
    const result = await fetchPage(currentPage, cfg.pageSize);
    allItems.push(...result.items);
    lastTotalCount = result.totalCount;

    // Check if we have all items
    if (
      result.items.length < cfg.pageSize ||
      allItems.length >= result.totalCount
    ) {
      break;
    }

    currentPage++;

    // Rate limit delay between pages
    if (cfg.delayMs && cfg.delayMs > 0) {
      await delay(cfg.delayMs);
    }
  }

  // Warn if maxPages cap was hit before all records were fetched
  if (currentPage > cfg.maxPages && allItems.length < lastTotalCount) {
    console.log(
      JSON.stringify({
        event: "paginate_cap_hit",
        fetched: allItems.length,
        totalCount: lastTotalCount,
        maxPages: cfg.maxPages,
      }),
    );
  }

  return allItems;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

"use client";

import { useSyncExternalStore } from "react";
import { SESSION_KEYS } from "@/lib/constants";
import type { RecommendResponse, RecommendationItem } from "@/types/api";

export interface ComparePageData {
  readonly items: ReadonlyArray<RecommendationItem>;
  readonly hasResults: boolean;
}

export const EMPTY_PAGE_DATA: ComparePageData = { items: [], hasResults: false };

// Cache getSnapshot result to satisfy useSyncExternalStore's Object.is() comparison.
// Without caching, each call returns a new object reference → infinite re-render loop.
let cachedRaw: string | null = null;
let cachedResult: ComparePageData = EMPTY_PAGE_DATA;

function parseSessionResults(): ComparePageData {
  try {
    const stored = sessionStorage.getItem(SESSION_KEYS.results);
    // Return cached result if underlying data hasn't changed
    if (stored === cachedRaw) return cachedResult;
    cachedRaw = stored;

    if (!stored) {
      cachedResult = EMPTY_PAGE_DATA;
      return cachedResult;
    }
    const raw: unknown = JSON.parse(stored);
    if (
      !raw ||
      typeof raw !== "object" ||
      !("recommendations" in raw) ||
      !Array.isArray((raw as Record<string, unknown>).recommendations)
    ) {
      cachedResult = EMPTY_PAGE_DATA;
      return cachedResult;
    }
    cachedResult = {
      items: (raw as RecommendResponse).recommendations,
      hasResults: true,
    };
    return cachedResult;
  } catch {
    cachedResult = EMPTY_PAGE_DATA;
    return cachedResult;
  }
}

// useSyncExternalStore: SSR returns EMPTY, client reads sessionStorage (no hydration mismatch)
const noop = () => () => {};

export function useSessionPageData(): ComparePageData {
  return useSyncExternalStore(noop, parseSessionResults, () => EMPTY_PAGE_DATA);
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface KakaoLocalPlace {
  readonly id: string;
  readonly placeName: string;
  readonly addressName: string;
  readonly roadAddressName: string;
  readonly categoryGroupName: string;
  readonly x: string;
  readonly y: string;
}

interface UseKakaoLocalSearchReturn {
  query: string;
  results: readonly KakaoLocalPlace[];
  isLoading: boolean;
  error: string | null;
  search: (keyword: string) => void;
  clear: () => void;
}

const DEBOUNCE_MS = 300;

export function useKakaoLocalSearch(): UseKakaoLocalSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly KakaoLocalPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const search = useCallback((keyword: string) => {
    setQuery(keyword);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (keyword.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/kakao-local?query=${encodeURIComponent(keyword.trim())}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error("검색에 실패했습니다.");
        }

        const data = await res.json();
        const places: KakaoLocalPlace[] = (data.documents ?? []).map(
          (doc: Record<string, string>) => ({
            id: doc.id,
            placeName: doc.place_name,
            addressName: doc.address_name,
            roadAddressName: doc.road_address_name,
            categoryGroupName: doc.category_group_name ?? "",
            x: doc.x,
            y: doc.y,
          }),
        );
        setResults(places);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "검색에 실패했습니다.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { query, results, isLoading, error, search, clear };
}

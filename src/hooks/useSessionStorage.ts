"use client";

import { useState, useCallback } from "react";

/**
 * SessionStorage hook with hc_ prefix.
 * localStorage access is forbidden (PII compliance).
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const prefixedKey = key.startsWith("hc_") ? key : `hc_${key}`;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = sessionStorage.getItem(prefixedKey);
      if (!item) return initialValue;
      const parsed: unknown = JSON.parse(item);
      // Basic type guard: reject if top-level type doesn't match initialValue
      if (typeof parsed !== typeof initialValue) return initialValue;
      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(prefixedKey, JSON.stringify(nextValue));
          } catch {
            // SessionStorage quota exceeded — silently ignore
          }
        }
        return nextValue;
      });
    },
    [prefixedKey],
  );

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(prefixedKey);
    }
    setStoredValue(initialValue);
  }, [prefixedKey, initialValue]);

  return [storedValue, setValue, clear];
}

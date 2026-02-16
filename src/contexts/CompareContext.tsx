"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react";
import { SESSION_KEYS } from "@/lib/constants";

export interface CompareItem {
  readonly aptId: number;
  readonly aptName: string;
  readonly finalScore: number;
}

interface CompareState {
  readonly items: ReadonlyArray<CompareItem>;
}

type CompareAction =
  | { type: "ADD"; item: CompareItem }
  | { type: "REMOVE"; aptId: number }
  | { type: "HYDRATE"; items: ReadonlyArray<CompareItem> };

const MAX_ITEMS = 3;

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "ADD": {
      if (state.items.length >= MAX_ITEMS) return state;
      if (state.items.some((i) => i.aptId === action.item.aptId)) return state;
      return { items: [...state.items, action.item] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.aptId !== action.aptId) };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

interface CompareContextValue {
  readonly items: ReadonlyArray<CompareItem>;
  readonly addItem: (item: CompareItem) => void;
  readonly removeItem: (aptId: number) => void;
  readonly isComparing: (aptId: number) => boolean;
  readonly canAdd: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, { items: [] });

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEYS.compareItems);
      if (stored) {
        const parsed: CompareItem[] = JSON.parse(stored);
        dispatch({ type: "HYDRATE", items: parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Sync to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEYS.compareItems, JSON.stringify(state.items));
    } catch {
      // Ignore storage errors
    }
  }, [state.items]);

  const addItem = useCallback((item: CompareItem) => {
    dispatch({ type: "ADD", item });
  }, []);

  const removeItem = useCallback((aptId: number) => {
    dispatch({ type: "REMOVE", aptId });
  }, []);

  const isComparing = useCallback(
    (aptId: number) => state.items.some((i) => i.aptId === aptId),
    [state.items],
  );

  const canAdd = state.items.length < MAX_ITEMS;

  const value = useMemo(
    () => ({ items: state.items, addItem, removeItem, isComparing, canAdd }),
    [state.items, addItem, removeItem, isComparing, canAdd],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount.
 * Placed in the root layout so it runs once on app load.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV === "development"
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // SW registration failed — silently ignore
      });
  }, []);

  return null;
}

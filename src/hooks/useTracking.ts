"use client";

import { useRef, useEffect } from "react";
import { trackEvent, type TrackingEvent } from "@/lib/tracking";

/**
 * Fire a tracking event once per mount (deduplicated via useRef).
 */
export function useTracking(event: TrackingEvent): void {
  const fired = useRef(false);

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      trackEvent(event);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

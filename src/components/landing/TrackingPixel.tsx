"use client";

import { useTracking } from "@/hooks/useTracking";

export function TrackingPixel() {
  useTracking({ name: "landing_unique_view" });
  return null;
}

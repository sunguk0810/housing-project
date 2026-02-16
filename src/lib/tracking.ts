/**
 * Analytics event tracking.
 * Source of Truth: M3 spec Section 6
 *
 * Dev: console.log, Prod: window.dataLayer (GTM)
 */

export type TrackingEvent =
  | { name: "landing_unique_view" }
  | { name: "min_input_start" }
  | { name: "step_complete"; step: number }
  | { name: "consent_shown" }
  | { name: "consent_accepted"; policyVersion: string }
  | { name: "result_view"; count: number }
  | { name: "concierge_unique_view"; aptId: number }
  | { name: "concierge_contact_click"; aptId: number }
  | { name: "inquiry_click"; aptId: number }
  | { name: "outlink_click"; aptId: number; url: string };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: TrackingEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[track]", event.name, event);
    return;
  }

  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: event.name,
      ...event,
    });
  }
}

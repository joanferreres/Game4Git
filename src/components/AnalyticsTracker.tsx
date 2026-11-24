import { useAnalyticsTracking } from "@/hooks/useAnalytics";

export function AnalyticsTracker() {
  // Turnstile is loaded lazily by useAnalyticsTracking (after first interaction),
  // so it never competes with the page's own assets during load.
  useAnalyticsTracking();
  return null;
}

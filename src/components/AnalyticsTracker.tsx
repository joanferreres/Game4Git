import { useEffect } from "react";
import { useAnalyticsTracking } from "@/hooks/useAnalytics";
import { ensureTurnstileWidget } from "@/lib/turnstile";

export function AnalyticsTracker() {
  useAnalyticsTracking();
  useEffect(() => {
    void ensureTurnstileWidget();
  }, []);
  return null;
}

import { useEffect } from "react";
import { useAnalyticsTracking } from "@/hooks/useAnalytics";
import { ensureTurnstileWidget } from "@/lib/turnstile";

export function AnalyticsTracker() {
  useAnalyticsTracking();
  useEffect(() => {
    // Prefetch after first paint; ensureTurnstileWidget also idle-gates script load.
    const kick = () => {
      void ensureTurnstileWidget();
    };
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(kick);
      });
      return;
    }
    const t = window.setTimeout(kick, 0);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}

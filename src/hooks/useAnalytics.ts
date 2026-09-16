import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureTurnstileWidget, getTurnstileToken, resetTurnstile } from '@/lib/turnstile';

interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

function extractUtmParams(): UtmParams {
  if (typeof window === 'undefined') {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null };
  }
  const searchParams = new URLSearchParams(window.location.search);
  return {
    utm_source: searchParams.get('utm_source'),
    utm_medium: searchParams.get('utm_medium'),
    utm_campaign: searchParams.get('utm_campaign'),
    utm_content: searchParams.get('utm_content'),
    utm_term: searchParams.get('utm_term'),
  };
}

function getReferrer(): string | null {
  if (typeof window === 'undefined') return null;
  return document.referrer || null;
}

async function sendAnalyticsEvent(path: string): Promise<void> {
  try {
    // Warm widget in background; do not block track on deferred script load (fail-open).
    void ensureTurnstileWidget();
    const turnstileToken = await getTurnstileToken('analytics', 4000);
    const utm = extractUtmParams();
    const referrer = getReferrer();

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, referrer, utm, turnstileToken }),
      credentials: 'include',
    });
  } catch (e) {
    console.debug('Analytics tracking failed:', e);
  } finally {
    resetTurnstile();
  }
}

export function useAnalyticsTracking(): void {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const path = location.pathname + location.search;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      prevPathRef.current = path;
      sendAnalyticsEvent(path);
      return;
    }

    if (prevPathRef.current !== path) {
      prevPathRef.current = path;
      sendAnalyticsEvent(path);
    }
  }, [location.pathname, location.search]);
}

export function trackEvent(path: string): void {
  sendAnalyticsEvent(path);
}
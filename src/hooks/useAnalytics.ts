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

const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
// Real visitors almost always interact; this cap keeps pageviews from non-interactive
// visits (e.g. reading without scrolling) without loading Turnstile during page load.
const INTERACTION_FALLBACK_MS = 8000;

let interactionPromise: Promise<void> | null = null;

/**
 * Turnstile pulls ~2 MB of challenge assets. Keep it off the loading path: wait for
 * the first user interaction (or a fallback timer) before loading it.
 */
function waitForInteraction(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (interactionPromise) return interactionPromise;

  interactionPromise = new Promise<void>((resolve) => {
    let timer: number | undefined;
    const done = () => {
      window.clearTimeout(timer);
      INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, done));
      resolve();
    };
    INTERACTION_EVENTS.forEach((name) =>
      window.addEventListener(name, done, { once: true, passive: true }),
    );
    timer = window.setTimeout(done, INTERACTION_FALLBACK_MS);
  });
  return interactionPromise;
}

async function sendAnalyticsEvent(path: string): Promise<void> {
  try {
    await waitForInteraction();
    // Wait for the widget so the pageview can get a token.
    // Still fail-open: if Turnstile is slow/blocked, track with verified=0.
    await ensureTurnstileWidget();
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
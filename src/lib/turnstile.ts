const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, opts: Record<string, unknown>) => string;
      execute: (widgetId: string | HTMLElement, opts?: Record<string, unknown>) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      ready: (cb: () => void) => void;
    };
  }
}

let widgetId: string | null = null;
let hostEl: HTMLDivElement | null = null;
let scriptPromise: Promise<void> | null = null;
let ensurePromise: Promise<void> | null = null;
let pendingResolve: ((token: string | null) => void) | null = null;

function siteKey(): string {
  return (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || "";
}

function settlePending(token: string | null): void {
  if (!pendingResolve) return;
  const resolve = pendingResolve;
  pendingResolve = null;
  resolve(token);
}

function waitForTurnstileApi(timeoutMs = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const finish = () => {
      if (!window.turnstile) {
        reject(new Error("turnstile api missing"));
        return;
      }
      if (typeof window.turnstile.ready === "function") {
        try {
          window.turnstile.ready(() => resolve());
          return;
        } catch {
          resolve();
          return;
        }
      }
      resolve();
    };

    const tick = () => {
      if (window.turnstile) {
        finish();
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(new Error("turnstile api timeout"));
        return;
      }
      window.setTimeout(tick, 50);
    };

    tick();
  });
}

export function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    let settled = false;
    const ok = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    const afterScriptPresent = () => {
      waitForTurnstileApi().then(ok).catch(fail);
    };

    const existing = document.querySelector(
      `script[src^="https://challenges.cloudflare.com/turnstile"]`,
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.turnstile) {
        afterScriptPresent();
        return;
      }
      existing.addEventListener("load", () => afterScriptPresent(), { once: true });
      existing.addEventListener("error", () => fail(new Error("turnstile script")), {
        once: true,
      });
      // Also poll in case the script already finished loading.
      afterScriptPresent();
      return;
    }

    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => afterScriptPresent();
    s.onerror = () => fail(new Error("turnstile script"));
    document.head.appendChild(s);
  }).catch((err) => {
    scriptPromise = null;
    throw err;
  });

  return scriptPromise;
}

export async function ensureTurnstileWidget(): Promise<void> {
  const key = siteKey();
  if (!key) return;
  if (widgetId) return;
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      await loadTurnstileScript();
    } catch {
      return;
    }

    if (!window.turnstile || widgetId) return;

    hostEl = document.createElement("div");
    // Keep off-layout; invisible widgets have no footprint, but interaction-only may show briefly.
    hostEl.style.position = "fixed";
    hostEl.style.left = "-9999px";
    hostEl.style.bottom = "0";
    hostEl.style.width = "1px";
    hostEl.style.height = "1px";
    hostEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(hostEl);

    // Callbacks are configured at render time (current Turnstile explicit API).
    // execution: 'execute' defers the challenge until getTurnstileToken() calls execute().
    widgetId = window.turnstile.render(hostEl, {
      sitekey: key,
      action: "analytics",
      execution: "execute",
      appearance: "interaction-only",
      callback: (token: string) => {
        settlePending(token || null);
      },
      "error-callback": () => {
        settlePending(null);
      },
      "timeout-callback": () => {
        settlePending(null);
      },
    });
  })().finally(() => {
    if (!widgetId) ensurePromise = null;
  });

  return ensurePromise;
}

/** Alias matching task interface name. */
export async function ensureTurnstile(): Promise<void> {
  return ensureTurnstileWidget();
}

export function getTurnstileToken(
  action = "analytics",
  timeoutMs = 4000,
): Promise<string | null> {
  return new Promise((resolve) => {
    const key = siteKey();
    if (!key || !window.turnstile || !widgetId) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      pendingResolve = null;
      window.clearTimeout(timer);
      resolve(token);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    pendingResolve = (token) => finish(token);

    try {
      // action is primarily set at render; pass again if runtime supports it
      window.turnstile.execute(widgetId, { action });
    } catch {
      finish(null);
    }
  });
}

export function resetTurnstile(): void {
  if (window.turnstile && widgetId) {
    try {
      window.turnstile.reset(widgetId);
    } catch {
      /* ignore */
    }
  }
  pendingResolve = null;
}

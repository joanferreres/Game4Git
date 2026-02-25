import React, { useState, useEffect } from "react";

/**
 * Defers rendering children until after the first paint (double rAF).
 * Reduces forced reflows by delaying components that read layout (e.g. Radix DropdownMenu, Tooltip, Sheet)
 * until the initial layout is complete.
 */
export const DeferUntilAfterPaint: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setReady(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, []);

  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
};

import React, { useState, useEffect } from "react";

/**
 * Defers rendering children until after the first paint.
 * Reduces forced reflows by delaying components that read layout (e.g. Radix DropdownMenu, Tooltip)
 * until the initial layout is complete.
 */
export const DeferUntilAfterPaint: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
};

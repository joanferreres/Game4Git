import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { cn } from "@/lib/utils";

export type GuideMode = "gdb" | "valgrind" | "gitoryx" | "playground";

const MODES: { id: GuideMode; path: string; labelKey: string; fallback: string }[] = [
  { id: "gdb", path: "/gdb", labelKey: "nav.modeGdb", fallback: "gdb" },
  { id: "valgrind", path: "/valgrind", labelKey: "nav.modeValgrind", fallback: "valgrind" },
  { id: "gitoryx", path: "/gitoryx", labelKey: "nav.modeGitoryx", fallback: "gitoryx" },
  { id: "playground", path: "/playground", labelKey: "nav.modePlayground", fallback: "playground" },
];

interface GuideModeSelectorProps {
  active: GuideMode;
  className?: string;
}

/**
 * Segmented guide-mode switcher (gdb | valgrind | gitoryx | playground).
 * Light gray track + white active pill, mono labels — sits under the page title.
 */
const GuideModeSelector = ({ active, className }: GuideModeSelectorProps) => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();

  return (
    <nav
      aria-label={t("nav.modeSelector", "Guide modes")}
      className={cn(
        "inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-muted p-1",
        className
      )}
    >
      {MODES.map((mode) => {
        const isActive = mode.id === active;
        const label = t(mode.labelKey, mode.fallback);
        return (
          <Link
            key={mode.id}
            to={localizePath(mode.path)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-2 sm:px-3.5 font-mono text-[11px] sm:text-xs font-medium tracking-tight transition-colors whitespace-nowrap",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default GuideModeSelector;

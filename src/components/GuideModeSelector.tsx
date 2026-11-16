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
 * Top guide/mode switcher (gdb | valgrind | gitoryx | playground).
 * Restores the multi-option header control that used to live beside the playground badge.
 */
const GuideModeSelector = ({ active, className }: GuideModeSelectorProps) => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();

  return (
    <nav
      aria-label={t("nav.modeSelector", "Guide modes")}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-muted/60 p-0.5",
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
              "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
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

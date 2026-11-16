import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  GitCommit,
  GitMerge,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DemoOp = "commit" | "branch" | "merge" | "remote" | "conflict" | "stash";
type TourStep = 0 | 1 | 2 | 3;

type GraphNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  message: string;
  branch: "main" | "feature";
  visibleFrom: TourStep;
  highlightOps: DemoOp[];
};

const NODES: GraphNode[] = [
  {
    id: "c0",
    x: 48,
    y: 118,
    label: "a1",
    message: "init",
    branch: "main",
    visibleFrom: 0,
    highlightOps: ["commit", "remote"],
  },
  {
    id: "c1",
    x: 128,
    y: 118,
    label: "b2",
    message: "docs: readme",
    branch: "main",
    visibleFrom: 1,
    highlightOps: ["commit", "remote"],
  },
  {
    id: "c2",
    x: 208,
    y: 118,
    label: "c3",
    message: "feat: base",
    branch: "main",
    visibleFrom: 1,
    highlightOps: ["commit", "branch", "merge"],
  },
  {
    id: "f1",
    x: 288,
    y: 52,
    label: "d4",
    message: "feat: login",
    branch: "feature",
    visibleFrom: 2,
    highlightOps: ["branch", "commit", "conflict"],
  },
  {
    id: "m1",
    x: 368,
    y: 118,
    label: "e5",
    message: "merge feature",
    branch: "main",
    visibleFrom: 3,
    highlightOps: ["merge", "conflict", "remote"],
  },
];

const OPS: { id: DemoOp; icon: typeof GitCommit; cli: string }[] = [
  { id: "commit", icon: GitCommit, cli: "git commit" },
  { id: "branch", icon: GitBranch, cli: "git branch / switch" },
  { id: "merge", icon: GitMerge, cli: "git merge" },
  { id: "remote", icon: Terminal, cli: "git push / fetch" },
  { id: "conflict", icon: GitMerge, cli: "merge conflict" },
  { id: "stash", icon: RotateCcw, cli: "git stash" },
];

type Props = {
  mode?: "mapper" | "tour";
  className?: string;
};

const GitoryxInteractiveDemo: React.FC<Props> = ({ mode = "mapper", className }) => {
  const { t } = useTranslation();
  const [activeOp, setActiveOp] = useState<DemoOp>("commit");
  const [tourStep, setTourStep] = useState<TourStep>(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const effectiveStep: TourStep = mode === "tour" ? tourStep : 3;

  const visibleNodes = useMemo(
    () => NODES.filter((n) => n.visibleFrom <= effectiveStep),
    [effectiveStep]
  );

  const edges = useMemo(() => {
    const byId = Object.fromEntries(visibleNodes.map((n) => [n.id, n]));
    const links: { from: string; to: string; kind: "main" | "feature" | "merge" }[] = [];
    if (byId.c0 && byId.c1) links.push({ from: "c0", to: "c1", kind: "main" });
    if (byId.c1 && byId.c2) links.push({ from: "c1", to: "c2", kind: "main" });
    if (byId.c2 && byId.f1) links.push({ from: "c2", to: "f1", kind: "feature" });
    if (byId.f1 && byId.m1) links.push({ from: "f1", to: "m1", kind: "merge" });
    if (byId.c2 && byId.m1) links.push({ from: "c2", to: "m1", kind: "main" });
    return links;
  }, [visibleNodes]);

  const highlighted = useMemo(() => {
    if (mode === "tour") {
      if (tourStep === 0) return new Set(["c0"]);
      if (tourStep === 1) return new Set(["c1", "c2"]);
      if (tourStep === 2) return new Set(["f1"]);
      return new Set(["m1"]);
    }
    return new Set(
      NODES.filter((n) => n.highlightOps.includes(activeOp) && n.visibleFrom <= 3).map(
        (n) => n.id
      )
    );
  }, [mode, tourStep, activeOp]);

  const activeReveal = hoveredId || focusedId;

  const tourCopy = t(`gitoryx.demo.tour.steps.${tourStep}`, "");
  const opVisual = t(`gitoryx.demo.ops.${activeOp}.visual`, "");
  const opHint = t(`gitoryx.demo.ops.${activeOp}.hint`, "");

  return (
    <div className={cn("space-y-4", className)}>
      {mode === "mapper" ? (
        <div className="flex flex-wrap gap-2" role="listbox" aria-label={t("gitoryx.demo.opsLabel")}>
          {OPS.map((op) => {
            const Icon = op.icon;
            const selected = activeOp === op.id;
            return (
              <button
                key={op.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setActiveOp(op.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs sm:text-sm transition-colors",
                  selected
                    ? "border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-600 dark:bg-sky-900/40 dark:text-sky-100"
                    : "border-border bg-background/60 text-muted-foreground hover:border-sky-300 hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <code className="font-mono">{op.cli}</code>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {t("gitoryx.demo.tour.stepLabel", { step: tourStep + 1, total: 4 })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={tourStep === 0}
              onClick={() => setTourStep((s) => (s > 0 ? ((s - 1) as TourStep) : s))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t("gitoryx.demo.tour.prev", "Previous")}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1 bg-sky-600 hover:bg-sky-700"
              disabled={tourStep === 3}
              onClick={() => setTourStep((s) => (s < 3 ? ((s + 1) as TourStep) : s))}
            >
              {t("gitoryx.demo.tour.next", "Next")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            {tourStep === 3 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() => setTourStep(0)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("gitoryx.demo.tour.restart", "Restart")}
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div
          className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-900 dark:to-sky-950/40"
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="absolute left-3 top-3 z-10 rounded bg-background/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
            {t("gitoryx.demo.graphLabel", "Simplified commit graph")}
          </div>
          <svg
            viewBox="0 0 420 180"
            className="h-auto w-full"
            role="img"
            aria-label={t("gitoryx.demo.graphAria")}
          >
            {edges.map((e) => {
              const from = visibleNodes.find((n) => n.id === e.from);
              const to = visibleNodes.find((n) => n.id === e.to);
              if (!from || !to) return null;
              const active =
                highlighted.has(from.id) || highlighted.has(to.id) || e.kind === "feature";
              return (
                <line
                  key={`${e.from}-${e.to}-${e.kind}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={e.kind === "feature" ? "#0ea5e9" : e.kind === "merge" ? "#0284c7" : "#64748b"}
                  strokeWidth={active ? 3 : 2}
                  strokeOpacity={active ? 0.95 : 0.45}
                />
              );
            })}

            {/* branch labels */}
            {visibleNodes.some((n) => n.id === "c2") ? (
              <text x={208} y={148} className="fill-slate-500 text-[10px]" textAnchor="middle">
                main
              </text>
            ) : null}
            {visibleNodes.some((n) => n.id === "f1") ? (
              <text x={288} y={28} className="fill-sky-600 text-[10px]" textAnchor="middle">
                feature
              </text>
            ) : null}

            {visibleNodes.map((node) => {
              const isHi = highlighted.has(node.id);
              const isReveal = activeReveal === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredId(node.id)}
                  onFocus={() => setFocusedId(node.id)}
                  onBlur={() => setFocusedId(null)}
                  onClick={() => setFocusedId(node.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.label}: ${node.message}`}
                >
                  <circle
                    r={isHi || isReveal ? 14 : 11}
                    fill={node.branch === "feature" ? "#0ea5e9" : "#334155"}
                    stroke={isReveal ? "#fbbf24" : isHi ? "#38bdf8" : "#e2e8f0"}
                    strokeWidth={isReveal || isHi ? 3 : 2}
                    className="transition-all"
                  />
                  <text
                    y={4}
                    textAnchor="middle"
                    className="fill-white text-[9px] font-mono font-semibold pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {activeReveal ? (
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-md border border-amber-200/80 bg-amber-50/95 px-3 py-2 text-xs text-amber-950 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/90 dark:text-amber-50">
              {(() => {
                const node = NODES.find((n) => n.id === activeReveal);
                if (!node) return null;
                return (
                  <>
                    <span className="font-mono font-semibold">{node.label}</span>
                    <span className="mx-1.5 text-amber-700/70 dark:text-amber-200/70">·</span>
                    <span>{node.message}</span>
                    <span className="ml-2 text-amber-800/80 dark:text-amber-100/70">
                      ({node.branch})
                    </span>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="absolute bottom-3 left-3 right-3 text-[11px] text-muted-foreground">
              {t("gitoryx.demo.hoverHint", "Hover or focus a commit to reveal its message.")}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          {mode === "mapper" ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("gitoryx.demo.mappingLabel", "CLI → visual")}
              </p>
              <code className="mt-2 block font-mono text-sm text-sky-800 dark:text-sky-200">
                {OPS.find((o) => o.id === activeOp)?.cli}
              </code>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{opVisual}</p>
              <p className="mt-2 text-xs text-muted-foreground">{opHint}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("gitoryx.demo.tour.panelLabel", "Mini tour")}
              </p>
              <h3 className="mt-2 text-base font-semibold">
                {t(`gitoryx.demo.tour.titles.${tourStep}`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tourCopy}</p>
              <ol className="mt-4 flex gap-1.5" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <li
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      i <= tourStep ? "bg-sky-500" : "bg-muted"
                    )}
                  />
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitoryxInteractiveDemo;

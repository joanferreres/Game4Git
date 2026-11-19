import { useState } from "react";
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
import { GITORYX_OPERATIONS, type GitoryxOperation } from "@/lib/gitoryxOperations";


type GraphNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  message: string;
  branch: "main" | "feature";
  visibleFrom: number;
  highlightOps: GitoryxOperation[];
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
    visibleFrom: 0,
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
    highlightOps: ["branch", "commit", "fast-forward"],
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

const EDGES = [
  { from: "c0", to: "c1", kind: "main" },
  { from: "c1", to: "c2", kind: "main" },
  { from: "c2", to: "f1", kind: "feature" },
  { from: "f1", to: "m1", kind: "feature" },
  { from: "c2", to: "m1", kind: "main" },
] as const;

const TOUR_HIGHLIGHTS = ["c1", "c2", "f1", "m1"];
const lastTourStep = TOUR_HIGHLIGHTS.length - 1;

const operationIcons = {
  commit: GitCommit,
  branch: GitBranch,
  merge: GitMerge,
  "fast-forward": GitMerge,
  remote: Terminal,
  conflict: GitMerge,
  stash: RotateCcw,
} satisfies Record<GitoryxOperation, typeof GitCommit>;

const operations = Object.keys(GITORYX_OPERATIONS) as GitoryxOperation[];

type Props = {
  mode: "mapper" | "tour";
  initialOperation?: GitoryxOperation | null;
};

export default function GitoryxInteractiveDemo({ mode, initialOperation }: Props) {
  const { t } = useTranslation();
  const [activeOp, setActiveOp] = useState<GitoryxOperation>(initialOperation ?? "commit");
  const [tourStep, setTourStep] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);

  const isFastForward = mode === "mapper" && activeOp === "fast-forward";
  const effectiveStep = mode === "tour" ? tourStep : isFastForward ? lastTourStep - 1 : lastTourStep;
  const visibleNodes = NODES.filter((node) => node.visibleFrom <= effectiveStep);
  const mainTip = visibleNodes.reduce<GraphNode | undefined>(
    (tip, node) => node.branch === "main" ? node : tip,
    undefined
  );
  const revealedNode = visibleNodes.find((node) => node.id === pickedId);
  const isHighlighted = (node: GraphNode) =>
    mode === "tour"
      ? TOUR_HIGHLIGHTS[tourStep] === node.id
      : node.highlightOps.includes(activeOp);

  function goToStep(step: number) {
    setPickedId(null);
    setTourStep(step);
  }

  const tourCopy = t(`gitoryx.demo.tour.steps.${tourStep}`, "");
  const opVisual = t(`gitoryx.demo.ops.${activeOp}.visual`, "");
  const opHint = t(`gitoryx.demo.ops.${activeOp}.hint`, "");

  return (
    <div className="space-y-4">
      {mode === "mapper" ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("gitoryx.demo.opsLabel")}>
          {operations.map((operation) => {
            const Icon = operationIcons[operation];
            const selected = activeOp === operation;
            return (
              <button
                key={operation}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setPickedId(null);
                  setActiveOp(operation);
                }}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:text-sm",
                  selected
                    ? "border-sky-700 bg-sky-50 text-sky-800 dark:border-sky-400 dark:bg-sky-900/40 dark:text-sky-100"
                    : "border-border bg-background/60 text-muted-foreground hover:border-sky-300 hover:text-foreground"
                )}
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                <code className="font-mono">{GITORYX_OPERATIONS[operation]}</code>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {t("gitoryx.demo.tour.stepLabel", { step: tourStep + 1, total: TOUR_HIGHLIGHTS.length })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 gap-1"
              disabled={tourStep === 0}
              onClick={() => goToStep(tourStep - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t("gitoryx.demo.tour.prev", "Previous")}
            </Button>
            <Button
              type="button"
              size="sm"
              className="min-h-11 gap-1 bg-sky-700 text-white hover:bg-sky-800"
              disabled={tourStep === lastTourStep}
              onClick={() => goToStep(tourStep + 1)}
            >
              {t("gitoryx.demo.tour.next", "Next")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 gap-1"
              onClick={() => goToStep(0)}
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5" />
              {t("gitoryx.demo.tour.restart")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-lg border border-border bg-slate-50 px-3 py-3 dark:bg-slate-900">
          <p className="text-sm font-medium">{t("gitoryx.demo.graphLabel")}</p>
          <div className="relative">
            <svg viewBox="0 0 420 156" className="block h-auto w-full" aria-hidden="true">
              {EDGES.map((edge) => {
                const from = visibleNodes.find((node) => node.id === edge.from);
                const to = visibleNodes.find((node) => node.id === edge.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={edge.to + edge.from}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={edge.kind === "main" ? "stroke-slate-500 dark:stroke-slate-400" : "stroke-sky-700 dark:stroke-sky-300"}
                    strokeWidth={3}
                  />
                );
              })}
              {mainTip && !isFastForward && (
                <text x={mainTip.x} y={150} className="fill-slate-700 text-[17px] dark:fill-slate-200" textAnchor="middle">main</text>
              )}
              {effectiveStep >= 2 && (
                <text x={288} y={20} className="fill-sky-800 text-[17px] dark:fill-sky-200" textAnchor="middle">{isFastForward ? "main / feature" : "feature"}</text>
              )}
            </svg>
            {visibleNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                aria-label={`${node.label}, ${node.message}`}
                aria-pressed={pickedId === node.id}
                onClick={() => setPickedId(node.id)}
                style={{ left: `${(node.x / 420) * 100}%`, top: `${(node.y / 156) * 100}%` }}
                className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700 dark:focus-visible:outline-sky-300"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold text-white group-hover:underline",
                    node.branch === "feature" ? "bg-sky-800" : "bg-slate-700",
                    isHighlighted(node) || pickedId === node.id ? "border-sky-300" : "border-transparent",
                    pickedId === node.id && "underline"
                  )}
                >
                  {node.label}
                </span>
              </button>
            ))}
          </div>
          <p role="status" className="mt-3 min-h-10 text-sm text-muted-foreground">
            {revealedNode ? (
              <>
                <code className="font-semibold text-foreground">{revealedNode.label}</code>{" "}
                {revealedNode.message} ({isFastForward && revealedNode.id === "f1" ? "main / feature" : revealedNode.branch})
              </>
            ) : t("gitoryx.start.selectCommit")}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4" aria-live="polite">
          {mode === "mapper" ? (
            <>
              <code className="block font-mono text-sm text-sky-800 dark:text-sky-200">
                {GITORYX_OPERATIONS[activeOp]}
              </code>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{opVisual}</p>
              <p className="mt-2 text-xs text-muted-foreground">{opHint}</p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold">
                {t(`gitoryx.demo.tour.titles.${tourStep}`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tourCopy}</p>
              <ol className="mt-4 flex gap-1.5" aria-hidden>
                {TOUR_HIGHLIGHTS.map((id, i) => (
                  <li
                    key={id}
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
}

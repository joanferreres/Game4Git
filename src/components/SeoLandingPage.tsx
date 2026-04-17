import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppNav from "@/components/AppNav";
import SeoHead from "@/components/SeoHead";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  GitBranch,
  Globe2,
  Home,
  ShieldAlert,
  Sparkles,
  Swords,
  Terminal,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type LandingPageKey =
  | "gitPracticeGame"
  | "gitBranchPractice"
  | "gitMergeConflicts"
  | "valgrindMemoryLeaks";

type RelatedPageTarget =
  | "home"
  | "gdb"
  | "valgrind"
  | "gitPracticeGame"
  | "gitBranchPractice"
  | "gitMergeConflicts"
  | "valgrindMemoryLeaks";

type ExerciseId = "feature-branch" | "merge-conflicts";

interface LandingPageConfig {
  path: string;
  seoKey: LandingPageKey;
  badge: string;
  color: "orange" | "sky" | "amber" | "green";
  icon: typeof Sparkles;
  primaryAction: { type: "exercise"; exercise: ExerciseId } | { type: "path"; path: string };
  secondaryPath: string;
  related: RelatedPageTarget[];
}

const PAGE_CONFIG: Record<LandingPageKey, LandingPageConfig> = {
  gitPracticeGame: {
    path: "/git-practice-game",
    seoKey: "gitPracticeGame",
    badge: "git practice",
    color: "orange",
    icon: Sparkles,
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitBranchPractice", "gitMergeConflicts", "valgrindMemoryLeaks"],
  },
  gitBranchPractice: {
    path: "/git-branch-practice",
    seoKey: "gitBranchPractice",
    badge: "git branch",
    color: "sky",
    icon: GitBranch,
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitPracticeGame", "gitMergeConflicts", "valgrindMemoryLeaks"],
  },
  gitMergeConflicts: {
    path: "/git-merge-conflicts",
    seoKey: "gitMergeConflicts",
    badge: "git merge",
    color: "amber",
    icon: Swords,
    primaryAction: { type: "exercise", exercise: "merge-conflicts" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitPracticeGame", "gitBranchPractice", "valgrindMemoryLeaks"],
  },
  valgrindMemoryLeaks: {
    path: "/valgrind-memory-leaks",
    seoKey: "valgrindMemoryLeaks",
    badge: "valgrind",
    color: "green",
    icon: ShieldAlert,
    primaryAction: { type: "path", path: "/valgrind" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitPracticeGame", "gitBranchPractice", "gitMergeConflicts"],
  },
};

const PAGE_PATHS: Record<RelatedPageTarget, string> = {
  home: "/",
  gdb: "/gdb",
  valgrind: "/valgrind",
  gitPracticeGame: "/git-practice-game",
  gitBranchPractice: "/git-branch-practice",
  gitMergeConflicts: "/git-merge-conflicts",
  valgrindMemoryLeaks: "/valgrind-memory-leaks",
};

type RelatedMeta = { icon: typeof Sparkles; accent: string };

const RELATED_META: Record<RelatedPageTarget, RelatedMeta> = {
  home:                { icon: Home,        accent: "bg-slate-100 text-slate-700" },
  gdb:                 { icon: Terminal,    accent: "bg-slate-100 text-slate-700" },
  valgrind:            { icon: Cpu,         accent: "bg-teal-50 text-teal-700" },
  gitPracticeGame:     { icon: Sparkles,    accent: "bg-[#fff4f1] text-[#c2410c]" },
  gitBranchPractice:   { icon: GitBranch,   accent: "bg-sky-50 text-blue-700" },
  gitMergeConflicts:   { icon: Swords,      accent: "bg-amber-50 text-amber-700" },
  valgrindMemoryLeaks: { icon: ShieldAlert, accent: "bg-green-50 text-green-700" },
};

const getRelatedTitle = (target: RelatedPageTarget, t: ReturnType<typeof useTranslation>["t"]) => {
  switch (target) {
    case "home":
      return t("general.title");
    case "gdb":
      return t("gdb.pageTitle");
    case "valgrind":
      return t("valgrind.pageTitle");
    default:
      return t(`landingPages.${target}.heroTitle`);
  }
};

const getRelatedDescription = (target: RelatedPageTarget, t: ReturnType<typeof useTranslation>["t"]) => {
  switch (target) {
    case "home":
      return t("home.seoIntroShort");
    case "gdb":
      return t("gdb.subtitle");
    case "valgrind":
      return t("valgrind.intro.subtitle");
    default:
      return t(`landingPages.${target}.heroDescription`);
  }
};

const getPrimaryHref = (
  config: LandingPageConfig,
  localizePath: ReturnType<typeof useLocalizedPath>
) => {
  if (config.primaryAction.type === "path") {
    return localizePath(config.primaryAction.path);
  }

  const playgroundPath = localizePath("/playground");
  return `${playgroundPath}?exercise=${config.primaryAction.exercise}`;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? (value as string[]) : [];
}

function asStepArray(
  value: unknown
): Array<{ title: string; description: string }> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(
      (item): item is { title: string; description: string } =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as { title?: unknown }).title === "string" &&
        typeof (item as { description?: unknown }).description === "string"
    )
    .map((item) => ({ title: item.title, description: item.description }));
}

function asFaqArray(value: unknown): Array<{ q: string; a: string }> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(
      (item): item is { q: string; a: string } =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as { q?: unknown }).q === "string" &&
        typeof (item as { a?: unknown }).a === "string"
    )
    .map((item) => ({ q: item.q, a: item.a }));
}

const HERO_IMAGES: Record<LandingPageKey, string> = {
  gitPracticeGame: "/hero-git-practice-game.png",
  gitBranchPractice: "/hero-git-branch-practice.png",
  gitMergeConflicts: "/hero-git-merge-conflicts.png",
  valgrindMemoryLeaks: "/hero-valgrind-memory-leaks.png",
};

const heroWebpSrc = (pngPath: string) => pngPath.replace(/\.png$/i, ".webp");

/** Texto secundario con contraste suficiente en modo claro (WCAG) sin perder estética en oscuro. */
const LANDING_BODY = "text-foreground/80 dark:text-muted-foreground";
const LANDING_SUBTLE = "text-foreground/72 dark:text-muted-foreground";
const LANDING_LABEL = "text-foreground/68 dark:text-muted-foreground";

function HeroPreviewMock({ pageKey, alt }: { pageKey: LandingPageKey; alt: string }) {
  const pngSrc = HERO_IMAGES[pageKey];
  const webpSrc = heroWebpSrc(pngSrc);
  return (
    <div className="relative aspect-[1200/670] overflow-hidden rounded-b-2xl bg-gradient-to-br from-muted/40 via-background to-muted/20">
      <picture>
        <source type="image/webp" srcSet={webpSrc} />
        <img
          src={pngSrc}
          alt={alt}
          width={1200}
          height={670}
          sizes="(min-width: 1024px) min(42vw, 720px), 100vw"
          className="h-full w-full object-cover object-top"
          loading="eager"
          decoding="async"
        />
      </picture>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
    </div>
  );
}

interface SeoLandingPageProps {
  pageKey: LandingPageKey;
}

const SeoLandingPage = ({ pageKey }: SeoLandingPageProps) => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const config = PAGE_CONFIG[pageKey];
  const Icon = config.icon;
  const highlights = asStringArray(t(`landingPages.${pageKey}.highlights`, { returnObjects: true }));
  const steps = asStepArray(t(`landingPages.${pageKey}.steps`, { returnObjects: true }));
  const faqs = asFaqArray(t(`landingPages.${pageKey}.faq`, { returnObjects: true }));
  const primaryHref = getPrimaryHref(config, localizePath);
  const secondaryHref = localizePath(config.secondaryPath);
  const featuredSteps = steps.slice(0, 3);
  const rootRef = useRef<HTMLDivElement>(null);

  const trustItems = [
    { icon: Zap, id: "trustInstant", label: t("landingPages.common.trustInstant") },
    { icon: Globe2, id: "trustVisual", label: t("landingPages.common.trustVisual") },
    { icon: CheckCircle2, id: "trustFree", label: t("landingPages.common.trustFree") },
  ] as const;

  const stepCountLabel = t("landingPages.common.stepCountLabel", { count: featuredSteps.length });
  const stepCountDisplay =
    stepCountLabel.includes("stepCountLabel") && featuredSteps.length > 0
      ? `${featuredSteps.length} steps`
      : stepCountLabel;

  /** Bento solo con exactamente 3 highlights; con otro número, rejilla uniforme y todos visibles. */
  const useBentoThree = highlights.length === 3;
  const bentoLayout = [
    { span: "md:col-span-8 md:row-span-2", i: 0 },
    { span: "md:col-span-4", i: 1 },
    { span: "md:col-span-4", i: 2 },
  ] as const;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const mm = gsap.matchMedia();

      const landingTargets = "[data-landing-header], [data-landing-hero-chunk], [data-landing-reveal]";

      /*
        Dos queries mutuamente excluyentes (ancho + movimiento) para que el revert de GSAP
        no deje autoAlpha/opacity colgados al pasar de desktop a móvil.
      */
      mm.add("(max-width: 639px), (prefers-reduced-motion: reduce)", () => {
        gsap.set(landingTargets, { clearProps: "all" });
      }, root);

      mm.add("(min-width: 640px) and (prefers-reduced-motion: no-preference)", () => {
        /*
          Solo animación en Y + opacidad 1 fija: nunca ocultar el hero (evita pantalla “vacía”
          si el timeline o matchMedia fallan o revert dejan estilos a medias).
        */
        gsap.set("[data-landing-header]", { opacity: 1, visibility: "visible", y: 10 });
        gsap.set("[data-landing-hero-chunk]", { opacity: 1, visibility: "visible", y: 20 });
        gsap.set("[data-landing-reveal]", { opacity: 1, visibility: "visible", y: 28 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
        });

        tl.to("[data-landing-header]", { y: 0, duration: 0.3 }, 0);
        tl.to(
          "[data-landing-hero-left] [data-landing-hero-chunk]",
          { y: 0, duration: 0.45, stagger: 0.05 },
          "<0.05"
        );
        tl.to(
          "[data-landing-hero-right] [data-landing-hero-chunk]",
          { y: 0, duration: 0.42, stagger: 0.05 },
          "<0.08"
        );

        ScrollTrigger.batch("[data-landing-reveal]", {
          start: "top 92%",
          once: true,
          interval: 0.06,
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              duration: 0.5,
              stagger: { each: 0.04, ease: "power1.out" },
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      }, root);

      return () => {
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [pageKey], revertOnUpdate: true }
  );

  // Red de seguridad: al cruzar a viewport estrecho, limpiar estilos inline de GSAP (evita contenido invisible tras encoger desde desktop).
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const clearLandingCaptureStyles = () => {
      const nodes = root.querySelectorAll(
        "[data-landing-header], [data-landing-hero-chunk], [data-landing-reveal]"
      );
      if (nodes.length === 0) return;
      gsap.set(nodes, { clearProps: "all" });
      ScrollTrigger.refresh();
    };

    const mq = window.matchMedia("(max-width: 639px)");
    const onBreakpoint = () => {
      if (mq.matches) clearLandingCaptureStyles();
    };

    onBreakpoint();
    mq.addEventListener("change", onBreakpoint);
    return () => mq.removeEventListener("change", onBreakpoint);
  }, [pageKey]);

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-x-hidden bg-background">
      <SeoHead
        page={config.seoKey}
        preloadHeroImage={heroWebpSrc(HERO_IMAGES[pageKey])}
        preloadHeroImageType="image/webp"
      />
      <AppNav variant="inner" badge={config.badge} showPlaygroundCta />
      <div className="container relative max-w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-5 md:px-8">
        <main className="mx-auto max-w-6xl space-y-16 sm:space-y-20 md:space-y-24">
          {/* Hero */}
          <section className="relative">
            <div className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-muted/30 to-transparent opacity-80 blur-2xl" />
            <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12">
              <div className="order-2 flex min-w-0 flex-col lg:order-1" data-landing-hero-left>
                <div data-landing-hero-chunk className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] bg-orange-brand/10 text-orange-brand"
                  >
                    {t(`landingPages.${pageKey}.eyebrow`)}
                  </Badge>
                  <span
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-[0.18em]",
                      LANDING_LABEL
                    )}
                  >
                    {t("landingPages.common.previewBadge")}
                  </span>
                </div>

                <h1
                  data-landing-hero-chunk
                  className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
                >
                  <span className="text-foreground">{t(`landingPages.${pageKey}.heroTitle`)}</span>
                </h1>

                <p
                  data-landing-hero-chunk
                  className={cn(
                    "mt-6 max-w-xl text-pretty text-base leading-relaxed sm:text-lg",
                    LANDING_BODY
                  )}
                >
                  {t(`landingPages.${pageKey}.heroDescription`)}
                </p>

                <div
                  data-landing-hero-chunk
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full px-8 text-base font-semibold shadow-lg shadow-black/10 bg-orange-brand text-white hover:bg-orange-brand-hover"
                  >
                    <Link to={primaryHref}>
                      {t(`landingPages.${pageKey}.primaryCta`)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-full border-border/80 bg-background/90 px-7 text-base font-medium text-foreground backdrop-blur-sm hover:text-foreground"
                  >
                    <Link to={secondaryHref}>{t(`landingPages.${pageKey}.secondaryCta`)}</Link>
                  </Button>
                </div>

                <div
                  data-landing-hero-chunk
                  className="mt-10 flex flex-wrap gap-2.5 border-t border-border/50 pt-8"
                >
                  {trustItems.map(({ icon: TrustIcon, id: trustId, label }) => (
                    <div
                      key={trustId}
                      className={cn(
                        "inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3.5 py-2 text-xs shadow-sm backdrop-blur sm:text-sm",
                        LANDING_BODY
                      )}
                    >
                      <TrustIcon
                        className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 text-orange-brand"
                      />
                      <span className="leading-snug text-foreground dark:text-foreground/90">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative order-1 min-w-0 lg:order-2 lg:pl-2" data-landing-hero-right>
                <div
                  data-landing-hero-chunk
                  className="absolute -right-6 -top-6 hidden h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent blur-2xl md:block"
                />
                <div
                  data-landing-hero-chunk
                  className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/95 shadow-[0_32px_64px_-32px_rgba(0,0,0,0.35)] ring-1 ring-border/30 backdrop-blur-md dark:shadow-[0_32px_64px_-28px_rgba(0,0,0,0.65)]"
                >
                  <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-3 py-2.5 sm:px-4">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/90" />
                    </div>
                    <div
                      className={cn(
                        "ml-2 flex min-w-0 flex-1 items-center rounded-lg bg-background/90 px-3 py-1.5 font-mono text-[10px] leading-snug shadow-inner sm:text-[11px]",
                        LANDING_SUBTLE
                      )}
                    >
                      <span className="break-words text-left">{t("landingPages.common.mockBrowserLabel")}</span>
                    </div>
                    <div
                      className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:flex bg-orange-brand/10 text-orange-brand shadow-md"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <HeroPreviewMock pageKey={pageKey} alt={t("landingPages.common.heroPreviewAlt")} />

                  {featuredSteps.length > 0 ? (
                    <div className="space-y-2.5 border-t border-border/50 bg-muted/20 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "min-w-0 text-[10px] font-semibold uppercase tracking-[0.2em]",
                            LANDING_LABEL
                          )}
                        >
                          {t(`landingPages.${pageKey}.stepsTitle`)}
                        </p>
                        <span
                          className="shrink-0 text-right text-[10px] font-semibold text-orange-brand"
                        >
                          {stepCountDisplay}
                        </span>
                      </div>
                      {featuredSteps.map((step, index) => (
                        <div
                          key={`${pageKey}-feat-${index}-${step.title.slice(0, 32)}`}
                          data-landing-hero-chunk
                          className="flex gap-3 rounded-2xl border border-border/60 bg-background/80 p-3.5 transition-colors hover:border-primary/25 sm:p-4"
                        >
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm bg-orange-brand"
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug text-foreground">{step.title}</p>
                            <p className={cn("mt-1 text-xs leading-relaxed sm:text-sm", LANDING_BODY)}>
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* Bento / highlights */}
          {highlights.length > 0 ? (
          <section>
            <div className="mb-8 max-w-2xl space-y-3 md:mb-10" data-landing-reveal>
              <p className="text-sm font-semibold text-orange-brand">
                {t("landingPages.common.bentoTitle")}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {t("landingPages.common.bentoSubtitle")}
              </h2>
            </div>
            {useBentoThree ? (
              <div className="grid auto-rows-fr gap-4 md:grid-cols-12 md:grid-rows-2 md:gap-5">
                {bentoLayout.map(({ span, i }) => {
                  const highlight = highlights[i];
                  if (!highlight) {
                    return null;
                  }
                  const large = span.includes("row-span-2");
                  return (
                    <Card
                      key={`bento-${i}-${highlight.slice(0, 24)}`}
                      data-landing-reveal
                      className={cn(
                        "group relative flex h-full min-h-0 flex-col overflow-hidden border-border/50 bg-card/90 shadow-md ring-1 ring-border/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-primary/20",
                        span
                      )}
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-orange-brand opacity-90" />
                      <div
                        className={cn(
                          "pointer-events-none absolute -right-6 -top-4 select-none font-black leading-none text-muted-foreground/15 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 sm:-right-4 sm:-top-2",
                          large ? "text-[6.5rem] sm:text-[8.5rem] md:text-[10rem]" : "text-[5.5rem] sm:text-[7rem]"
                        )}
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <CardHeader
                        className={cn(
                          "relative z-[1] flex min-h-0 flex-1 flex-col items-start justify-start gap-4 overflow-visible pb-6 pt-8",
                          large && "gap-5 md:pb-10 md:pt-10"
                        )}
                      >
                        <div
                          className={cn(
                            "inline-flex shrink-0 items-center justify-center rounded-2xl bg-orange-brand/10 text-orange-brand shadow-lg",
                            large ? "h-14 w-14 md:h-16 md:w-16" : "h-11 w-11"
                          )}
                        >
                          <Icon className={cn("opacity-95", large ? "h-7 w-7 md:h-8 md:w-8" : "h-5 w-5")} />
                        </div>
                        <div className="min-w-0 space-y-3">
                          <CardTitle
                            className={cn(
                              "break-words text-pretty font-bold leading-snug text-foreground",
                              large ? "text-xl sm:text-2xl md:text-[1.65rem]" : "text-lg sm:text-xl"
                            )}
                          >
                            {highlight}
                          </CardTitle>
                          {large ? (
                            <CardDescription
                              className={cn(
                                "max-w-lg text-pretty text-base leading-relaxed",
                                LANDING_BODY
                              )}
                            >
                              {t("landingPages.common.pathSubtitle")}
                            </CardDescription>
                          ) : null}
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {highlights.map((highlight, i) => (
                  <Card
                    key={`hl-${i}-${highlight.slice(0, 24)}`}
                    data-landing-reveal
                    className="group relative flex h-full min-h-0 flex-col overflow-hidden border-border/50 bg-card/90 shadow-md ring-1 ring-border/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-primary/20"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-orange-brand opacity-90" />
                    <div className="pointer-events-none absolute -right-6 -top-8 text-6xl font-black leading-none text-muted-foreground/[0.06] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <CardHeader className="relative z-[1] flex min-h-0 flex-1 flex-col items-start justify-start gap-4 overflow-visible pb-6 pt-8">
                      <div
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-brand/10 text-orange-brand shadow-lg"
                      >
                        <Icon className="h-5 w-5 opacity-95" />
                      </div>
                      <CardTitle className="break-words text-pretty text-lg font-bold leading-snug text-foreground sm:text-xl">
                        {highlight}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </section>
          ) : null}

          {/* Timeline steps */}
          {steps.length > 0 ? (
          <section className="relative rounded-[2rem] border border-border/50 bg-gradient-to-b from-muted/40 via-muted/20 to-background p-6 shadow-inner sm:p-8 md:p-10 lg:p-12">
            <div className="mb-10 max-w-2xl space-y-3 md:mb-14" data-landing-reveal>
              <div className="h-1 w-14 rounded-full bg-orange-brand" />
              <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", LANDING_LABEL)}>
                {t("landingPages.common.pathKicker")}
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t(`landingPages.${pageKey}.stepsTitle`)}</h2>
              <p className={cn("text-base sm:text-lg", LANDING_BODY)}>
                {t("landingPages.common.pathSubtitle")}
              </p>
            </div>

            <div className="relative">
              <div
                className={cn(
                  "absolute left-[1.125rem] top-3 bottom-3 hidden w-px bg-gradient-to-b from-transparent via-border to-transparent md:block",
                  "md:left-8"
                )}
              />
              <ul className="space-y-0">
                {steps.map((step, index) => (
                  <li
                    key={`${pageKey}-step-${index}-${step.title.slice(0, 32)}`}
                    data-landing-reveal
                    className="relative flex flex-col gap-4 pb-12 md:flex-row md:gap-8 md:pb-14"
                  >
                    <div className="flex items-start gap-4 md:w-48 md:shrink-0 md:flex-col md:items-center md:gap-0 md:pt-1">
                      <div
                        className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-lg md:h-16 md:w-16 md:rounded-2xl md:text-lg bg-orange-brand"
                      >
                        {index + 1}
                      </div>
                      <span
                        className={cn(
                          "font-mono text-[11px] font-medium uppercase tracking-widest md:mt-3 md:text-center",
                          LANDING_LABEL
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm ring-1 ring-border/30 transition-shadow hover:shadow-md md:p-7">
                      <h3 className="text-xl font-bold leading-snug text-foreground">{step.title}</h3>
                      <p className={cn("mt-3 text-pretty text-sm leading-relaxed sm:text-base", LANDING_BODY)}>
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          ) : null}

          {/* FAQ + Related */}
          <section
            className={cn(
              "grid gap-6 lg:gap-8",
              faqs.length > 0 ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" : "lg:grid-cols-1"
            )}
          >
            {faqs.length > 0 ? (
            <Card
              data-landing-reveal
              className="min-w-0 overflow-hidden border-border/50 bg-card/95 shadow-lg ring-1 ring-border/40"
            >
              <div className="h-1.5 w-full bg-orange-brand" />
              <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-xl font-bold sm:text-2xl">{t(`landingPages.${pageKey}.faqTitle`)}</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={`${pageKey}-faq-${index}`} value={`${pageKey}-faq-${index}`} className="border-border/50">
                      <AccordionTrigger className="py-4 text-left text-[15px] font-semibold hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className={cn("pb-4 text-sm leading-relaxed", LANDING_BODY)}>
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            ) : null}

            <div className={cn("flex flex-col gap-5", faqs.length === 0 && "lg:max-w-3xl")}>
              <Card
                data-landing-reveal
                className="flex flex-1 flex-col overflow-hidden border-border/50 bg-card/95 shadow-lg ring-1 ring-border/40"
              >
                <div className="h-1.5 w-full bg-orange-brand" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold sm:text-xl">{t(`landingPages.${pageKey}.relatedTitle`)}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2 pb-5 sm:grid-cols-2">
                  {config.related.map((target) => {
                    const meta = RELATED_META[target];
                    const RelIcon = meta.icon;
                    return (
                      <Link
                        key={target}
                        to={localizePath(PAGE_PATHS[target])}
                        className="group flex items-center gap-3 rounded-xl border border-border/50 bg-gradient-to-br from-background/95 to-muted/20 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md transition-transform group-hover:scale-105 border border-border",
                            meta.accent
                          )}
                        >
                          <RelIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold leading-snug text-foreground">
                            {getRelatedTitle(target, t)}
                          </p>
                          <p className={cn("truncate text-xs leading-relaxed", LANDING_SUBTLE)}>
                            {getRelatedDescription(target, t)}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Final CTA */}
          <section data-landing-reveal className="pb-4">
            <div
              className="relative overflow-hidden rounded-[2rem] px-6 py-12 text-center shadow-2xl sm:px-10 sm:py-14 md:px-14 md:py-16 bg-orange-brand"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.35),transparent)]" />
              <div className="relative mx-auto max-w-2xl space-y-6">
                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {t("landingPages.common.finalCtaTitle")}
                </h2>
                <p className="text-pretty text-base leading-relaxed text-white sm:text-lg">
                  {t("landingPages.common.finalCtaBody")}
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 min-w-[200px] rounded-full border-0 bg-white px-8 text-base font-semibold text-foreground shadow-lg hover:bg-white/95"
                  >
                    <Link to={primaryHref}>
                      {t(`landingPages.${pageKey}.primaryCta`)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 min-w-[200px] rounded-full border-white/40 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  >
                    <Link to={secondaryHref}>{t(`landingPages.${pageKey}.secondaryCta`)}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SeoLandingPage;

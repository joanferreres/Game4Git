import { useEffect, useState } from "react";
import LanguageSelector from "@/components/LanguageSelector";
import SeoHead from "@/components/SeoHead";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
  primaryAction: { type: "exercise"; exercise: ExerciseId } | { type: "path"; path: string };
  secondaryPath: string;
  related: RelatedPageTarget[];
}

const PAGE_CONFIG: Record<LandingPageKey, LandingPageConfig> = {
  gitPracticeGame: {
    path: "/git-practice-game",
    seoKey: "gitPracticeGame",
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gitBranchPractice", "gitMergeConflicts", "gdb"],
  },
  gitBranchPractice: {
    path: "/git-branch-practice",
    seoKey: "gitBranchPractice",
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gitPracticeGame", "gitMergeConflicts", "gdb"],
  },
  gitMergeConflicts: {
    path: "/git-merge-conflicts",
    seoKey: "gitMergeConflicts",
    primaryAction: { type: "exercise", exercise: "merge-conflicts" },
    secondaryPath: "/",
    related: ["gitBranchPractice", "gitPracticeGame", "gdb"],
  },
  valgrindMemoryLeaks: {
    path: "/valgrind-memory-leaks",
    seoKey: "valgrindMemoryLeaks",
    primaryAction: { type: "path", path: "/valgrind" },
    secondaryPath: "/",
    related: ["valgrind", "gdb", "gitPracticeGame"],
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

  const homePath = localizePath("/");
  return `${homePath}?exercise=${config.primaryAction.exercise}`;
};

interface SeoLandingPageProps {
  pageKey: LandingPageKey;
}

const HeaderControls = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-[92px] self-center rounded-md border border-input bg-background" aria-hidden="true" />;
  }

  return (
    <div className="flex h-10 w-[92px] items-center justify-end gap-2 self-center sm:self-auto">
      <ThemeToggle />
      <LanguageSelector />
    </div>
  );
};

const SeoLandingPage = ({ pageKey }: SeoLandingPageProps) => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const config = PAGE_CONFIG[pageKey];
  const highlights = t(`landingPages.${pageKey}.highlights`, { returnObjects: true }) as string[];
  const steps = t(`landingPages.${pageKey}.steps`, { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const featuredSteps = steps.slice(0, 3);
  const faqs = t(`landingPages.${pageKey}.faq`, { returnObjects: true }) as Array<{
    q: string;
    a: string;
  }>;
  const primaryHref = getPrimaryHref(config, localizePath);
  const secondaryHref = localizePath(config.secondaryPath);

  return (
    <div className="container relative min-h-screen max-w-full px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <SeoHead page={config.seoKey} />

      <header className="mb-8 sm:mb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={localizePath("/")}
            className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline sm:justify-start"
          >
            <span aria-hidden="true">←</span>
            <span>{t("common.backToHome", "Back to Home")}</span>
          </Link>
          <HeaderControls />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/95 shadow-sm">
          <div className="relative grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex max-w-full items-center gap-2 self-start rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-foreground shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.18em] sm:text-sm">
                  {t(`landingPages.${pageKey}.eyebrow`)}
                </span>
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {t(`landingPages.${pageKey}.heroTitle`)}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t(`landingPages.${pageKey}.heroDescription`)}
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to={primaryHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-foreground px-6 py-3 text-sm font-medium text-background shadow-sm sm:w-auto"
                >
                  {t(`landingPages.${pageKey}.primaryCta`)}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to={secondaryHref}
                  className="inline-flex w-full items-center justify-center rounded-full border border-border/80 bg-background/80 px-6 py-3 text-sm sm:w-auto"
                >
                  {t(`landingPages.${pageKey}.secondaryCta`)}
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {highlights.map((highlight, index) => (
                  <div
                    key={highlight}
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-left text-xs text-muted-foreground shadow-sm sm:text-sm"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-[11px] font-semibold text-foreground">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {t(`landingPages.${pageKey}.stepsTitle`)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(`landingPages.${pageKey}.primaryCta`)}</p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm">
                    •
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {featuredSteps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl border border-border/70 bg-card/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {String(index + 1).padStart(2, "0")}
                          </p>
                          <h2 className="mt-2 text-base font-semibold leading-snug sm:text-lg">{step.title}</h2>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                        </div>
                        <span className="mt-1 text-sm text-muted-foreground" aria-hidden="true">↗</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((highlight, index) => (
            <article key={highlight} className="relative overflow-hidden rounded-xl border border-border/60 bg-card/90 p-6 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-border" />
              <div className="absolute -right-4 -top-6 text-6xl font-semibold tracking-tight text-muted-foreground/10">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="relative">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background text-foreground shadow-sm">
                  ✓
                </div>
                <h2 className="pt-2 text-lg font-semibold leading-snug">{highlight}</h2>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-border/60 bg-muted/25 p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-2 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t(`landingPages.${pageKey}.eyebrow`)}
            </p>
            <h2 className="text-2xl font-bold tracking-tight">{t(`landingPages.${pageKey}.stepsTitle`)}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="relative h-full overflow-hidden rounded-xl border border-border/60 bg-background/90 shadow-sm"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-border" />
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card text-xs font-semibold text-foreground">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <article className="overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-sm">
            <div className="h-1 w-full bg-border" />
            <div className="p-6">
              <h2 className="text-xl font-semibold">{t(`landingPages.${pageKey}.faqTitle`)}</h2>
              <dl className="mt-4 space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.q}>
                    <dt className="font-medium">{faq.q}</dt>
                    <dd className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-sm">
            <div className="h-1 w-full bg-border" />
            <div className="p-6">
              <h2 className="text-xl font-semibold">{t(`landingPages.${pageKey}.relatedTitle`)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t(`landingPages.${pageKey}.relatedDescription`)}</p>
              <div className="mt-4 space-y-3">
                {config.related.map((target) => (
                  <Link
                    key={target}
                    to={localizePath(PAGE_PATHS[target])}
                    className="group block rounded-2xl border border-border/60 bg-background/80 p-4 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{getRelatedTitle(target, t)}</p>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {getRelatedDescription(target, t)}
                        </p>
                      </div>
                      <span className="mt-1 text-sm text-muted-foreground" aria-hidden="true">↗</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

export default SeoLandingPage;

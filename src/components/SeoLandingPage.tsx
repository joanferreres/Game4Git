import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LanguageSelector from "@/components/LanguageSelector";
import SeoHead from "@/components/SeoHead";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, GitBranch, ShieldAlert, Sparkles, Swords } from "lucide-react";
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
  accent: string;
  softAccent: string;
  surfaceAccent: string;
  icon: typeof Sparkles;
  primaryAction: { type: "exercise"; exercise: ExerciseId } | { type: "path"; path: string };
  secondaryPath: string;
  related: RelatedPageTarget[];
}

const PAGE_CONFIG: Record<LandingPageKey, LandingPageConfig> = {
  gitPracticeGame: {
    path: "/git-practice-game",
    seoKey: "gitPracticeGame",
    accent: "from-amber-500 via-orange-500 to-rose-500",
    softAccent: "from-amber-500/25 via-orange-500/10 to-rose-500/25",
    surfaceAccent: "from-amber-500/12 via-transparent to-rose-500/12",
    icon: Sparkles,
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gitBranchPractice", "gitMergeConflicts", "gdb"],
  },
  gitBranchPractice: {
    path: "/git-branch-practice",
    seoKey: "gitBranchPractice",
    accent: "from-sky-500 via-cyan-500 to-blue-600",
    softAccent: "from-sky-500/25 via-cyan-500/10 to-blue-600/25",
    surfaceAccent: "from-sky-500/12 via-transparent to-blue-600/12",
    icon: GitBranch,
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gitPracticeGame", "gitMergeConflicts", "gdb"],
  },
  gitMergeConflicts: {
    path: "/git-merge-conflicts",
    seoKey: "gitMergeConflicts",
    accent: "from-rose-500 via-orange-500 to-amber-500",
    softAccent: "from-rose-500/25 via-orange-500/10 to-amber-500/25",
    surfaceAccent: "from-rose-500/12 via-transparent to-amber-500/12",
    icon: Swords,
    primaryAction: { type: "exercise", exercise: "merge-conflicts" },
    secondaryPath: "/",
    related: ["gitBranchPractice", "gitPracticeGame", "gdb"],
  },
  valgrindMemoryLeaks: {
    path: "/valgrind-memory-leaks",
    seoKey: "valgrindMemoryLeaks",
    accent: "from-emerald-500 via-teal-500 to-green-600",
    softAccent: "from-emerald-500/25 via-teal-500/10 to-green-600/25",
    surfaceAccent: "from-emerald-500/12 via-transparent to-green-600/12",
    icon: ShieldAlert,
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

const SeoLandingPage = ({ pageKey }: SeoLandingPageProps) => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const config = PAGE_CONFIG[pageKey];
  const Icon = config.icon;
  const highlights = t(`landingPages.${pageKey}.highlights`, { returnObjects: true }) as string[];
  const steps = t(`landingPages.${pageKey}.steps`, { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const faqs = t(`landingPages.${pageKey}.faq`, { returnObjects: true }) as Array<{
    q: string;
    a: string;
  }>;
  const primaryHref = getPrimaryHref(config, localizePath);
  const secondaryHref = localizePath(config.secondaryPath);
  const featuredSteps = steps.slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <SeoHead page={config.seoKey} />
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-gradient-to-b ${config.softAccent} blur-3xl`} />
      <div className={`pointer-events-none absolute -right-16 top-32 h-56 w-56 rounded-full bg-gradient-to-br ${config.accent} opacity-20 blur-3xl`} />
      <div className={`pointer-events-none absolute -left-16 top-80 h-48 w-48 rounded-full bg-gradient-to-br ${config.accent} opacity-10 blur-3xl`} />

      <div className="container relative min-h-screen max-w-full px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <header className="mb-8 sm:mb-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={localizePath("/")}
              className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline sm:justify-start"
            >
              <BookOpen className="h-4 w-4" />
              {t("common.backToHome", "Back to Home")}
            </Link>
            <div className="flex items-center justify-center gap-2 sm:justify-end">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-8">
          <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/95 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.surfaceAccent}`} />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
            <div className="relative grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10">
              <div className="flex flex-col justify-center">
                <div
                  className={`inline-flex max-w-full items-center gap-2 self-start rounded-full bg-gradient-to-r ${config.accent} px-4 py-1.5 text-white shadow-lg`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/95 sm:text-sm">
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
                  <Button
                    asChild
                    size="lg"
                    className={`w-full rounded-full bg-gradient-to-r ${config.accent} text-white shadow-lg shadow-black/10 sm:w-auto`}
                  >
                    <Link to={primaryHref}>
                      {t(`landingPages.${pageKey}.primaryCta`)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full rounded-full border-border/80 bg-background/80 sm:w-auto">
                    <Link to={secondaryHref}>{t(`landingPages.${pageKey}.secondaryCta`)}</Link>
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-left text-xs text-muted-foreground shadow-sm backdrop-blur sm:text-sm"
                    >
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.accent} text-[11px] font-semibold text-white`}
                      >
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${config.softAccent} blur-2xl`} />
                <div className="relative rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-2xl backdrop-blur sm:p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {t(`landingPages.${pageKey}.stepsTitle`)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{t(`landingPages.${pageKey}.primaryCta`)}</p>
                    </div>
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent} text-white shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {featuredSteps.map((step, index) => (
                      <div
                        key={step.title}
                        className={`rounded-2xl border border-border/70 bg-gradient-to-br ${config.surfaceAccent} p-4 transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {String(index + 1).padStart(2, "0")}
                            </p>
                            <h2 className="mt-2 text-base font-semibold leading-snug sm:text-lg">{step.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                          </div>
                          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
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
              <Card key={highlight} className="group relative h-full overflow-hidden border-border/60 bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.accent}`} />
                <div className="absolute -right-4 -top-6 text-6xl font-semibold tracking-tight text-muted-foreground/10 transition-transform duration-200 group-hover:scale-110">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <CardHeader className="relative h-full">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent} text-white shadow-md`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="pt-2 text-lg leading-snug">{highlight}</CardTitle>
                </CardHeader>
              </Card>
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
                <Card
                  key={step.title}
                  className="relative h-full overflow-hidden border-border/60 bg-background/90 shadow-sm backdrop-blur"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.accent}`} />
                  <CardHeader className="h-full">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${config.accent} text-xs font-semibold text-white`}>
                        {index + 1}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-snug">{step.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
              <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />
              <CardHeader>
                <CardTitle>{t(`landingPages.${pageKey}.faqTitle`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.q} value={`${pageKey}-faq-${index}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
              <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />
              <CardHeader>
                <CardTitle>{t(`landingPages.${pageKey}.relatedTitle`)}</CardTitle>
                <CardDescription>{t(`landingPages.${pageKey}.relatedDescription`)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.related.map((target) => (
                  <Link
                    key={target}
                    to={localizePath(PAGE_PATHS[target])}
                    className="group block rounded-2xl border border-border/60 bg-background/80 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{getRelatedTitle(target, t)}</p>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {getRelatedDescription(target, t)}
                        </p>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SeoLandingPage;

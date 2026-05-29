import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  GitBranch,
  GitMerge,
  Terminal,
  Shield,
  Cpu,
  ArrowRight,
} from "lucide-react";
import AppNav from "@/components/AppNav";
import SiteFooter from "@/components/SiteFooter";
import SeoHead from "@/components/SeoHead";
import GitBranchScrollAnimation from "@/components/GitBranchScrollAnimation";
import { Button } from "@/components/ui/button";
import { useLocalizedPath } from "@/lib/localizedRoutes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GUIDE_BADGE =
  "font-mono text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded";

const guideColorMap = {
  orange: {
    icon: "bg-[#fff4f1] dark:bg-orange-950/50",
    tag: "bg-[#fff4f1] text-[#c2410c] dark:bg-orange-950/50 dark:text-orange-400",
    arrow: "text-orange-brand",
    badge: GUIDE_BADGE,
  },
  sky: {
    icon: "bg-sky-50 dark:bg-sky-950/50",
    tag: "bg-sky-50 text-blue-700 dark:bg-sky-950/50 dark:text-sky-400",
    arrow: "text-blue-600 dark:text-sky-400",
    badge: GUIDE_BADGE,
  },
  amber: {
    icon: "bg-amber-50 dark:bg-amber-950/50",
    tag: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    arrow: "text-amber-600 dark:text-amber-400",
    badge: GUIDE_BADGE,
  },
  green: {
    icon: "bg-green-50 dark:bg-green-950/50",
    tag: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    arrow: "text-green-600 dark:text-green-400",
    badge: GUIDE_BADGE,
  },
  slate: {
    icon: "bg-slate-100 dark:bg-slate-800/50",
    tag: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
    arrow: "text-slate-600 dark:text-slate-400",
    badge: GUIDE_BADGE,
  },
  teal: {
    icon: "bg-teal-50 dark:bg-teal-950/50",
    tag: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
    arrow: "text-teal-600 dark:text-teal-400",
    badge: GUIDE_BADGE,
  },
} as const;

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const rootRef = useRef<HTMLDivElement>(null);

  const guides = [
    {
      href: localizePath("/git-practice-game"),
      title: t("landingPages.gitPracticeGame.heroTitle"),
      description: t("landingPages.gitPracticeGame.heroDescription"),
      icon: Sparkles,
      color: "orange" as const,
      command: "git practice",
      difficulty: t("home.levelBasic", "Básico"),
    },
    {
      href: localizePath("/git-branch-practice"),
      title: t("landingPages.gitBranchPractice.heroTitle"),
      description: t("landingPages.gitBranchPractice.heroDescription"),
      icon: GitBranch,
      color: "sky" as const,
      command: "git branch",
      difficulty: t("home.levelIntermediate", "Intermedio"),
    },
    {
      href: localizePath("/git-merge-conflicts"),
      title: t("landingPages.gitMergeConflicts.heroTitle"),
      description: t("landingPages.gitMergeConflicts.heroDescription"),
      icon: GitMerge,
      color: "amber" as const,
      command: "git merge",
      difficulty: t("home.levelIntermediate", "Intermedio"),
    },
    {
      href: localizePath("/gdb"),
      title: t("gdb.pageTitle"),
      description: t("gdb.subtitle"),
      icon: Terminal,
      color: "slate" as const,
      command: "gdb",
      difficulty: t("home.levelAdvanced", "Avanzado"),
    },
    {
      href: localizePath("/valgrind"),
      title: t("valgrind.pageTitle"),
      description: t("valgrind.intro.subtitle"),
      icon: Cpu,
      color: "teal" as const,
      command: "valgrind",
      difficulty: t("home.levelAdvanced", "Avanzado"),
    },
    {
      href: localizePath("/valgrind-memory-leaks"),
      title: t("landingPages.valgrindMemoryLeaks.heroTitle"),
      description: t("landingPages.valgrindMemoryLeaks.heroDescription"),
      icon: Shield,
      color: "green" as const,
      command: "valgrind --leak",
      difficulty: t("home.levelAdvanced", "Avanzado"),
    },
  ];

  const faqs = [
    { q: t("home.faq.q2"), a: t("home.faq.a2") },
    { q: t("home.faq.q1"), a: t("home.faq.a1") },
    { q: t("home.faq.q3"), a: t("home.faq.a3") },
    { q: t("home.faq.q4"), a: t("home.faq.a4") },
  ];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 640px)",
        },
        (ctx) => {
          const { animate, desktop } = ctx.conditions as {
            animate: boolean;
            desktop: boolean;
          };
          if (!animate || !desktop) {
            gsap.set(
              "[data-home-header], .home-guide-card, .home-faq-item",
              { clearProps: "all" }
            );
            return;
          }

          gsap.set("[data-home-header]", { autoAlpha: 0, y: 16 });
          gsap.set(".home-guide-card, .home-faq-item", {
            autoAlpha: 0,
            y: 20,
          });

          const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
          tl.to("[data-home-header]", { autoAlpha: 1, y: 0, duration: 0.35 }, 0);

          ScrollTrigger.batch(".home-guide-card", {
            start: "top 90%",
            once: true,
            interval: 0.06,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.05,
                ease: "power2.out",
              });
            },
          });

          ScrollTrigger.batch(".home-faq-item", {
            start: "top 92%",
            once: true,
            interval: 0.06,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.04,
                ease: "power2.out",
              });
            },
          });
        },
        root
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="min-h-screen bg-background">
      <SeoHead page="home" />
      <AppNav variant="landing" />

      {/* Hero */}
      <main id="main-content">
      <section
        data-home-header
        className="bg-[#faf9f7] dark:bg-muted/20 border-b border-border/60"
      >
        <div className="container max-w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-orange-brand mb-4"
                aria-hidden
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-brand" />
                {t("home.eyebrow", "Aprende Git de verdad")}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                {t("general.title")}
              </h1>
              <section
                className="max-w-lg mb-6"
                aria-label={t("home.seoIntroLabel", "App description")}
              >
                <p className="text-sm text-muted-foreground leading-relaxed sm:hidden">
                  {t(
                    "home.seoIntroMobile",
                    "Learn Git by doing with visual commits and guided challenges."
                  )}{" "}
                  <Link
                    to={localizePath("/git-merge-conflicts")}
                    className="underline hover:text-primary"
                  >
                    {t("landingPages.gitMergeConflicts.eyebrow", "Merge conflicts")}
                  </Link>
                  .
                </p>
                <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "home.seoIntroShort",
                    "Learn Git by doing. Visualize branches and merges while running real commands. Try guided challenges or switch to the terminal anytime."
                  )}{" "}
                  <Link
                    to={localizePath("/git-practice-game")}
                    className="underline hover:text-primary"
                  >
                    {t("landingPages.gitPracticeGame.eyebrow", "Practice Git online")}
                  </Link>{" "}
                  {t("home.seoIntroAnd", "and")}{" "}
                  <Link
                    to={localizePath("/git-branch-practice")}
                    className="underline hover:text-primary"
                  >
                    {t("landingPages.gitBranchPractice.eyebrow", "Git branch practice")}
                  </Link>
                  {", "}
                  <Link
                    to={localizePath("/git-merge-conflicts")}
                    className="underline hover:text-primary"
                  >
                    {t("landingPages.gitMergeConflicts.eyebrow", "Merge conflicts")}
                  </Link>
                  {", "}
                  <Link
                    to={localizePath("/valgrind-memory-leaks")}
                    className="underline hover:text-primary"
                  >
                    {t("landingPages.valgrindMemoryLeaks.eyebrow", "Memory leaks")}
                  </Link>
                  .{" "}
                  <Link
                    to={localizePath("/gdb")}
                    className="underline hover:text-primary"
                  >
                    GDB
                  </Link>{" "}
                  {t("home.seoIntroAnd", "and")}{" "}
                  <Link
                    to={localizePath("/valgrind")}
                    className="underline hover:text-primary"
                  >
                    Valgrind
                  </Link>{" "}
                  {t("home.seoIntroTailShort", "basics included.")}
                </p>
              </section>
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                <Link
                  to={localizePath("/playground")}
                  className="inline-flex items-center gap-1.5 bg-orange-brand hover:bg-orange-brand-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  {t("nav.playground", "Playground")}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                <a
                  href="#guides"
                  className="inline-flex items-center gap-1.5 border border-border text-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  {t("nav.guides", "Guías")}
                </a>
              </div>
              {/* Stats row */}
              <div className="hidden sm:flex gap-6 mt-6 pt-5 border-t border-border/60">
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">6</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("home.statGuides", "Guías interactivas")}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">
                    4
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("home.statLanguages", "Idiomas")}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">0</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("home.statInstalls", "Instalaciones necesarias")}
                  </p>
                </div>
              </div>
            </div>
            {/* Right: animated git graph */}
            <div className="hidden md:block" aria-hidden>
              <GitBranchScrollAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Guide cards */}
      <section
        id="guides"
        className="container max-w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-brand mb-2">
              {t("home.statGuides", "Guías interactivas")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">
              {t("home.guidesTitle", "Elige tu guía")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "home.guidesDescription",
                "Start from the exact topic you want to practice and jump straight into the right challenge or debugging guide."
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {guides.map((guide) => {
              const Icon = guide.icon;
              const colors = guideColorMap[guide.color];
              return (
                <Link
                  key={guide.href}
                  to={guide.href}
                  className="home-guide-card group bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-brand focus-visible:ring-offset-2 transition-all duration-150 hover:-translate-y-0.5"
                  aria-label={guide.title}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.icon}`}
                    >
                      <Icon
                        className="w-4 h-4 text-foreground/70"
                        aria-hidden
                      />
                    </div>
                    <span className={colors.badge}>{guide.command}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground leading-snug mb-1">
                      {guide.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${colors.tag}`}
                    >
                      {guide.difficulty}
                    </span>
                    <span
                      className={`text-sm ${colors.arrow} group-hover:translate-x-0.5 transition-transform`}
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Playground strip */}
      <section className="container max-w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0f172a] rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-mono text-[11px] text-slate-500 mb-3">
                $ git playground --open
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                {t("home.playgroundStripTitle", "Practica con el playground")}
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {t("home.playgroundStripDesc", "Editor de código, árbol de commits y controles de Git en una sola pantalla. Sin configurar nada.")}
              </p>
              <Link
                to={localizePath("/playground")}
                className="inline-flex items-center gap-2 bg-orange-brand hover:bg-orange-brand-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                {t("home.playgroundStripCta", "Abrir playground")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
            <div className="hidden md:block" aria-hidden>
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-4 font-mono text-[11px] leading-[1.8] text-slate-400">
                <div className="flex gap-1.5 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#334155]" />
                  <span className="w-2 h-2 rounded-full bg-[#334155]" />
                  <span className="w-2 h-2 rounded-full bg-[#334155]" />
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git branch feature/nav</span>
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git checkout feature/nav</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span>{" "}
                  <span className="text-slate-500">Switched to branch 'feature/nav'</span>
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git merge main</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span>{" "}
                  <span className="text-slate-500">Already up to date.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container max-w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground text-center mb-8">
            {t("home.faqTitle", "Preguntas frecuentes")}
          </h2>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {faqs.map((faq, i) => (
              <div key={i} className="home-faq-item p-5 bg-card">
                <p className="text-sm font-semibold text-foreground mb-1.5">
                  {faq.q}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      </main>
    </div>
  );
};

export default Landing;

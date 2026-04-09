import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInView } from "@/hooks/useInView";

// Lazy editor: smaller initial JS parse on mobile; chunk loads in parallel once the shell mounts
const CodeEditor = lazy(() => import("@/components/CodeEditor"));
const DiffViewer = lazy(() => import("@/components/DiffViewer"));
const GitControls = lazy(() => import("@/components/GitControls"));
const GitHistory = lazy(() => import("@/components/GitHistory"));
import WelcomeBanner from "@/components/WelcomeBanner";
import useGitStore, { useAdminStore } from "@/store/gitStore";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, Sparkles, Play, Plus, ArrowDownUp, Upload, DownloadCloud, GitBranch as GitBranchIcon, GitMerge as GitMergeIcon, GitCommit as GitCommitIcon, Terminal as TerminalIcon, BookOpen, HelpCircle, CheckCircle2, ArrowUpRight } from "lucide-react";

import { useTranslation } from "react-i18next";
import "../i18n"; // Importamos la configuración de i18n
const GitExercises = lazy(() => import("@/components/GitExercises"));
import { ThemeToggle } from "@/components/ThemeToggle";
const ConflictResolver = lazy(() => import("@/components/ConflictResolver"));
import { Link } from "react-router-dom";
import { Bug, Shield } from "lucide-react";

import LanguageSelector from "@/components/LanguageSelector";
import { DeferUntilAfterPaint } from "@/components/DeferUntilAfterPaint";
import SeoHead from "@/components/SeoHead";
import { useLocalizedPath } from "@/lib/localizedRoutes";

/** Matches CodeEditor layout to avoid CLS while the lazy chunk loads */
const LazyPanelFallback = () => (
  <div className="min-h-[72px] animate-pulse rounded-lg bg-muted/30" aria-hidden />
);

const CodeEditorSkeleton: React.FC<{ label: string }> = ({ label }) => (
  <Card className="w-full h-full overflow-hidden flex flex-col">
    <CardHeader className="py-3 px-4 shrink-0">
      <CardTitle className="text-sm flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-git-editor shrink-0" aria-hidden />
        hello.c
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0 flex-1 min-h-0">
      <div
        className="h-full min-h-[200px] bg-[#2d2d2d] flex items-center justify-center"
        aria-busy="true"
        aria-label={label}
      >
        <p className="text-xs text-[#f8f8f2]/50">{label}</p>
      </div>
    </CardContent>
  </Card>
);

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GitGame: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [deferWelcomeBanner, setDeferWelcomeBanner] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showQuickGuide, setShowQuickGuide] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return !sessionStorage.getItem('quickGuideDismissed');
  });
  const [showSecondaryBanner, setShowSecondaryBanner] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    const mainDismissed = sessionStorage.getItem('welcomeBannerDismissed');
    const withCta = sessionStorage.getItem('welcomeBannerDismissedWithCta');
    const secondaryDismissed = sessionStorage.getItem('secondaryBannerDismissed');
    return !!mainDismissed && !withCta && !secondaryDismissed;
  });
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDeferWelcomeBanner(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const { repository, workingChanges, selectedCommitId, stagedChanges, hasPendingConflict } = useGitStore();
  const { isGdbEnabled, isValgrindEnabled, setGdbEnabled, setValgrindEnabled } = useAdminStore();

  // Always enabled; no remote fetch needed
  useEffect(() => {
    setGdbEnabled(true);
    setValgrindEnabled(true);
  }, [setGdbEnabled, setValgrindEnabled]);
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const gdbPath = localizePath("/gdb");
  const valgrindPath = localizePath("/valgrind");
  const gitPracticeGamePath = localizePath("/git-practice-game");
  const gitBranchPracticePath = localizePath("/git-branch-practice");
  const gitMergeConflictsPath = localizePath("/git-merge-conflicts");
  const valgrindMemoryLeaksPath = localizePath("/valgrind-memory-leaks");

  // Get the selected commit if any
  const selectedCommit = selectedCommitId
    ? repository.commits.find(c => c.id === selectedCommitId)
    : null;

  // Get the current HEAD commit
  const headCommit = repository.commits.find(c => c.id === repository.HEAD);

  // toggleDiff unused; removed

  // Listen for changes to stagedChanges
  useEffect(() => {
    if (stagedChanges) {
      setShowDiff(true); // Show diff when changes are staged
    }
  }, [stagedChanges]);

  // Check if there's a pending merge conflict
  const conflictExists = hasPendingConflict();
  const featuredGuides = [
    {
      href: gitPracticeGamePath,
      title: t("landingPages.gitPracticeGame.heroTitle"),
      description: t("landingPages.gitPracticeGame.heroDescription"),
      icon: Sparkles,
      color: "orange" as const,
      command: "git practice",
      difficulty: t("home.levelBasic", "Básico"),
    },
    {
      href: gitBranchPracticePath,
      title: t("landingPages.gitBranchPractice.heroTitle"),
      description: t("landingPages.gitBranchPractice.heroDescription"),
      icon: GitBranchIcon,
      color: "sky" as const,
      command: "git branch",
      difficulty: t("home.levelIntermediate", "Intermedio"),
    },
    {
      href: gitMergeConflictsPath,
      title: t("landingPages.gitMergeConflicts.heroTitle"),
      description: t("landingPages.gitMergeConflicts.heroDescription"),
      icon: GitMergeIcon,
      color: "amber" as const,
      command: "git merge",
      difficulty: t("home.levelIntermediate", "Intermedio"),
    },
    {
      href: valgrindMemoryLeaksPath,
      title: t("landingPages.valgrindMemoryLeaks.heroTitle"),
      description: t("landingPages.valgrindMemoryLeaks.heroDescription"),
      icon: Shield,
      color: "green" as const,
      command: "valgrind",
      difficulty: t("home.levelAdvanced", "Avanzado"),
    },
  ];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 640px)",
        },
        (ctx) => {
          const { animate, desktop } = ctx.conditions as { animate: boolean; desktop: boolean };
          if (!animate || !desktop) {
            gsap.set(
              "[data-home-header], [data-home-strip], [data-home-panel], [data-home-controls], .home-guide-card, .home-faq-item",
              { clearProps: "all" }
            );
            return;
          }

          gsap.set("[data-home-header], [data-home-strip], [data-home-panel], [data-home-controls]", {
            autoAlpha: 0,
            y: 16,
          });
          gsap.set(".home-guide-card, .home-faq-item", { autoAlpha: 0, y: 20 });

          const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
          tl.to("[data-home-header]", { autoAlpha: 1, y: 0, duration: 0.3 }, 0)
            .to("[data-home-strip]", { autoAlpha: 1, y: 0, duration: 0.28 }, "<0.05")
            .to("[data-home-panel]", { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07 }, "<0.1")
            .to("[data-home-controls]", { autoAlpha: 1, y: 0, duration: 0.3 }, "<0.12");

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

      return () => {
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [showQuickGuide, showSecondaryBanner], revertOnUpdate: true }
  );

  const GUIDE_BADGE = "font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded";
  const guideColorMap = {
    orange: { icon: "bg-[#fff4f1]", tag: "bg-[#fff4f1] text-[#c2410c]", arrow: "text-orange-brand", badge: GUIDE_BADGE },
    sky:    { icon: "bg-sky-50",    tag: "bg-sky-50 text-blue-700",      arrow: "text-blue-600",    badge: GUIDE_BADGE },
    amber:  { icon: "bg-amber-50",  tag: "bg-amber-50 text-amber-700",   arrow: "text-amber-600",   badge: GUIDE_BADGE },
    green:  { icon: "bg-green-50",  tag: "bg-green-50 text-green-700",   arrow: "text-green-600",   badge: GUIDE_BADGE },
  } as const;

  return (
    <div ref={rootRef} className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <SeoHead page="home" />
      {deferWelcomeBanner && (
        <WelcomeBanner
          onStart={() => {
            document.getElementById('editor-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          onOpenChallenges={() => {
            window.dispatchEvent(new CustomEvent('open-challenges'));
          }}
          onDismissWithoutCta={() => setShowSecondaryBanner(true)}
        />
      )}

      {/* Sticky CTA - visible on scroll (mobile) */}
      {showStickyCta && (
        <div className="fixed top-0 left-0 right-0 z-40 md:hidden py-2 px-4 bg-background/95 backdrop-blur border-b border-border flex justify-center">
          <Button
            variant="default"
            size="sm"
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg text-xs"
            onClick={() => window.dispatchEvent(new CustomEvent('open-challenges'))}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {t('home.startFirstChallenge', 'Start first challenge')}
          </Button>
        </div>
      )}

      <header data-home-header className="mb-4 sm:mb-6 relative min-h-[80px] sm:min-h-[100px]">
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <DeferUntilAfterPaint fallback={<div className="w-[88px] h-10" aria-hidden />}>
            <ThemeToggle />
            <LanguageSelector />
          </DeferUntilAfterPaint>
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('general.title')}</h1>
          <section className="mx-auto max-w-2xl text-center mt-2 mb-3 sm:mb-4 px-2">
            <p className="text-xs text-muted-foreground leading-relaxed sm:hidden">
              {t(
                'home.seoIntroMobile',
                'Learn Git by doing with visual commits and guided challenges.'
              )}
            </p>
            <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t(
                'home.seoIntroShort',
                'Learn Git by doing. Visualize branches and merges while running real commands. Try guided challenges or switch to the terminal anytime.'
              )}
              {" "}
              <Link to={gdbPath} className="underline hover:text-primary">GDB</Link>
              {" "}
              {t('home.seoIntroAnd', 'and')}
              {" "}
              <Link to={valgrindPath} className="underline hover:text-primary">Valgrind</Link>
              {" "}
              {t('home.seoIntroTailShort', 'basics included.')}
            </p>
          </section>

          {/* Primary CTA: Start first challenge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3 md:mt-4">
            <Button
              variant="default"
              size="sm"
              className="text-xs sm:text-sm rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg ring-2 ring-amber-300/50 hover:shadow-xl hover:scale-105 transition-all"
              onClick={() => window.dispatchEvent(new CustomEvent('open-challenges'))}
              aria-label={t('home.startFirstChallenge', 'Start first challenge')}
            >
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              {t('home.startFirstChallenge', 'Start first challenge')}
            </Button>
            {(isGdbEnabled || isValgrindEnabled) && (
              <div className="hidden sm:flex gap-2">
                {isGdbEnabled && (
                  <Link to={gdbPath}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      aria-label={t('home.openGdb', 'Learn GDB debugger')}
                    >
                      <Bug className="h-3 w-3 mr-1" />
                      {t('home.gdbShort', 'GDB')}
                    </Button>
                  </Link>
                )}
                {isValgrindEnabled && (
                  <Link to={valgrindPath}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full border-emerald-500/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      aria-label={t('home.openValgrind', 'Learn Valgrind memory tools')}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {t('home.valgrindShort', 'Valgrind')}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Action Button for Usage Guide Sheet - deferred to reduce forced reflow */}
      <DeferUntilAfterPaint fallback={<div className="fixed bottom-16 left-4 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full" aria-hidden />}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-16 left-4 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2 z-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
              bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl ring-2 ring-blue-400/40 hover:scale-105 transition-transform duration-200"
            aria-label="Open usage guide"
          >
            <Info className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="fixed inset-0 w-screen h-screen max-w-none sm:max-w-none md:max-w-none lg:max-w-none xl:max-w-none 2xl:max-w-none p-0 flex flex-col">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 sm:p-8">
            {/* Sheet language selector next to close button */}
            <div className="absolute top-4 right-16 z-10">
              <LanguageSelector />
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 rounded-lg bg-white/10 ring-1 ring-white/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t('howToUse.title', 'How to use the playground')}</h2>
                <p className="text-white/90 text-xs sm:text-sm mt-1">{t('howToUse.oneLiner', 'Edit code, commit to the visual Git, explore branches, switch to Terminal, try Challenges, and learn GDB & Valgrind.')}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 bg-background">
            {/* Quick summary cards */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2"><Play className="h-4 w-4 text-green-600" />{t('howToUse.quickStartTitle', 'What you can do')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><BookOpen className="h-4 w-4 text-blue-600" />{t('howToUse.editCode', 'Edit code')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('howToUse.editCodeDesc', 'Modify code in the left editor.')}</p>
                </div>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><Plus className="h-4 w-4 text-emerald-600" />{t('howToUse.stageChanges', 'Stage changes')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('howToUse.stageChangesDesc', "Click 'Git Add' or run 'git add .' in Terminal mode.")}</p>
                </div>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><GitCommitIcon className="h-4 w-4 text-amber-600" />{t('howToUse.commitChanges', 'Commit changes')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('howToUse.commitChangesDesc', 'Write a message and press Commit to save your snapshot.')}</p>
                </div>
              </div>
            </section>

            {/* Core actions */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-indigo-600" />{t('howToUse.coreActionsTitle', 'Core actions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><GitBranchIcon className="h-4 w-4 text-blue-600" />{t('howToUse.createBranch', 'Create a branch')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('howToUse.createBranchDesc', "Use the 'Create branch' action or git checkout -b my-branch.")}</p>
                </div>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><ArrowDownUp className="h-4 w-4 text-purple-600" />{t('howToUse.switchBranch', 'Switch branch')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('howToUse.switchBranchDesc', 'Use the dropdown to change branch without losing your work.')}</p>
                </div>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><GitMergeIcon className="h-4 w-4 text-rose-600" />{t('howToUse.mergeBranches', 'Merge branches')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('howToUse.mergeBranchesDesc1', 'Merge your feature into dev, then dev into master.')}</p>
                </div>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><DownloadCloud className="h-4 w-4 text-teal-600" />{t('git.gitFetch', 'Fetch')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('explanations.gitFetch', 'Update remote information without changing your files.')}</p>
                </div>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><ArrowDownUp className="h-4 w-4 text-sky-600" />{t('git.gitPull', 'Pull')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('explanations.gitPull', 'Fetch + merge remote changes into your current branch.')}</p>
                </div>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="flex items-center gap-2 font-medium text-sm"><Upload className="h-4 w-4 text-orange-600" />{t('git.gitPush', 'Push')}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('explanations.gitPush', 'Upload your local commits to the remote repository.')}</p>
                </div>
              </div>
            </section>

            {/* Tips */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2"><TerminalIcon className="h-4 w-4 text-zinc-600" />{t('howToUse.tipsTitle', 'Tips')}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />{t('howToUse.tip1', "You can use the terminal or the buttons — both do the same.")}</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />{t('howToUse.tip2', 'Click a commit to preview its code on the right.')}</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />{t('howToUse.tip3', 'Look for the HEAD label to know your current position.')}</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />{t('howToUse.tip4', 'Use the Challenges button to practice guided exercises.')}</li>
              </ul>
            </section>
          </div>
        </SheetContent>
      </Sheet>
      </DeferUntilAfterPaint>

      {/* Floating Action Button for Git History Sheet - deferred to reduce forced reflow */}
      <DeferUntilAfterPaint fallback={<div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full" aria-hidden />}>
        <Suspense fallback={<LazyPanelFallback />}>
          <GitHistory />
        </Suspense>
      </DeferUntilAfterPaint>

      {/* Secondary banner: shown when user closed welcome without acting */}
      {!showQuickGuide && showSecondaryBanner && (
        <div data-home-strip className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/30 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="text-foreground font-medium">{t('home.secondaryBanner', 'First time here?')}</span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-7 text-xs"
            onClick={() => {
              document.getElementById('editor-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            <BookOpen className="h-3 w-3 mr-1" />
            {t('home.secondaryBannerCta1', 'Make your first commit in 1 min')}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-full h-7 text-xs bg-amber-500 hover:bg-amber-600"
            onClick={() => {
              sessionStorage.setItem('secondaryBannerDismissed', 'true');
              setShowSecondaryBanner(false);
              window.dispatchEvent(new CustomEvent('open-challenges'));
            }}
          >
            <Play className="h-3 w-3 mr-1" />
            {t('home.secondaryBannerCta2', 'Try Feature Branch challenge')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              sessionStorage.setItem('secondaryBannerDismissed', 'true');
              setShowSecondaryBanner(false);
            }}
            aria-label={t('common.close', 'Close')}
          >
            ×
          </Button>
        </div>
      )}

      {/* First-time quick guide - Edit → Add → Commit */}
      {showQuickGuide && (
        <div data-home-strip className="mb-3 p-3 rounded-lg bg-muted/50 border border-border/50 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t('home.quickGuide', 'Quick start:')}</span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {t('home.step1', 'Edit')}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> {t('home.step2', 'Add')}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="flex items-center gap-1">
            <GitCommitIcon className="h-3.5 w-3.5" /> {t('home.step3', 'Commit')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              sessionStorage.setItem('quickGuideDismissed', 'true');
              setShowQuickGuide(false);
            }}
            aria-label={t('common.close', 'Close')}
          >
            ×
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-1 mb-4 md:mb-6">
        {/* Left Column - Code Editor */}
        <div data-home-panel id="editor-section" className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] scroll-mt-4">
          <Suspense
            fallback={
              <CodeEditorSkeleton label={t("home.loadingEditor", "Loading editor…")} />
            }
          >
            <CodeEditor />
          </Suspense>
        </div>

        {/* Middle Column - Git Graph - loads when visible */}
        <div data-home-panel>
          <GitGraphContainer t={t} />
        </div>

        {/* Right Column - Diff or Selected Commit View */}
        <div data-home-panel className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] md:col-span-2 lg:col-span-1">
          {conflictExists ? (
            <Suspense fallback={<LazyPanelFallback />}>
              <ConflictResolver />
            </Suspense>
          ) : selectedCommit ? (
            <Suspense
              fallback={
                <CodeEditorSkeleton label={t("home.loadingEditor", "Loading editor…")} />
              }
            >
              <CodeEditor readOnly={true} content={selectedCommit.content} />
            </Suspense>
          ) : showDiff && headCommit ? (
            <Suspense fallback={<CodeEditorSkeleton label={t("home.loadingEditor", "Loading editor…")} />}>
              <DiffViewer
                oldContent={headCommit.content}
                newContent={stagedChanges || workingChanges}
              />
            </Suspense>
          ) : (
            <Card className="w-full h-full flex items-center justify-center">
              <CardContent className="text-center p-4 sm:p-6 flex flex-col items-center justify-center gap-3">
                <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">{t('visualization.title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('visualization.description')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 rounded-full"
                  onClick={() => {
                    document.getElementById('editor-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  {t('visualization.cta', 'Edit code and Add + Commit to see diff')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div data-home-controls>
        <Suspense fallback={<LazyPanelFallback />}>
          <GitControls />
        </Suspense>
      </div>

      <DeferUntilAfterPaint fallback={
        <section className="mt-6 mx-auto max-w-6xl w-full min-h-[340px]" aria-hidden>
          <div className="h-4 w-40 bg-muted/50 rounded mx-auto mb-2" />
          <div className="h-3 w-full max-w-2xl bg-muted/50 rounded mx-auto mb-6" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[140px] rounded-xl border border-border/60 bg-card/50 animate-pulse" />
            ))}
          </div>
        </section>
      }>
      <section className="mt-6 mx-auto max-w-6xl w-full min-h-[340px]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            {t("home.guidesTitle", "Popular guides")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              "home.guidesDescription",
              "Start from the exact topic you want to practice and jump straight into the right challenge or debugging guide."
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
          {featuredGuides.map((guide) => {
            const Icon = guide.icon;
            const colors = guideColorMap[guide.color];
            return (
              <Link
                key={guide.href}
                to={guide.href}
                className="home-guide-card group bg-white border border-border rounded-lg p-4 flex flex-col gap-3 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-brand focus-visible:ring-offset-2 transition-all duration-150 hover:-translate-y-0.5"
                aria-label={guide.title}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.icon}`}>
                    <Icon className="w-4 h-4 text-foreground/70" aria-hidden />
                  </div>
                  <span className={colors.badge}>{guide.command}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground leading-snug mb-1">{guide.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{guide.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${colors.tag}`}>{guide.difficulty}</span>
                  <span className={`text-sm ${colors.arrow} group-hover:translate-x-0.5 transition-transform`} aria-hidden>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </DeferUntilAfterPaint>

      {/* FAQ Section - deferred (below fold) to reduce forced reflow */}
      <DeferUntilAfterPaint fallback={
        <section className="mt-4 sm:mt-6 mx-auto max-w-3xl w-full px-2">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t('home.faqTitle', 'FAQs')}</h2>
          <div className="h-24 animate-pulse rounded-lg bg-muted/50" aria-hidden />
        </section>
      }>
      <section className="mt-4 sm:mt-6 mx-auto max-w-3xl w-full px-2">
        <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          {t('home.faqTitle', 'FAQs')}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="home-faq-item">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.faq.q1', 'Is Game4Git free?')}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {t('home.faq.a1', 'Yes. Game4Git is free to use and designed for learners and classrooms.')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="home-faq-item">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.faq.q2', 'Do I need to install Git?')}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {t('home.faq.a2', 'No. You can practice concepts, commands, and workflows directly in the browser.')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="home-faq-item">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.faq.q3', 'Can instructors use this in class?')}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {t('home.faq.a3', 'Yes. The Challenges and visual graph make it ideal for teaching core Git topics.')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      </DeferUntilAfterPaint>

      {/* Exercises Component */}
      <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center"><p className="text-sm text-muted-foreground">{t('common.loading', 'Loading exercises...')}</p></div>}>
        <GitExercises />
      </Suspense>

      {/* Footer */}
      <footer className="mt-6 sm:mt-8 py-3 sm:py-4 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <Link to={gdbPath} className="text-primary hover:underline flex items-center gap-1">
              <Bug className="h-3.5 w-3.5" />
              {t('home.footerGdb', 'Learn GDB')}
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link to={valgrindPath} className="text-primary hover:underline flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              {t('home.footerValgrind', 'Learn Valgrind')}
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <picture>
              <source srcSet="/logo-24.webp" type="image/webp" />
              <source srcSet="/logo-24.png" type="image/png" />
              <img 
                src="/logo-24.png" 
                alt="Git Game Logo" 
                className="h-5 w-5 sm:h-6 sm:w-6" 
                loading="lazy"
                decoding="async"
                width="24"
                height="24"
              />
            </picture>
            <p className="font-medium">Git Game</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <p>&copy; {new Date().getFullYear()} FerVi. All rights reserved.</p>
            <span>|</span>
            <a
              href="mailto:game4git@gmail.com"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "mailto:game4git@gmail.com";
              }}
            >
              Contact
            </a>
            <span>|</span>
            <Button
              asChild
              size="sm"
              className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <a
                href="https://ko-fi.com/joanferreres"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tip the creator on Ko-fi"
              >
                ☕ Tip
              </a>
            </Button>
          </div>
          <p className="text-xs">Built with React, TypeScript and TailwindCSS. Learn Git concepts visually.</p>
        </div>
      </footer>
    </div>
  );
};

// Separate component for GitGraph that only loads when visible
const GitGraphContainer: React.FC<{ t: ReturnType<typeof useTranslation>['t'] }> = ({ t }) => {
  // Mobile: defer GitGraph (60KB) until user scrolls to it. Small rootMargin = load only when near viewport.
  const [ref, isInView] = useInView<HTMLDivElement>({ rootMargin: '50px', triggerOnce: true });
  const [GitGraphComponent, setGitGraphComponent] = useState<React.ComponentType | null>(null);
  
  // Only import GitGraph when it becomes visible; use requestIdleCallback to avoid blocking main thread
  useEffect(() => {
    if (!isInView || GitGraphComponent) return;
    const loadGraph = () => {
      import("@/components/GitGraph").then((module) => {
        setGitGraphComponent(() => module.default);
      });
    };
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(loadGraph, { timeout: 2000 });
    } else {
      loadGraph();
    }
  }, [isInView, GitGraphComponent]);
  
  const LoadingPlaceholder = (
    <Card className="w-full h-full min-h-full flex items-center justify-center" aria-hidden>
      <CardContent className="text-center p-4 sm:p-6 flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('common.loading', 'Loading graph...')}</p>
      </CardContent>
    </Card>
  );
  
  return (
    <div ref={ref} className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] min-h-[350px]">
      {GitGraphComponent ? <GitGraphComponent /> : LoadingPlaceholder}
    </div>
  );
};

export default GitGame;

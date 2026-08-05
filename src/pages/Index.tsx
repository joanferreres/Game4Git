import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@/styles/playground.css";
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
import { Info, Play, Plus, ArrowDownUp, Upload, DownloadCloud, GitBranch as GitBranchIcon, GitMerge as GitMergeIcon, GitCommit as GitCommitIcon, Terminal as TerminalIcon, BookOpen, HelpCircle, CheckCircle2, Sparkles } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

import { useTranslation } from "react-i18next";
const GitExercises = lazy(() => import("@/components/GitExercises"));
const ConflictResolver = lazy(() => import("@/components/ConflictResolver"));
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

import { DeferUntilAfterPaint } from "@/components/DeferUntilAfterPaint";
import AppNav from "@/components/AppNav";
import SeoHead from "@/components/SeoHead";
import SiteFooter from "@/components/SiteFooter";
import { useLocalizedPath } from "@/lib/localizedRoutes";

/** Matches panel column heights to avoid CLS while lazy chunks load */
const PANEL_HEIGHT =
  "h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] min-h-[350px]";

const LazyPanelFallback = () => (
  <div
    className={`${PANEL_HEIGHT} animate-pulse rounded-lg bg-muted/30`}
    aria-hidden
  />
);

const CodeEditorSkeleton: React.FC<{ label: string }> = ({ label }) => (
  <Card className={`w-full ${PANEL_HEIGHT} overflow-hidden flex flex-col`}>
    <CardHeader className="py-3 px-4 shrink-0">
      <CardTitle className="text-sm flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-git-editor shrink-0" aria-hidden />
        hello.c
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0 flex-1 min-h-0">
      <div
        className="h-full bg-[#2d2d2d] flex items-center justify-center"
        aria-busy="true"
        aria-label={label}
      >
        <p className="text-xs text-[#f8f8f2]/50">{label}</p>
      </div>
    </CardContent>
  </Card>
);

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
  const { setGdbEnabled, setValgrindEnabled } = useAdminStore();

  // Always enabled; no remote fetch needed
  useEffect(() => {
    setGdbEnabled(true);
    setValgrindEnabled(true);
  }, [setGdbEnabled, setValgrindEnabled]);
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const gitPracticeGamePath = localizePath("/git-practice-game");
  const gitBranchPracticePath = localizePath("/git-branch-practice");
  const gitMergeConflictsPath = localizePath("/git-merge-conflicts");
  const valgrindMemoryLeaksPath = localizePath("/valgrind-memory-leaks");

  const GUIDE_BADGE = "font-mono text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded";
  const guideColorMap = {
    orange: { icon: "bg-[#fff4f1] dark:bg-orange-950/50", tag: "bg-[#fff4f1] text-[#c2410c] dark:bg-orange-950/50 dark:text-orange-400", arrow: "text-orange-brand", badge: GUIDE_BADGE },
    sky:    { icon: "bg-sky-50 dark:bg-sky-950/50",       tag: "bg-sky-50 text-blue-700 dark:bg-sky-950/50 dark:text-sky-400",           arrow: "text-blue-600 dark:text-sky-400",   badge: GUIDE_BADGE },
    amber:  { icon: "bg-amber-50 dark:bg-amber-950/50",   tag: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",     arrow: "text-amber-600 dark:text-amber-400", badge: GUIDE_BADGE },
    green:  { icon: "bg-green-50 dark:bg-green-950/50",   tag: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",     arrow: "text-green-600 dark:text-green-400", badge: GUIDE_BADGE },
  } as const;

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

  return (
    <div ref={rootRef} className="min-h-screen flex flex-col">
      <AppNav variant="inner" badge="git playground" centerBrand />
      <main id="main-content" className="container max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col flex-1">
      <SeoHead page="playground" />
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
            className="rounded-lg bg-orange-brand hover:bg-orange-brand-hover text-white shadow-sm text-xs"
            onClick={() => window.dispatchEvent(new CustomEvent('open-challenges'))}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {t('home.startFirstChallenge', 'Start first challenge')}
          </Button>
        </div>
      )}

      {/* Floating Action Button for Usage Guide Sheet - deferred to reduce forced reflow */}
      <DeferUntilAfterPaint fallback={<div className="fixed bottom-16 left-4 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full" aria-hidden />}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-16 left-4 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2 z-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-orange-brand hover:bg-orange-brand-hover text-white shadow-xl hover:scale-105 transition-transform duration-200"
            aria-label="Open usage guide"
          >
            <Info className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="fixed inset-0 w-screen h-screen max-w-none sm:max-w-none md:max-w-none lg:max-w-none xl:max-w-none 2xl:max-w-none p-0 flex flex-col">
          <div className="relative bg-sheet-dark text-white p-5 sm:p-8">
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
            className="rounded-lg h-7 text-xs bg-orange-brand hover:bg-orange-brand-hover"
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

      {/* Guide cards */}
      <DeferUntilAfterPaint fallback={
        <section className="mt-6 mx-auto max-w-6xl w-full min-h-[200px]" aria-hidden>
          <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[140px] rounded-xl border border-border/60 bg-card/50 animate-pulse" />
            ))}
          </div>
        </section>
      }>
      <section className="mt-6 mx-auto max-w-6xl w-full">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            {t("home.guidesTitle", "Popular guides")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("home.guidesDescription", "Start from the exact topic you want to practice and jump straight into the right challenge or debugging guide.")}
            {" "}
            <Link to={gitPracticeGamePath} className="underline hover:text-primary">
              {t("landingPages.gitPracticeGame.eyebrow", "Practice Git online")}
            </Link>
            {" · "}
            <Link to={gitBranchPracticePath} className="underline hover:text-primary">
              {t("landingPages.gitBranchPractice.eyebrow", "Git branch practice")}
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mt-6">
          {featuredGuides.map((guide) => {
            const Icon = guide.icon;
            const colors = guideColorMap[guide.color];
            return (
              <Link
                key={guide.href}
                to={guide.href}
                className="home-guide-card group bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-brand focus-visible:ring-offset-2 transition-all duration-150 hover:-translate-y-0.5"
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

      <SiteFooter className="mt-6 sm:mt-8" />
      </main>
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

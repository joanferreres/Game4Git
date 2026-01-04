import React, { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from 'react-helmet-async';
import DiffViewer from "@/components/DiffViewer";

// Lazy load heavy components to improve initial LCP
const CodeEditor = lazy(() => import("@/components/CodeEditor"));
const GitGraph = lazy(() => import("@/components/GitGraph"));
import GitControls from "@/components/GitControls";
import GitHistory from "@/components/GitHistory";
import WelcomeBanner from "@/components/WelcomeBanner";
import useGitStore, { useAdminStore } from "@/store/gitStore";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, Sparkles, Play, Plus, ArrowDownUp, Upload, DownloadCloud, GitBranch as GitBranchIcon, GitMerge as GitMergeIcon, GitCommit as GitCommitIcon, Terminal as TerminalIcon, BookOpen, HelpCircle, CheckCircle2 } from "lucide-react";

import { useTranslation } from "react-i18next";
import "../i18n"; // Importamos la configuración de i18n
const GitExercises = lazy(() => import("@/components/GitExercises"));
import { ThemeToggle } from "@/components/ThemeToggle";
import ConflictResolver from "@/components/ConflictResolver";
import { Link } from "react-router-dom";
import { Bug, Shield } from "lucide-react";

import LanguageSelector from "@/components/LanguageSelector";

const GitGame: React.FC = () => {
  const [showDiff, setShowDiff] = useState(false);
  const { repository, workingChanges, selectedCommitId, stagedChanges, hasPendingConflict } = useGitStore();
  const { isGdbEnabled, isValgrindEnabled, setGdbEnabled, setValgrindEnabled } = useAdminStore();

  // Always enabled; no remote fetch needed
  useEffect(() => {
    setGdbEnabled(true);
    setValgrindEnabled(true);
  }, [setGdbEnabled, setValgrindEnabled]);
  const { t } = useTranslation();

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
    <div className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <Helmet>
        <title>Game4Git: Interactive Git Learning Game</title>
        <meta name="description" content="Master Git commands, branching, and merging with this visual interactive playground. No installation required." />
        <meta name="keywords" content="git game, learn git, git playground, git visualizer" />
        <link rel="canonical" href="https://game4git.games/" />
      </Helmet>
      <WelcomeBanner />

      <header className="mb-4 sm:mb-6 relative min-h-[80px] sm:min-h-[100px]">
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('general.title')}</h1>
          <section className="mx-auto max-w-2xl text-center mt-2 mb-3 sm:mb-4 px-2">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t(
                'home.seoIntroShort',
                'Learn Git by doing. Visualize branches and merges while running real commands. Try guided challenges or switch to the terminal anytime.'
              )}
              {" "}
              <Link to="/gdb" className="underline hover:text-primary">GDB</Link>
              {" "}
              {t('home.seoIntroAnd', 'and')}
              {" "}
              <Link to="/valgrind" className="underline hover:text-primary">Valgrind</Link>
              {" "}
              {t('home.seoIntroTailShort', 'basics included.')}
            </p>
          </section>

          {/* Navigation to additional tools - Only show if enabled in admin */}
          {(isGdbEnabled || isValgrindEnabled) && (
            <div className="flex justify-center gap-2 mt-3 md:mt-4">
              {isGdbEnabled && (
                <Link to="/gdb">
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-1 ring-blue-400/30 hover:shadow-lg hover:-translate-y-0.5 transition-transform"
                    aria-label="Open GDB"
                  >
                    <Bug className="h-3 w-3 mr-1 text-white" />
                    GDB Debugger
                  </Button>
                </Link>
              )}
              {isValgrindEnabled && (
                <Link to="/valgrind">
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-1 ring-emerald-400/30 hover:shadow-lg hover:-translate-y-0.5 transition-transform"
                    aria-label="Open Valgrind"
                  >
                    <Shield className="h-3 w-3 mr-1 text-white" />
                    Valgrind Memory
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Floating Action Button for Usage Guide Sheet */}
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

      {/* Floating Action Button for Git History Sheet */}
      <GitHistory />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-1 mb-4 md:mb-6">
        {/* Left Column - Code Editor */}
        <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
          <Suspense fallback={<Card className="w-full h-full flex items-center justify-center"><CardContent className="text-center p-4 sm:p-6"><p className="text-sm text-muted-foreground">{t('common.loading', 'Loading editor...')}</p></CardContent></Card>}>
            <CodeEditor />
          </Suspense>
        </div>

        {/* Middle Column - Git Graph */}
        <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
          <Suspense fallback={<Card className="w-full h-full flex items-center justify-center"><CardContent className="text-center p-4 sm:p-6"><p className="text-sm text-muted-foreground">{t('common.loading', 'Loading graph...')}</p></CardContent></Card>}>
            <GitGraph />
          </Suspense>
        </div>

        {/* Right Column - Diff or Selected Commit View */}
        <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] md:col-span-2 lg:col-span-1">
          {conflictExists ? (
            <ConflictResolver />
          ) : selectedCommit ? (
            <Suspense fallback={<Card className="w-full h-full flex items-center justify-center"><CardContent className="text-center p-4 sm:p-6"><p className="text-sm text-muted-foreground">{t('common.loading', 'Loading...')}</p></CardContent></Card>}>
              <CodeEditor
                readOnly={true}
                content={selectedCommit.content}
              />
            </Suspense>
          ) : showDiff && headCommit ? (
            <DiffViewer
              oldContent={headCommit.content}
              newContent={stagedChanges || workingChanges}
            />
          ) : (
            <Card className="w-full h-full flex items-center justify-center">
              <CardContent className="text-center p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">{t('visualization.title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('visualization.description')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div>
        <GitControls />
      </div>

      {/* FAQ Section */}
      <section className="mt-4 sm:mt-6 mx-auto max-w-3xl w-full px-2">
        <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          {t('home.faqTitle', 'FAQs')}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.faq.q1', 'Is Game4Git free?')}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {t('home.faq.a1', 'Yes. Game4Git is free to use and designed for learners and classrooms.')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.faq.q2', 'Do I need to install Git?')}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {t('home.faq.a2', 'No. You can practice concepts, commands, and workflows directly in the browser.')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.faq.q3', 'Can instructors use this in class?')}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {t('home.faq.a3', 'Yes. The Challenges and visual graph make it ideal for teaching core Git topics.')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Exercises Component */}
      <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center"><p className="text-sm text-muted-foreground">{t('common.loading', 'Loading exercises...')}</p></div>}>
        <GitExercises />
      </Suspense>

      {/* Footer */}
      <footer className="mt-6 sm:mt-8 py-3 sm:py-4 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
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
              className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              <a
                href="https://ko-fi.com/joanferreres"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Support on Ko-fi"
              >
                Support on Ko-fi
              </a>
            </Button>
          </div>
          <p className="text-xs">Built with React, TypeScript and TailwindCSS. Learn Git concepts visually.</p>
        </div>
      </footer>
    </div>
  );
};

export default GitGame;

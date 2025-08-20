import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CodeEditor from "@/components/CodeEditor";
import GitGraph from "@/components/GitGraph";
import DiffViewer from "@/components/DiffViewer";
import GitControls from "@/components/GitControls";
import GitHistory from "@/components/GitHistory";
import WelcomeBanner from "@/components/WelcomeBanner";
import useGitStore, { useAdminStore } from "@/store/gitStore";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
 
import { useTranslation } from "react-i18next";
import "../i18n"; // Importamos la configuración de i18n
import GitExercises from "@/components/GitExercises";
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
      <WelcomeBanner />
      
      <header className="mb-4 sm:mb-6 relative">
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('general.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 md:mt-2">
            {t('general.subtitle')}
          </p>
          
          {/* Navigation to additional tools - Only show if enabled in admin */}
          {(isGdbEnabled || isValgrindEnabled) && (
            <div className="flex justify-center gap-2 mt-3 md:mt-4">
              {isGdbEnabled && (
                <Link to="/gdb">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Bug className="h-3 w-3 mr-1" />
                    GDB Debugger
                  </Button>
                </Link>
              )}
              {isValgrindEnabled && (
                <Link to="/valgrind">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
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
        <SheetContent side="left" className="w-full sm:w-[540px] p-0 flex flex-col h-full">
          <SheetHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b">
            <SheetTitle className="text-lg sm:text-xl font-semibold">{t('howToUse.title')}</SheetTitle>
            <SheetDescription>
              {t('howToUse.subtitle')}
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4"> {/* Adjust height as needed */}
            <div className="space-y-3">
              <h3 className="text-md sm:text-lg font-medium text-primary">{t('howToUse.basicsTitle', 'Basic Operations')}</h3>
              <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li>
                  <strong className="font-semibold">{t('howToUse.editCode')}</strong>: {t('howToUse.editCodeDesc')}
                </li>
                <li>
                  <strong className="font-semibold">{t('howToUse.stageChanges')}</strong>: {t('howToUse.stageChangesDesc')}
                </li>
                <li>
                  <strong className="font-semibold">{t('howToUse.commitChanges')}</strong>: {t('howToUse.commitChangesDesc')}
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="text-md sm:text-lg font-medium text-primary">{t('howToUse.branchingTitle', 'Branching & Merging')}</h3>
              <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li>
                  <strong className="font-semibold">{t('howToUse.createBranch')}</strong>: {t('howToUse.createBranchDesc')}
                </li>
                <li>
                  <strong className="font-semibold">{t('howToUse.switchBranch')}</strong>: {t('howToUse.switchBranchDesc')}
                </li>
                <li>
                  <strong className="font-semibold">{t('howToUse.mergeBranches')}</strong>:
                  <ul className="list-disc list-inside pl-4 sm:pl-6 space-y-1 sm:space-y-1.5 mt-1 sm:mt-1.5">
                    <li>{t('howToUse.mergeBranchesDesc1')}</li>
                    <li>{t('howToUse.mergeBranchesDesc2')}</li>
                  </ul>
                </li>
                <li>
                  <strong className="font-semibold">{t('howToUse.resolveConflicts')}</strong>: {t('howToUse.resolveConflictsDesc')}
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="text-md sm:text-lg font-medium text-primary">{t('howToUse.viewingTitle', 'Viewing History & Changes')}</h3>
              <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li>
                  <strong className="font-semibold">{t('howToUse.viewHistory')}</strong>: {t('howToUse.viewHistoryDesc')}
                </li>
                <li>
                  <strong className="font-semibold">{t('howToUse.viewChanges')}</strong>: {t('howToUse.viewChangesDesc')}
                </li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-md sm:text-lg font-medium text-primary">{t('howToUse.remoteTitle', 'Remote Operations (Simulated)')}</h3>
              <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li>
                  <strong className="font-semibold">{t('howToUse.remoteOperations')}</strong>: {t('howToUse.remoteOperationsDesc')}
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="text-md sm:text-lg font-medium text-primary">{t('howToUse.exploreTitle', 'Explore & Experiment')}</h3>
               <p className="text-xs sm:text-sm text-muted-foreground">{t('howToUse.experimentDesc')}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Floating Action Button for Git History Sheet */}
      <GitHistory />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-1 mb-4 md:mb-6">
        {/* Left Column - Code Editor */}
        <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
          <CodeEditor />
        </div>
        
        {/* Middle Column - Git Graph */}
        <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
          <GitGraph />
        </div>
        
        {/* Right Column - Diff or Selected Commit View */}
        <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] md:col-span-2 lg:col-span-1">
          {conflictExists ? (
            <ConflictResolver />
          ) : selectedCommit ? (
            <CodeEditor 
              readOnly={true} 
              content={selectedCommit.content} 
            />
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
      
      {/* Exercises Component */}
      <GitExercises />
      
      {/* Footer */}
      <footer className="mt-6 sm:mt-8 py-3 sm:py-4 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Git Game Logo" className="h-5 w-5 sm:h-6 sm:w-6" />
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
          </div>
          <p className="text-xs">Built with React, TypeScript and TailwindCSS. Learn Git concepts visually.</p>
        </div>
      </footer>
    </div>
  );
};

export default GitGame;

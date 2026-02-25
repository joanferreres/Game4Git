import React, { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  FileDiff,
  RefreshCw,
  RefreshCcw,
  Code,
  Plus,
  Terminal,
  DownloadCloud,
  Upload,
  ArrowDownUp,
  HelpCircle,
  Info
} from "lucide-react";
import useGitStore from "@/store/gitStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const GitTerminal = lazy(() => import("./GitTerminal"));
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

// Define Git workflow guide content
interface WorkflowStep {
  title: string;
  description: string;
}

interface WorkflowGuide {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
}

const gitWorkflows: WorkflowGuide[] = [
  {
    id: "daily",
    title: "Daily Workflow",
    description: "Basic steps for everyday Git work",
    steps: [
      { 
        title: "1. Check your current branch", 
        description: "Always verify which branch you're on with 'git branch' or check the status bar. This helps avoid accidental work on the wrong branch." 
      },
      { 
        title: "2. Update your local repository", 
        description: "Run 'git fetch' to download the latest changes from remote without modifying your working directory." 
      },
      { 
        title: "3. Integrate remote changes", 
        description: "Run 'git pull' to fetch AND merge changes from the remote into your current branch before starting new work." 
      },
      { 
        title: "4. Make your changes", 
        description: "Modify code, add files, etc." 
      },
      { 
        title: "5. Stage your changes", 
        description: "Use 'git add <files>' or 'git add .' to stage your changes for committing." 
      },
      { 
        title: "6. Commit your changes", 
        description: "Use 'git commit -m \"Your descriptive message\"' to save your staged changes locally." 
      },
      { 
        title: "7. Push your changes", 
        description: "Use 'git push' to upload your local commits to the remote repository." 
      }
    ]
  },
  {
    id: "branching",
    title: "Branching Workflow",
    description: "How to work with branches",
    steps: [
      { 
        title: "1. Create a new branch", 
        description: "Use 'git branch <branch-name>' to create a branch (without switching to it)." 
      },
      { 
        title: "2. Create and switch to a new branch", 
        description: "Use 'git checkout -b <branch-name>' to create a branch and immediately switch to it." 
      },
      { 
        title: "3. Switch between branches", 
        description: "Use 'git checkout <branch-name>' to switch to an existing branch." 
      },
      { 
        title: "4. List all branches", 
        description: "Use 'git branch' to see all local branches. The current branch will be marked with an asterisk (*)." 
      },
      { 
        title: "5. Get remote branches", 
        description: "Use 'git fetch' to update remote branch information, then 'git branch -r' to see remote branches." 
      }
    ]
  },
  {
    id: "merging",
    title: "Merging Workflow",
    description: "How to merge changes between branches",
    steps: [
      { 
        title: "1. Switch to the target branch", 
        description: "First use 'git checkout <target-branch>' to switch to the branch you want to merge INTO. This is critical - you must be ON the receiving branch." 
      },
      { 
        title: "2. Update the target branch", 
        description: "Run 'git pull' to make sure your target branch is up to date with the remote." 
      },
      { 
        title: "3. Merge the source branch", 
        description: "Use 'git merge <source-branch>' to merge changes FROM the source branch INTO your current (target) branch." 
      },
      { 
        title: "4. Resolve any conflicts", 
        description: "If there are merge conflicts, Git will notify you. Edit the conflicted files, then 'git add' them once resolved." 
      },
      { 
        title: "5. Resolving Merge Conflicts (In Detail)", 
        description: "When conflicts occur, Git marks them in files with special markers. Open each conflicted file and look for sections with '<<<<<<< HEAD', '=======', and '>>>>>>> branch-name'. The content between '<<<<<<< HEAD' and '=======' is from your current branch, while content between '=======' and '>>>>>>> branch-name' is from the branch being merged. Edit these sections to create the final version, removing all conflict markers. After resolving, run 'git add <file>' on each fixed file and commit with 'git commit'." 
      },
      { 
        title: "6. Complete the merge", 
        description: "If there were conflicts, use 'git commit' to finalize the merge. Otherwise, the merge is completed automatically." 
      },
      { 
        title: "7. Push the merged changes", 
        description: "Use 'git push' to upload the merged changes to the remote repository." 
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common Git issues and solutions",
    steps: [
      { 
        title: "Discard local changes", 
        description: "Use 'git reset --hard' to discard all local changes and reset to the last commit." 
      },
      { 
        title: "Discard all unstaged changes", 
        description: "Use 'git checkout -- .' to discard all unstaged changes in your working directory. This is safer than reset --hard as it only affects unstaged changes." 
      },
      { 
        title: "Discard changes for specific file", 
        description: "Use 'git checkout -- <file>' to discard changes to a specific file and restore it to the version in HEAD." 
      },
      { 
        title: "Unstage files", 
        description: "Use 'git reset HEAD <file>' to unstage a file while keeping your changes." 
      },
      { 
        title: "Fix last commit message", 
        description: "Use 'git commit --amend' to modify your most recent commit message (before pushing)." 
      },
      { 
        title: "Undo last commit", 
        description: "Use 'git reset HEAD~1' to undo the last commit but keep the changes staged." 
      },
      { 
        title: "Check commit history", 
        description: "Use 'git log' to see the commit history and find specific commits if needed." 
      },
      {
        title: "Abort a merge with conflicts",
        description: "If you've started a merge but want to cancel it due to too many conflicts, use 'git merge --abort' to return to the state before the merge started."
      }
    ]
  }
];

// GitGuide component
const GitGuide: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 py-1 gap-1 flex items-center">
          <Info className="h-4 w-4" />
          <span className="text-xs">{t('guide.helper', 'Helper')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('guide.title')}</DialogTitle>
          <DialogDescription>
            {t('guide.description')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="daily" className="mt-4">
          <div className="overflow-x-hidden">
            <TabsList className="flex w-full gap-1 mb-1">
              {gitWorkflows.map(workflow => (
                <TabsTrigger 
                  key={workflow.id} 
                  value={workflow.id}
                  className="flex-1 text-center px-1 text-[10px] sm:text-xs md:text-sm whitespace-normal h-auto py-1 leading-tight"
                >
                  {t(`guide.${workflow.id}.title`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {gitWorkflows.map(workflow => {
            const numberOfSteps = workflow.id === "troubleshooting" ? 8 : 7;
            
            return (
              <TabsContent key={workflow.id} value={workflow.id} className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="text-lg font-medium">{t(`guide.${workflow.id}.title`)}</h3>
                  <p className="text-muted-foreground">{t(`guide.${workflow.id}.description`)}</p>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: numberOfSteps }, (_, i) => i + 1).map((stepNum) => (
                    <div key={stepNum} className="bg-card border rounded-md p-3">
                      <h4 className="text-sm font-semibold">{t(`guide.${workflow.id}.step${stepNum}.title`)}</h4>
                      <p className="text-sm text-muted-foreground">{t(`guide.${workflow.id}.step${stepNum}.description`)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const GitControls: React.FC = () => {
  const { 
    repository, 
    createCommit, 
    createBranch, 
    switchBranch, 
    resetWorkingChanges,
    selectedCommitId,
    selectCommit,
    stagedChanges,
    stageChanges,
    workingChanges,
    resetToInitialCommit,
    mergeBranch,
    fetchRemote,
    pullRemote,
    pushToRemote
  } = useGitStore();
  
  const [commitMessage, setCommitMessage] = useState("");
  const [branchName, setBranchName] = useState("");
  const [sourceBranchToMerge, setSourceBranchToMerge] = useState<string | undefined>(undefined);
  const [targetBranchForMerge, setTargetBranchForMerge] = useState<string | undefined>(repository.branches.find(b => b.isActive)?.name);
  
  // Estado para controlar si se muestra la interfaz de terminal o botones
  const [useTerminal, setUseTerminal] = useState(false);
  
  // Get active branch
  const activeBranch = repository.branches.find(b => b.isActive);
  
  // Get active branch name for useEffect dependency
  const activeBranchName = activeBranch?.name;
  
  // Effect to update targetBranchForMerge when activeBranch changes, but only for initial setup
  useEffect(() => {
    // Solo establecer el valor inicial para targetBranchForMerge si está vacío
    if (activeBranchName && !targetBranchForMerge) {
      setTargetBranchForMerge(activeBranchName);
    }
  }, [activeBranchName, targetBranchForMerge]);
  
  // Handle staging changes (git add)
  const handleStageChanges = () => {
    stageChanges(workingChanges);
    toast.success("Changes staged for commit");
  };
  
  // Handle commit action
  const handleCommit = () => {
    if (!commitMessage.trim()) {
      toast.error("Please enter a commit message");
      return;
    }

    if (!stagedChanges) {
      toast.error("No changes have been staged for commit. Use Git Add first.");
      return;
    }

    const wasFirstCommit = repository.commits.length === 1;
    createCommit(commitMessage);
    setCommitMessage("");
    if (wasFirstCommit) {
      toast.success(t('messages.firstCommit', '🎉 Your first commit! Well done.'), { duration: 4000 });
    } else {
      toast.success("Changes committed successfully");
    }
  };
  
  // Handle branch creation
  const handleCreateBranch = () => {
    if (!branchName.trim()) {
      toast.error("Please enter a branch name");
      return;
    }
    
    if (repository.branches.some(b => b.name === branchName)) {
      toast.error("Branch already exists");
      return;
    }
    
    createBranch(branchName);
    setBranchName("");
    toast.success(`Branch "${branchName}" created`);
  };
  
  // Handle branch switch
  const handleSwitchBranch = (value: string) => {
    switchBranch(value);
    toast.success(`Switched to branch "${value}"`);
  };
  
  // Handle reset working changes
  const handleReset = () => {
    if (workingChanges) {
      // Solo resetear si hay cambios para resetear
      const currentCommit = repository.commits.find(c => c.id === repository.HEAD);
      if (currentCommit && currentCommit.content !== workingChanges) {
    resetWorkingChanges();
        toast.info(t('messages.changesReset', "Changes reset to current HEAD"));
      } else {
        toast.info(t('messages.noChangesToReset', "No changes to reset"));
      }
    } else {
      toast.info(t('messages.noChangesToReset', "No changes to reset"));
    }
  };
  
  // Handle clear selection and reset to initial commit
  const handleClearSelection = () => {
    // Verificar si hay una selección para limpiar o si estamos en una rama diferente a master
    if (selectedCommitId || activeBranchName !== "master") {
    // Clear the selected commit
    selectCommit(null);
    
    // Reset to the initial commit
    resetToInitialCommit();
    
      toast.info(t('messages.resetToInitial', "Reset to initial commit"));
      
      // Mostrar una explicación más detallada de lo que hace esta acción
      toast.info(
        t('messages.clearSelectionExplanation', 'This resets the graph view to the initial state, returns to the master branch, and clears your commit selection.'),
        {
          duration: 4000
        }
      );
    } else {
      toast.info(t('messages.nothingToClear', "Nothing to clear"));
    }
  };
  
  // Handle merge action
  const handleMerge = () => {
    if (!sourceBranchToMerge) {
      toast.error("Please select a source branch to merge.");
      return;
    }
    if (!targetBranchForMerge) {
      toast.error("Please select a target branch to merge into.");
      return;
    }
    if (sourceBranchToMerge === targetBranchForMerge) {
      toast.error("Source and target branches cannot be the same.");
      return;
    }
    mergeBranch(sourceBranchToMerge, targetBranchForMerge);
    toast.success(`Merged branch "${sourceBranchToMerge}" into "${targetBranchForMerge}"`);
    setSourceBranchToMerge(undefined); // Reset selection
    // setTargetBranchForMerge(undefined); // Optionally reset target, or let it persist (current active branch)
  };

  // Handle remote operations
  const handleFetch = () => {
    toast.info(
      t('git.gitFetch'), 
      { 
        description: t('explanations.gitFetch'),
        duration: 5000
      }
    );
  };

  const handlePull = () => {
    if (!activeBranchName) {
      toast.error(t('messages.noActiveBranch'));
      return;
    }
    
    toast.info(
      t('git.gitPull'), 
      { 
        description: t('explanations.gitPull'),
        duration: 5000
      }
    );
  };

  const handlePush = () => {
    if (!activeBranchName) {
      toast.error(t('messages.noActiveBranch'));
      return;
    }
    
    toast.info(
      t('git.gitPush'), 
      { 
        description: t('explanations.gitPush'),
        duration: 5000
      }
    );
  };

  const hasChangesToStage = workingChanges !== repository.commits.find(c => c.id === repository.HEAD)?.content;
  const hasStaged = stagedChanges !== null;

  // Toggle between UI modes
  const toggleTerminal = () => {
    setUseTerminal(!useTerminal);
  };

  // Contenido condicional basado en el modo de UI seleccionado (GitTerminal lazy-loaded)
  const renderContent = () => {
    if (useTerminal) {
      return (
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground animate-pulse">{t('common.loading', 'Loading terminal...')}</div>}>
          <GitTerminal />
        </Suspense>
      );
    }

    return (
      <CardContent className="space-y-4 p-3 sm:p-6">
        {/* Commit Section */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium">{t('git.commitChanges')}</h3>
          
          {/* Git Add step */}
          <div className="flex items-end gap-2 mb-2">
            <Button 
              onClick={handleStageChanges}
              disabled={!hasChangesToStage}
              className="bg-git-branch hover:bg-git-branch/80 w-full text-xs sm:text-sm"
              size="sm"
            >
              <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t('git.gitAdd')}</span>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
            <div className="flex-1 w-full">
              <Input
                placeholder={t('git.commitChanges')}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            <Button 
              variant="default"
              size="sm"
              disabled={!commitMessage.trim() || !stagedChanges}
              onClick={handleCommit}
              className="bg-git-commit hover:bg-git-commit/80 text-xs sm:text-sm w-full sm:w-auto"
            >
              <GitCommit className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              {t('git.commitChanges')}
            </Button>
          </div>
          
          {hasStaged && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {t('messages.stagedAndReady')}
            </p>
          )}
          
          {!hasStaged && hasChangesToStage && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {t('messages.hasUnsavedChanges')}
            </p>
          )}
        </div>
        
        <Separator />
        
        {/* Branch Section */}
        <div>
          <h3 className="text-xs sm:text-sm font-medium mb-2">{t('git.branches')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-[10px] sm:text-xs mb-1">{t('git.currentBranch')}</p>
              <div className="bg-muted/50 p-2 rounded-md text-xs sm:text-sm flex items-center">
                <GitBranch className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{activeBranch?.name || "none"}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs mb-1">{t('git.switchBranch')}</p>
              <Select onValueChange={handleSwitchBranch}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm" aria-label={t('git.switchBranch', 'Switch Branch')}>
                  <SelectValue placeholder={t('git.switchBranch')} />
                </SelectTrigger>
                <SelectContent>
                  {repository.branches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name} className="text-xs sm:text-sm">
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
            <div className="flex-1 w-full">
              <Input
                placeholder={t('git.newBranchName')}
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            <Button 
              onClick={handleCreateBranch}
              size="sm"
              disabled={!branchName.trim()}
              className="bg-git-branch hover:bg-git-branch/80 text-xs sm:text-sm w-full sm:w-auto"
            >
              <GitBranch className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              {t('git.createBranch')}
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Remote Repository Section */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium">{t('git.remoteName')} ({repository.remoteName})</h3>
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleFetch}
              className="w-full text-[10px] sm:text-xs px-1 sm:px-3 h-8 sm:h-10"
              aria-label={t('git.gitFetch', 'Git Fetch')}
            >
              <DownloadCloud className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline">{t('git.gitFetch')}</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handlePull}
              disabled={!activeBranchName}
              className="w-full text-[10px] sm:text-xs px-1 sm:px-3 h-8 sm:h-10"
              aria-label={t('git.gitPull', 'Git Pull')}
            >
              <ArrowDownUp className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline">{t('git.gitPull')}</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handlePush}
              disabled={!activeBranchName}
              className="w-full text-[10px] sm:text-xs px-1 sm:px-3 h-8 sm:h-10"
              aria-label={t('git.gitPush', 'Git Push')}
            >
              <Upload className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline">{t('git.gitPush')}</span>
            </Button>
          </div>
          
          {/* Mostrar información sobre el último fetch/push */}
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-2">
            {repository.lastFetchTime && (
              <div>{t('git.lastFetch')}: {new Date(repository.lastFetchTime).toLocaleTimeString()}</div>
            )}
            {repository.lastPushTime && (
              <div>{t('git.lastPush')}: {new Date(repository.lastPushTime).toLocaleTimeString()}</div>
            )}
            </div>
            {/* Mostrar las referencias remotas */}
            <div className="mt-1">
              {t('git.remoteReferences')}:
              <ul className="list-disc list-inside">
                {repository.remoteReferences.map(ref => (
                  <li key={ref.name} className="truncate">{ref.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Merge Section */}
        {repository.branches.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-medium">{t('git.mergeBranches')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
              <div>
                <label htmlFor="sourceBranchSelect" className="text-[10px] sm:text-xs mb-1 block">{t('git.mergeFrom')}:</label>
                <Select 
                  onValueChange={setSourceBranchToMerge} 
                  value={sourceBranchToMerge}
                >
                  <SelectTrigger id="sourceBranchSelect" className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder={t('git.mergeFrom')} />
                  </SelectTrigger>
                  <SelectContent>
                    {repository.branches
                      .map((branch) => (
                        <SelectItem 
                          key={`source-${branch.name}`} 
                          value={branch.name}
                          className="text-xs sm:text-sm"
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="targetBranchSelect" className="text-[10px] sm:text-xs mb-1 block">{t('git.mergeInto')}:</label>
                <Select 
                  onValueChange={setTargetBranchForMerge} 
                  value={targetBranchForMerge || ""}
                >
                  <SelectTrigger id="targetBranchSelect" className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder={t('git.mergeInto')} />
                  </SelectTrigger>
                  <SelectContent>
                    {repository.branches
                      .map((branch) => (
                        <SelectItem 
                          key={`target-${branch.name}`} 
                          value={branch.name}
                          className="text-xs sm:text-sm"
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleMerge}
              size="sm"
              disabled={!sourceBranchToMerge || !targetBranchForMerge || sourceBranchToMerge === targetBranchForMerge}
              className="w-full bg-git-merge hover:bg-git-merge/80 mt-2 text-xs sm:text-sm h-8 sm:h-10"
            >
              <GitMerge className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              {t('git.mergeBranches')}
            </Button>
            {sourceBranchToMerge === targetBranchForMerge && sourceBranchToMerge && targetBranchForMerge && (
              <p className="text-[10px] sm:text-xs text-red-500">
                {t('messages.sourceSameAsTarget')}
              </p>
            )}
            {sourceBranchToMerge && targetBranchForMerge && sourceBranchToMerge !== targetBranchForMerge && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t('messages.mergedBranch')} "{sourceBranchToMerge}" {t('messages.into')} "{targetBranchForMerge}".
              </p>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Actions Section */}
        <div>
          <h3 className="text-xs sm:text-sm font-medium mb-2">{t('git.actions')}</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-red-100 hover:bg-red-200 text-red-700 w-full text-xs sm:text-sm h-8 sm:h-10"
            >
              <RefreshCcw className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{t('git.resetAll')}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    );
  };

  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-4">
        <CardTitle className="text-sm sm:text-base flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <span>{t('git.controls')}</span>
            <GitGuide />
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-600 text-white rounded">
            <GitBranch className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="font-medium text-xs sm:text-sm">
              {repository.branches.find(b => b.isActive)?.name || "none"}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Label htmlFor="terminal-mode" className={`text-[10px] sm:text-xs hidden sm:inline-block ${useTerminal ? 'text-primary' : 'text-muted-foreground'}`}>
              {t('git.terminal')}
            </Label>
            <Switch
              id="terminal-mode"
              checked={useTerminal}
              onCheckedChange={toggleTerminal}
              className="h-4 w-7 sm:h-5 sm:w-9"
            />
            <Terminal className={`h-3 w-3 sm:h-4 sm:w-4 ${useTerminal ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </CardTitle>
      </CardHeader>
      {renderContent()}
    </Card>
  );
};

export default GitControls;

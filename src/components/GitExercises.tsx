import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  ChevronLeft,
  Lock,
  Trophy,
  GitBranch,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  Terminal,
  GitMerge,
  XCircle,
  RotateCcw,
  Globe,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import useGitStore from "@/store/gitStore";
import {
  loadExerciseProgress,
  saveExerciseProgress,
  type ExerciseProgressMap,
} from "@/hooks/useExerciseProgress";
import { toast } from "sonner";

const EXERCISE_IDS = [
  "feature-branch",
  "team-workflow",
  "technical-tasks",
  "merge-conflicts",
  "undo-changes",
  "remote-workflow",
  "fast-forward-merge",
] as const;

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: ExerciseStep[];
  terminalCommands: string[];
  uiActions: string[];
  isStarted: boolean;
  isCompleted: boolean;
}

interface ExerciseStep {
  id: string;
  description: string;
  hint: string;
  isCompleted: boolean;
  validation: () => boolean;
}

gsap.registerPlugin(useGSAP);

const GitExercises: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    repository,
    workingChanges,
    stagedChanges,
    hasPendingConflict,
  } = useGitStore();

  const [selectedExercise, setSelectedExercise] = useState<string>("feature-branch");
  const [progress, setProgress] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"list" | "detail">("list");
  const [everOpened, setEverOpened] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = () => setSheetOpen(true);
    window.addEventListener('open-challenges', handler);
    return () => window.removeEventListener('open-challenges', handler);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const requestedExercise = searchParams.get("exercise");

    if (!EXERCISE_IDS.includes(requestedExercise as (typeof EXERCISE_IDS)[number])) {
      return;
    }

    setSelectedExercise(requestedExercise!);
    setView("detail");
    setSheetOpen(true);
    searchParams.delete("exercise");

    const nextSearch = searchParams.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, []);

  useEffect(() => {
    if (sheetOpen && !everOpened) {
      setEverOpened(true);
    }
  }, [sheetOpen, everOpened]);
  
  // Definir y actualizar los ejercicios en una función que depende de la traducción
  const getInitialExercises = useCallback((): Record<string, Exercise> => {
    const isCommitAncestor = (ancestorId: string, descendantId: string): boolean => {
      const visited = new Set<string>();
      const queue = [descendantId];
      while (queue.length > 0) {
        const id = queue.shift()!;
        if (id === ancestorId) return true;
        if (visited.has(id)) continue;
        visited.add(id);
        const commit = repository.commits.find((c) => c.id === id);
        if (commit) queue.push(...commit.parentIds);
      }
      return false;
    };

    return {
    "feature-branch": {
      id: "feature-branch",
      title: t("exercises.featureBranch.title", "Feature Branch Workflow"),
      description: t("exercises.featureBranch.description", "Learn how to work with feature branches to develop new functionality without affecting the main codebase."),
      difficulty: "beginner",
      isStarted: false,
      isCompleted: false,
      steps: [
        {
          id: "create-dev",
          description: t("exercises.featureBranch.steps.createDev", "Create a 'dev' branch from 'master'"),
          hint: t("exercises.featureBranch.hints.createDev", "Use 'git branch dev' in terminal mode or use the branch creation UI control"),
          isCompleted: false,
          validation: () => {
            return repository.branches.some(b => b.name === "dev");
          }
        },
        {
          id: "switch-dev",
          description: t("exercises.featureBranch.steps.switchDev", "Switch to the 'dev' branch"),
          hint: t("exercises.featureBranch.hints.switchDev", "Use 'git checkout dev' in terminal mode or use the branch switch dropdown"),
          isCompleted: false,
          validation: () => {
            return repository.branches.some(b => b.name === "dev" && b.isActive);
          }
        },
        {
          id: "create-feature",
          description: t("exercises.featureBranch.steps.createFeature", "Create and switch to a new feature branch called 'feature-login'"),
          hint: t("exercises.featureBranch.hints.createFeature", "Use 'git checkout -b feature-login' in terminal mode or create the branch from UI and then switch to it"),
          isCompleted: false,
          validation: () => {
            const featureBranch = repository.branches.some(b => b.name === "feature-login");
            const isActive = repository.branches.some(b => b.name === "feature-login" && b.isActive);
            return featureBranch && isActive;
          }
        },
        {
          id: "make-changes",
          description: t("exercises.featureBranch.steps.makeChanges", "Modify the code (add a new function or comment)"),
          hint: t("exercises.featureBranch.hints.makeChanges", "Edit the code in the editor to make any change"),
          isCompleted: false,
          validation: () => {
            const activeHead = repository.HEAD;
            const headCommit = repository.commits.find(c => c.id === activeHead);
            if (!headCommit) return false;
            return workingChanges !== headCommit.content;
          }
        },
        {
          id: "commit-changes",
          description: t("exercises.featureBranch.steps.commitChanges", "Stage and commit your changes with a descriptive message"),
          hint: t("exercises.featureBranch.hints.commitChanges", "Use 'git add .' and 'git commit -m \"your message\"' in terminal or use the UI buttons"),
          isCompleted: false,
          validation: () => {
            const branch = repository.branches.find(b => b.name === "feature-login");
            if (!branch) return false;
            const headCommit = repository.commits.find(c => c.id === branch.commitId);
            if (!headCommit) return false;
            // Verifica que el commit tenga padres (no sea el inicial) y esté en feature-login
            return headCommit.parentIds.length > 0;
          }
        },
        {
          id: "merge-to-dev",
          description: t("exercises.featureBranch.steps.mergeToDev", "Switch to 'dev' branch and merge your feature branch"),
          hint: t("exercises.featureBranch.hints.mergeToDev", "First use 'git checkout dev' then 'git merge feature-login', or use the UI controls"),
          isCompleted: false,
          validation: () => {
            const devBranch = repository.branches.find(b => b.name === "dev");
            const feature = repository.branches.find(b => b.name === "feature-login");
            if (!devBranch || !feature) return false;
            const featureHead = repository.commits.find(c => c.id === feature.commitId);
            if (!featureHead || featureHead.parentIds.length === 0) return false;
            // dev now contains feature-login's work — true for both a fast-forward
            // and a merge commit (Git fast-forwards when dev has not diverged).
            return isCommitAncestor(feature.commitId, devBranch.commitId);
          }
        }
      ],
      terminalCommands: [
        t("exercises.featureBranch.commands.createDev", "git branch dev"),
        t("exercises.featureBranch.commands.switchDev", "git checkout dev"),
        t("exercises.featureBranch.commands.createFeature", "git checkout -b feature-login"),
        t("exercises.featureBranch.commands.add", "git add ."),
        t("exercises.featureBranch.commands.commit", "git commit -m \"Add login feature\""),
        t("exercises.featureBranch.commands.checkoutDev", "git checkout dev"),
        t("exercises.featureBranch.commands.merge", "git merge feature-login")
      ],
      uiActions: [
        t("exercises.featureBranch.uiActions.createDev", "Create 'dev' branch"),
        t("exercises.featureBranch.uiActions.switchDev", "Switch to 'dev' branch"),
        t("exercises.featureBranch.uiActions.createFeature", "Create 'feature-login' branch"),
        t("exercises.featureBranch.uiActions.editCode", "Edit code"),
        t("exercises.featureBranch.uiActions.stageChanges", "Stage changes with Git Add"),
        t("exercises.featureBranch.uiActions.commitChanges", "Commit changes"),
        t("exercises.featureBranch.uiActions.switchBackDev", "Switch to 'dev' branch"),
        t("exercises.featureBranch.uiActions.mergeFeature", "Merge 'feature-login' into 'dev'")
      ]
    },
    "team-workflow": {
      id: "team-workflow",
      title: t("exercises.teamWorkflow.title", "Team Collaboration Workflow"),
      description: t("exercises.teamWorkflow.description", "Learn how a team collaborates using branches, pull and merge operations."),
      difficulty: "intermediate",
      isStarted: false,
      isCompleted: false,
      steps: [
        {
          id: "create-structure",
          description: t("exercises.teamWorkflow.steps.createStructure", "Create a structure with 'master', 'dev', and 'release' branches"),
          hint: t("exercises.teamWorkflow.hints.createStructure", "Create each branch from master using 'git branch' or the UI"),
          isCompleted: false,
          validation: () => {
            return repository.branches.some(b => b.name === "dev") && 
                  repository.branches.some(b => b.name === "release");
          }
        },
        {
          id: "create-story",
          description: t("exercises.teamWorkflow.steps.createStory", "Create a story branch called 'story-123' from 'dev'"),
          hint: t("exercises.teamWorkflow.hints.createStory", "First switch to 'dev', then create 'story-123' branch"),
          isCompleted: false,
          validation: () => {
            const devBranch = repository.branches.find(b => b.name === "dev");
            const storyBranch = repository.branches.find(b => b.name === "story-123");
            if (!devBranch || !storyBranch) return false;
            return true;
          }
        },
        {
          id: "implement-story",
          description: t("exercises.teamWorkflow.steps.implementStory", "Make changes on 'story-123' and commit them"),
          hint: t("exercises.teamWorkflow.hints.implementStory", "Switch to 'story-123', make changes, stage and commit them"),
          isCompleted: false,
          validation: () => {
            const storyBranch = repository.branches.find(b => b.name === "story-123");
            if (!storyBranch) return false;
            const headCommit = repository.commits.find(c => c.id === storyBranch.commitId);
            if (!headCommit) return false;
            return headCommit.parentIds.length > 0 && headCommit.message.includes("story");
          }
        },
        {
          id: "merge-to-dev-release",
          description: t("exercises.teamWorkflow.steps.mergeToDev", "Merge 'story-123' into 'dev' and then 'dev' into 'release'"),
          hint: t("exercises.teamWorkflow.hints.mergeToDev", "First merge to 'dev', then merge 'dev' to 'release'"),
          isCompleted: false,
          validation: () => {
            const devBranch = repository.branches.find(b => b.name === "dev");
            const releaseBranch = repository.branches.find(b => b.name === "release");
            const story = repository.branches.find(b => b.name === "story-123");
            if (!devBranch || !releaseBranch || !story) return false;

            const storyHead = repository.commits.find(c => c.id === story.commitId);
            const devHead = repository.commits.find(c => c.id === devBranch.commitId);
            if (!storyHead || storyHead.parentIds.length === 0) return false;
            if (!devHead || devHead.parentIds.length === 0) return false;

            // story-123 integrated into dev, and dev integrated into release
            // (each step is valid whether Git fast-forwarded or made a merge commit).
            return (
              isCommitAncestor(story.commitId, devBranch.commitId) &&
              isCommitAncestor(devBranch.commitId, releaseBranch.commitId)
            );
          }
        },
        {
          id: "prepare-production",
          description: t("exercises.teamWorkflow.steps.prepareProduction", "Merge 'release' into 'master' for production"),
          hint: t("exercises.teamWorkflow.hints.prepareProduction", "Switch to 'master' and merge from 'release'"),
          isCompleted: false,
          validation: () => {
            const masterBranch = repository.branches.find(b => b.name === "master");
            const releaseBranch = repository.branches.find(b => b.name === "release");
            if (!masterBranch || !releaseBranch) return false;
            const releaseHead = repository.commits.find(c => c.id === releaseBranch.commitId);
            if (!releaseHead || releaseHead.parentIds.length === 0) return false;
            // release integrated into master (fast-forward or merge commit).
            return isCommitAncestor(releaseBranch.commitId, masterBranch.commitId);
          }
        }
      ],
      terminalCommands: [
        t("exercises.teamWorkflow.commands.createDev", "git branch dev"),
        t("exercises.teamWorkflow.commands.createRelease", "git branch release"),
        t("exercises.teamWorkflow.commands.checkoutDev", "git checkout dev"),
        t("exercises.teamWorkflow.commands.createStory", "git checkout -b story-123"),
        t("exercises.teamWorkflow.commands.add", "git add ."),
        t("exercises.teamWorkflow.commands.commit", "git commit -m \"Implement story-123 feature\""),
        t("exercises.teamWorkflow.commands.checkoutDev2", "git checkout dev"),
        t("exercises.teamWorkflow.commands.mergeStory", "git merge story-123"),
        t("exercises.teamWorkflow.commands.checkoutRelease", "git checkout release"),
        t("exercises.teamWorkflow.commands.mergeDev", "git merge dev"),
        t("exercises.teamWorkflow.commands.checkoutMaster", "git checkout master"),
        t("exercises.teamWorkflow.commands.mergeRelease", "git merge release")
      ],
      uiActions: [
        t("exercises.teamWorkflow.uiActions.createBranches", "Create 'dev' and 'release' branches"),
        t("exercises.teamWorkflow.uiActions.switchDev", "Switch to 'dev' branch"),
        t("exercises.teamWorkflow.uiActions.createStory", "Create 'story-123' branch"),
        t("exercises.teamWorkflow.uiActions.makeChanges", "Make changes to code"),
        t("exercises.teamWorkflow.uiActions.stageAndCommit", "Stage and commit changes"),
        t("exercises.teamWorkflow.uiActions.mergeBranches", "Merge branches in sequence")
      ]
    },
    "technical-tasks": {
      id: "technical-tasks",
      title: t("exercises.technicalTasks.title", "Technical Tasks Workflow"),
      description: t("exercises.technicalTasks.description", "Learn how to break down a story into technical tasks and work on them in parallel."),
      difficulty: "advanced",
      isStarted: false,
      isCompleted: false,
      steps: [
        {
          id: "setup-project",
          description: t("exercises.technicalTasks.steps.setupProject", "Create 'master', 'dev', and 'story-456' branches"),
          hint: t("exercises.technicalTasks.hints.setupProject", "Create the branch structure for the project"),
          isCompleted: false,
          validation: () => {
            return repository.branches.some(b => b.name === "dev") && 
                  repository.branches.some(b => b.name === "story-456");
          }
        },
        {
          id: "create-tasks",
          description: t("exercises.technicalTasks.steps.createTasks", "Create two technical task branches: 'task-1' and 'task-2' from 'story-456'"),
          hint: t("exercises.technicalTasks.hints.createTasks", "Switch to 'story-456' and create two branches from it"),
          isCompleted: false,
          validation: () => {
            return repository.branches.some(b => b.name === "task-1") && 
                  repository.branches.some(b => b.name === "task-2");
          }
        },
        {
          id: "implement-task1",
          description: t("exercises.technicalTasks.steps.implementTask1", "Implement 'task-1' with changes and commit"),
          hint: t("exercises.technicalTasks.hints.implementTask1", "Switch to 'task-1', make changes and commit"),
          isCompleted: false,
          validation: () => {
            const taskBranch = repository.branches.find(b => b.name === "task-1");
            if (!taskBranch) return false;
            const headCommit = repository.commits.find(c => c.id === taskBranch.commitId);
            if (!headCommit) return false;
            return headCommit.parentIds.length > 0;
          }
        },
        {
          id: "implement-task2",
          description: t("exercises.technicalTasks.steps.implementTask2", "Implement 'task-2' with different changes and commit"),
          hint: t("exercises.technicalTasks.hints.implementTask2", "Switch to 'task-2', make changes and commit"),
          isCompleted: false,
          validation: () => {
            const taskBranch = repository.branches.find(b => b.name === "task-2");
            if (!taskBranch) return false;
            const headCommit = repository.commits.find(c => c.id === taskBranch.commitId);
            if (!headCommit) return false;
            return headCommit.parentIds.length > 0;
          }
        },
        {
          id: "integrate-tasks",
          description: t("exercises.technicalTasks.steps.integrateTasks", "Merge both tasks into 'story-456'"),
          hint: t("exercises.technicalTasks.hints.integrateTasks", "Switch to 'story-456' and merge both task branches"),
          isCompleted: false,
          validation: () => {
            const storyBranch = repository.branches.find((b) => b.name === "story-456");
            const task1 = repository.branches.find((b) => b.name === "task-1");
            const task2 = repository.branches.find((b) => b.name === "task-2");
            if (!storyBranch || !task1 || !task2) return false;
            const storyHead = storyBranch.commitId;
            return (
              isCommitAncestor(task1.commitId, storyHead) &&
              isCommitAncestor(task2.commitId, storyHead)
            );
          }
        },
        {
          id: "complete-workflow",
          description: t("exercises.technicalTasks.steps.completeWorkflow", "Deliver the story by merging through 'dev' to 'master'"),
          hint: t("exercises.technicalTasks.hints.completeWorkflow", "Merge 'story-456' to 'dev', then 'dev' to 'master'"),
          isCompleted: false,
          validation: () => {
            const devBranch = repository.branches.find(b => b.name === "dev");
            const masterBranch = repository.branches.find(b => b.name === "master");
            if (!devBranch || !masterBranch) return false;
            
            const devCommit = repository.commits.find(c => c.id === devBranch.commitId);
            const masterCommit = repository.commits.find(c => c.id === masterBranch.commitId);
            if (!devCommit || !masterCommit) return false;
            
            // Check if there are merge commits in the path
            return devCommit.parentIds.length > 1 && masterCommit.parentIds.length > 1;
          }
        }
      ],
      terminalCommands: [
        t("exercises.technicalTasks.commands.createDev", "git branch dev"),
        t("exercises.technicalTasks.commands.createStory", "git checkout -b story-456"),
        t("exercises.technicalTasks.commands.createTask1", "git checkout -b task-1"),
        t("exercises.technicalTasks.commands.add", "git add ."),
        t("exercises.technicalTasks.commands.commitTask1", "git commit -m \"Implement task-1\""),
        t("exercises.technicalTasks.commands.checkoutStory", "git checkout story-456"),
        t("exercises.technicalTasks.commands.createTask2", "git checkout -b task-2"),
        t("exercises.technicalTasks.commands.addTask2", "git add ."),
        t("exercises.technicalTasks.commands.commitTask2", "git commit -m \"Implement task-2\""),
        t("exercises.technicalTasks.commands.checkoutStory2", "git checkout story-456"),
        t("exercises.technicalTasks.commands.mergeTask1", "git merge task-1"),
        t("exercises.technicalTasks.commands.mergeTask2", "git merge task-2"),
        t("exercises.technicalTasks.commands.checkoutDev", "git checkout dev"),
        t("exercises.technicalTasks.commands.mergeStory", "git merge story-456"),
        t("exercises.technicalTasks.commands.checkoutMaster", "git checkout master"),
        t("exercises.technicalTasks.commands.mergeDev", "git merge dev")
      ],
      uiActions: [
        t("exercises.technicalTasks.uiActions.createStructure", "Create branch structure"),
        t("exercises.technicalTasks.uiActions.createTasks", "Create task branches"),
        t("exercises.technicalTasks.uiActions.implementTasks", "Implement and commit tasks separately"),
        t("exercises.technicalTasks.uiActions.mergeTasks", "Merge tasks into story"),
        t("exercises.technicalTasks.uiActions.completeWorkflow", "Complete delivery workflow")
      ]
    },
    "merge-conflicts": {
      id: "merge-conflicts",
      title: t("exercises.mergeConflicts.title", "Resolving Merge Conflicts"),
      description: t("exercises.mergeConflicts.description", "Learn how to identify and resolve merge conflicts that occur when merging branches with conflicting changes."),
      difficulty: "advanced",
      isStarted: false,
      isCompleted: false,
      steps: [
        {
          id: "create-feature-branch",
          description: t("exercises.mergeConflicts.steps.createFeature", "Create branch 'feature-conflict', change the code, and commit"),
          hint: t("exercises.mergeConflicts.hints.createFeature", "git checkout -b feature-conflict, edit, git add ., git commit"),
          isCompleted: false,
          validation: () => {
            const branch = repository.branches.find((b) => b.name === "feature-conflict");
            if (!branch) return false;
            const head = repository.commits.find((c) => c.id === branch.commitId);
            return !!head && head.parentIds.length > 0;
          },
        },
        {
          id: "diverge-master",
          description: t("exercises.mergeConflicts.steps.divergeMaster", "Checkout master and commit a different change on the same area"),
          hint: t("exercises.mergeConflicts.hints.divergeMaster", "git checkout master, edit the file differently, commit"),
          isCompleted: false,
          validation: () => {
            const master = repository.branches.find((b) => b.name === "master");
            const feature = repository.branches.find((b) => b.name === "feature-conflict");
            if (!master || !feature) return false;
            return master.commitId !== feature.commitId;
          },
        },
        {
          id: "trigger-conflict",
          description: t("exercises.mergeConflicts.steps.triggerConflict", "Merge 'feature-conflict' into master to trigger a conflict"),
          hint: t("exercises.mergeConflicts.hints.triggerConflict", "git merge feature-conflict while on master"),
          isCompleted: false,
          validation: () => hasPendingConflict(),
        },
        {
          id: "resolve-conflict",
          description: t("exercises.mergeConflicts.steps.resolveConflict", "Resolve the conflict in the Conflict Resolver panel and finish the merge"),
          hint: t("exercises.mergeConflicts.hints.resolveConflict", "Use the resolver below the graph, then stage and commit"),
          isCompleted: false,
          validation: () => {
            if (hasPendingConflict()) return false;
            const master = repository.branches.find((b) => b.name === "master");
            if (!master) return false;
            const head = repository.commits.find((c) => c.id === master.commitId);
            return !!head && head.parentIds.length > 1;
          },
        },
      ],
      terminalCommands: [
        t("exercises.mergeConflicts.commands.createBranch", "git checkout -b feature-conflict"),
        t("exercises.mergeConflicts.commands.add", "git add ."),
        t("exercises.mergeConflicts.commands.commit", "git commit -m \"Feature change\""),
        t("exercises.mergeConflicts.commands.checkoutMaster", "git checkout master"),
        t("exercises.mergeConflicts.commands.merge", "git merge feature-conflict"),
      ],
      uiActions: [
        t("exercises.mergeConflicts.uiActions.createBranches", "Create diverging branches with commits"),
        t("exercises.mergeConflicts.uiActions.triggerMerge", "Merge to trigger a conflict"),
        t("exercises.mergeConflicts.uiActions.resolve", "Resolve using the Conflict Resolver panel"),
      ],
    },
    "undo-changes": {
      id: "undo-changes",
      title: t("exercises.undoChanges.title", "Undoing Changes"),
      description: t("exercises.undoChanges.description", "Practice git commit --amend, git reset, and git revert safely."),
      difficulty: "intermediate",
      isStarted: false,
      isCompleted: false,
      steps: [
        {
          id: "commit-and-amend",
          description: t("exercises.undoChanges.steps.amend", "Commit a change, then amend the message to include '(amended)'"),
          hint: t("exercises.undoChanges.hints.amend", "git commit -m \"WIP\", then git commit --amend -m \"WIP (amended)\""),
          isCompleted: false,
          validation: () =>
            repository.commits.some((c) => c.message.includes("(amended)")),
        },
        {
          id: "reset-hard",
          description: t("exercises.undoChanges.steps.reset", "Make another commit, then git reset --hard HEAD~1"),
          hint: t("exercises.undoChanges.hints.reset", "git reset --hard HEAD~1 removes the last commit from the branch"),
          isCompleted: false,
          validation: () => {
            const master = repository.branches.find((b) => b.name === "master");
            if (!master) return false;
            // `reset --hard HEAD~1` drops the last commit: it stays in the commit
            // list but becomes unreachable from master. Detect that dangling commit.
            return repository.commits.some(
              (c) => !isCommitAncestor(c.id, master.commitId)
            );
          },
        },
        {
          id: "revert-commit",
          description: t("exercises.undoChanges.steps.revert", "Commit again, then git revert HEAD to undo it with a new commit"),
          hint: t("exercises.undoChanges.hints.revert", "git revert HEAD creates a safe undo commit"),
          isCompleted: false,
          validation: () =>
            repository.commits.some((c) => c.message.startsWith('Revert "')),
        },
      ],
      terminalCommands: [
        t("exercises.undoChanges.commands.commit", "git commit -m \"WIP\""),
        t("exercises.undoChanges.commands.amend", "git commit --amend -m \"WIP (amended)\""),
        t("exercises.undoChanges.commands.reset", "git reset --hard HEAD~1"),
        t("exercises.undoChanges.commands.revert", "git revert HEAD"),
      ],
      uiActions: [
        t("exercises.undoChanges.uiActions.amend", "Amend the last commit message"),
        t("exercises.undoChanges.uiActions.reset", "Hard reset to drop the last commit"),
        t("exercises.undoChanges.uiActions.revert", "Revert with a new commit"),
      ],
    },
    "remote-workflow": {
      id: "remote-workflow",
      title: t("exercises.remoteWorkflow.title", "Working with Remotes"),
      description: t("exercises.remoteWorkflow.description", "Practice git fetch, push, and pull with origin/master references on the graph."),
      difficulty: "intermediate",
      isStarted: false,
      isCompleted: false,
      steps: [
        {
          id: "fetch-remote",
          description: t("exercises.remoteWorkflow.steps.fetch", "Run git fetch to load origin/* references"),
          hint: t("exercises.remoteWorkflow.hints.fetch", "git fetch or use the Fetch button in Git Controls"),
          isCompleted: false,
          validation: () => repository.remoteReferences.length > 0,
        },
        {
          id: "push-master",
          description: t("exercises.remoteWorkflow.steps.push", "Commit on master and git push to update origin/master"),
          hint: t("exercises.remoteWorkflow.hints.push", "git push publishes your local master to origin/master"),
          isCompleted: false,
          validation: () => {
            const master = repository.branches.find((b) => b.name === "master");
            const remote = repository.remoteReferences.find((r) => r.name === "origin/master");
            return !!(master && remote && master.commitId === remote.commitId);
          },
        },
        {
          id: "pull-merge",
          description: t("exercises.remoteWorkflow.steps.pull", "After fetch brings new remote commits, git pull to merge origin/master"),
          hint: t("exercises.remoteWorkflow.hints.pull", "git pull merges remote changes into your current branch"),
          isCompleted: false,
          validation: () => {
            const master = repository.branches.find((b) => b.name === "master");
            const remote = repository.remoteReferences.find((r) => r.name === "origin/master");
            if (!master || !remote) return false;
            const head = repository.commits.find((c) => c.id === master.commitId);
            if (!head) return false;
            // Pull integrates origin/master either by fast-forward (master now points
            // at the fetched remote commit) or by a merge commit referencing it.
            return master.commitId === remote.commitId
              ? head.message.includes("Remote update")
              : head.parentIds.length > 1 && head.message.includes("origin/master");
          },
        },
      ],
      terminalCommands: [
        t("exercises.remoteWorkflow.commands.fetch", "git fetch"),
        t("exercises.remoteWorkflow.commands.push", "git push"),
        t("exercises.remoteWorkflow.commands.pull", "git pull"),
      ],
      uiActions: [
        t("exercises.remoteWorkflow.uiActions.fetch", "Fetch remote references"),
        t("exercises.remoteWorkflow.uiActions.push", "Push local commits"),
        t("exercises.remoteWorkflow.uiActions.pull", "Pull and merge remote changes"),
      ],
    },
    "fast-forward-merge": {
      id: "fast-forward-merge",
      title: t("exercises.fastForwardMerge.title", "Fast-forward vs Merge Commit"),
      description: t("exercises.fastForwardMerge.description", "See when Git fast-forwards and when --no-ff creates a merge commit."),
      difficulty: "intermediate",
      isStarted: false,
      isCompleted: false,
      steps: [
        {
          id: "ff-merge",
          description: t("exercises.fastForwardMerge.steps.ff", "Create 'feature-ff', commit, checkout master, and merge (fast-forward)"),
          hint: t("exercises.fastForwardMerge.hints.ff", "When master has not diverged, merge moves the pointer forward"),
          isCompleted: false,
          validation: () => {
            const feature = repository.branches.find((b) => b.name === "feature-ff");
            const master = repository.branches.find((b) => b.name === "master");
            if (!feature || !master) return false;
            const masterHead = repository.commits.find((c) => c.id === master.commitId);
            return (
              master.commitId === feature.commitId &&
              !!masterHead &&
              masterHead.parentIds.length === 1
            );
          },
        },
        {
          id: "diverge-branches",
          description: t("exercises.fastForwardMerge.steps.diverge", "Create 'feature-merge', commit on it and on master so histories diverge"),
          hint: t("exercises.fastForwardMerge.hints.diverge", "Both branches need their own commits after the common base"),
          isCompleted: false,
          validation: () => {
            const feature = repository.branches.find((b) => b.name === "feature-merge");
            const master = repository.branches.find((b) => b.name === "master");
            if (!feature || !master) return false;
            return feature.commitId !== master.commitId;
          },
        },
        {
          id: "no-ff-merge",
          description: t("exercises.fastForwardMerge.steps.noFf", "Merge feature-merge into master with --no-ff"),
          hint: t("exercises.fastForwardMerge.hints.noFf", "git merge --no-ff feature-merge forces a merge commit"),
          isCompleted: false,
          validation: () => {
            const master = repository.branches.find((b) => b.name === "master");
            if (!master) return false;
            const head = repository.commits.find((c) => c.id === master.commitId);
            return !!head && head.parentIds.length > 1;
          },
        },
      ],
      terminalCommands: [
        t("exercises.fastForwardMerge.commands.createFf", "git checkout -b feature-ff"),
        t("exercises.fastForwardMerge.commands.mergeFf", "git merge feature-ff"),
        t("exercises.fastForwardMerge.commands.createMerge", "git checkout -b feature-merge"),
        t("exercises.fastForwardMerge.commands.mergeNoFf", "git merge --no-ff feature-merge"),
      ],
      uiActions: [
        t("exercises.fastForwardMerge.uiActions.ff", "Observe a fast-forward on the graph"),
        t("exercises.fastForwardMerge.uiActions.noFf", "Force a merge commit with --no-ff"),
      ],
    },
  };
  }, [t, repository.HEAD, repository.branches, repository.commits, repository.remoteReferences, workingChanges, hasPendingConflict]);
  
  // Inicializar los ejercicios
  const [exercises, setExercises] = useState<Record<string, Exercise>>(getInitialExercises());

  useEffect(() => {
    const saved = loadExerciseProgress();
    if (Object.keys(saved).length === 0) return;

    setExercises((prev) => {
      const next = { ...prev };
      for (const [id, entry] of Object.entries(saved)) {
        const exercise = next[id];
        if (!exercise) continue;
        next[id] = {
          ...exercise,
          isStarted: entry.isStarted,
          isCompleted: entry.isCompleted,
          steps: exercise.steps.map((step) => ({
            ...step,
            isCompleted: entry.completedStepIds.includes(step.id),
          })),
        };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const progressMap: ExerciseProgressMap = {};
    for (const [id, exercise] of Object.entries(exercises)) {
      progressMap[id] = {
        isStarted: exercise.isStarted,
        isCompleted: exercise.isCompleted,
        completedStepIds: exercise.steps.filter((step) => step.isCompleted).map((step) => step.id),
      };
    }
    saveExerciseProgress(progressMap);
  }, [exercises]);
  
  // Efecto para actualizar los ejercicios cuando cambie el idioma
  useEffect(() => {
    // Para diagnóstico
    console.log('Idioma cambiado a:', i18n.language);
    
    // Obtener ejercicios con textos traducidos actualizados
    const updatedExercises = getInitialExercises();
    
    // Verificar si hay cambios reales antes de actualizar el estado
    const hasChanges = Object.keys(updatedExercises).some(key => {
      const updatedExercise = updatedExercises[key];
      const currentExercise = exercises[key];
      if (!updatedExercise || !currentExercise) return true;
      
      // Verificar si hay diferencias en los textos traducidos
      const exerciseChanged = 
        updatedExercise.title !== currentExercise.title ||
        updatedExercise.description !== currentExercise.description ||
        updatedExercise.steps.some((step, index) => 
          step.description !== currentExercise.steps[index]?.description ||
          step.hint !== currentExercise.steps[index]?.hint
        );
      
      return exerciseChanged;
    });
    
    if (hasChanges) {
      // Crear una copia actualizada que preserve el estado pero use los nuevos textos
      const newExercisesState = {...updatedExercises};
      
      // Para cada ejercicio, preservamos su estado pero actualizamos sus textos
      Object.keys(updatedExercises).forEach(key => {
        const updatedExercise = updatedExercises[key];
        const currentExercise = exercises[key];
        if (updatedExercise && currentExercise) {
          // Conservar estado (isStarted, isCompleted)
          newExercisesState[key] = {
            ...updatedExercise, // Nuevos textos traducidos
            isStarted: currentExercise.isStarted,
            isCompleted: currentExercise.isCompleted,
          };
          
          // Conservar el estado de completado de cada paso, pero usar textos actualizados
          if (updatedExercise.steps.length === currentExercise.steps.length) {
            newExercisesState[key].steps = updatedExercise.steps.map((step, index) => ({
              ...step, // Nuevos textos traducidos para el paso
              isCompleted: currentExercise.steps[index]?.isCompleted || false
            }));
          }
        }
      });
      
      // Actualizar el estado solo si hay cambios reales
      setExercises(newExercisesState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, getInitialExercises]); // Eliminamos exercises de las dependencias  
  
  // Efecto para actualizar la visualización cuando cambia el ejercicio seleccionado
  useEffect(() => {
    // Obtener la versión actualizada del ejercicio seleccionado
    const updatedExercises = getInitialExercises();
    const selectedExerciseData = updatedExercises[selectedExercise];
    
    if (selectedExerciseData) {
      // Actualizar solo el ejercicio seleccionado para asegurar textos actualizados
      setExercises(prev => {
        const updated = {...prev};
        const currentExercise = prev[selectedExercise];
        
        // Si el ejercicio ya existe en el estado, preservamos su estado pero actualizamos textos
        if (currentExercise) {
          updated[selectedExercise] = {
            ...selectedExerciseData, // Usar los textos actualizados
            isStarted: currentExercise.isStarted,
            isCompleted: currentExercise.isCompleted,
          };
          
          // Conservar estado de completado de los pasos 
          if (selectedExerciseData.steps.length === currentExercise.steps.length) {
            updated[selectedExercise].steps = selectedExerciseData.steps.map((step, index) => ({
              ...step, // Usar textos actualizados
              isCompleted: currentExercise.steps[index]?.isCompleted || false
            }));
          }
        }
        
        return updated;
      });
    }
    
    // Forzar actualización cuando cambia la pestaña seleccionada
    setForceUpdate(prev => prev + 1);
  }, [selectedExercise, getInitialExercises]);
  
  // Método para iniciar un ejercicio
  const startExercise = () => {
    // Obtener la versión actualizada de los ejercicios con las traducciones actuales
    const updatedExercises = getInitialExercises();
    
    // Guardar la información actualizada con los nuevos textos traducidos
    setExercises(prev => {
      const translatedExercise = updatedExercises[selectedExercise];
      if (!translatedExercise) {
        return prev;
      }
      const updated = {...prev};
      
      // Actualizamos el ejercicio seleccionado con los textos traducidos más las propiedades de estado
      updated[selectedExercise] = {
        ...translatedExercise, // Usar los nuevos textos traducidos
        isStarted: true,
        isCompleted: false
      };
      
      return updated;
    });
    
    // Reseteamos los pasos completados al iniciar
    setProgress(0);
  };
  
  // Método para marcar un ejercicio como completado
  const completeExercise = () => {
    setExercises(prev => {
      const currentExercise = prev[selectedExercise];
      if (!currentExercise) {
        return prev;
      }
      return {
        ...prev,
        [selectedExercise]: {
          ...currentExercise,
          isCompleted: true
        }
      };
    });
    
    toast.success(t("exercises.exerciseCompleted", "¡Ejercicio completado manualmente!"), {
      duration: 3000
    });
  };
  
  // Método para forzar una actualización de la validación
  // Check and update exercise completion status
  useEffect(() => {
    const exercise = exercises[selectedExercise];
    if (!exercise || !exercise.isStarted) return;
    
    // Calculate progress
    let completedSteps = 0;
    const prevCompletedSteps = exercise.steps.filter(step => step.isCompleted).length;
    
    const updatedSteps = exercise.steps.map(step => {
      const wasCompleted = step.isCompleted;
      const isNowCompleted = step.validation();
      
      // Si un paso se completó en esta actualización, mostrar una notificación
      if (!wasCompleted && isNowCompleted) {
        toast.success(`¡Paso completado: ${step.description}!`, {
          duration: 3000,
          position: 'bottom-center'
        });
        requestAnimationFrame(() => {
          gsap.fromTo(
            `[data-step-check="${selectedExercise}-${step.id}"]`,
            { scale: 0, autoAlpha: 0.2 },
            { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" }
          );
        });
      }
      
      if (isNowCompleted) completedSteps++;
      return { ...step, isCompleted: isNowCompleted };
    });
    
    // Update progress percentage
    const progressPercentage = Math.round((completedSteps / exercise.steps.length) * 100);
    setProgress(progressPercentage);
    
    // Debug log para rastrear el progreso
    console.log(`Exercise: ${selectedExercise}, Completed: ${completedSteps}/${exercise.steps.length}, Progress: ${progressPercentage}%`);
    console.log('Completed steps:', updatedSteps.filter(s => s.isCompleted).map(s => s.id));
    
    // Update steps completion status
    setExercises(prev => {
      const currentExercise = prev[selectedExercise];
      if (!currentExercise) {
        return prev;
      }
      return {
        ...prev,
        [selectedExercise]: {
          ...currentExercise,
          steps: updatedSteps
        }
      };
    });
    
    // Check if all steps are completed (solo mostrar mensaje si es un cambio nuevo)
    if (completedSteps === exercise.steps.length && completedSteps > prevCompletedSteps && progressPercentage === 100) {
      toast.success(t("exercises.exerciseFullyCompleted", "¡Todos los pasos completados! 🎉"), {
        duration: 5000,
        position: 'top-center'
      });
      
      // Marcar como completado automáticamente
      setExercises(prev => {
        const currentExercise = prev[selectedExercise];
        if (!currentExercise) {
          return prev;
        }
        return {
          ...prev,
          [selectedExercise]: {
            ...currentExercise,
            isCompleted: true
          }
        };
      });
    }
  }, [repository, workingChanges, stagedChanges, selectedExercise, exercises, t, forceUpdate, setExercises, setProgress]);
  
  const resetExercise = () => {
    // Obtener la versión actualizada de los ejercicios con las traducciones actuales
    const updatedExercises = getInitialExercises();
    const exercise = updatedExercises[selectedExercise];
    
    if (!exercise) return;
    
    // Reset steps completion status manteniendo los textos traducidos actualizados
    const resetSteps = exercise.steps.map(step => ({
      ...step,
      isCompleted: false
    }));
    
    setExercises(prev => {
      const updated = {...prev};
      
      // Actualizar el ejercicio seleccionado con los textos traducidos actualizados
      updated[selectedExercise] = {
        ...exercise,
        steps: resetSteps,
        isCompleted: false,
        isStarted: prev[selectedExercise]?.isStarted || false
      };
      
      return updated;
    });
    
    setProgress(0);
  };
  
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Beginner</Badge>;
      case "intermediate":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Intermediate</Badge>;
      case "advanced":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Advanced</Badge>;
      default:
        return null;
    }
  };
  
  const totalExercises = Object.keys(exercises).length;
  const completedCount = Object.values(exercises).filter((e) => e.isCompleted).length;
  const challengeProgress = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
  const selectedExerciseData = exercises[selectedExercise];

  const exerciseMeta: Record<string, { icon: typeof GitBranch; accent: string }> = {
    "feature-branch": { icon: GitBranch, accent: "from-amber-500 via-orange-500 to-rose-500" },
    "team-workflow": { icon: Users, accent: "from-sky-500 via-cyan-500 to-blue-600" },
    "technical-tasks": { icon: Terminal, accent: "from-violet-500 via-fuchsia-500 to-purple-600" },
    "merge-conflicts": { icon: GitMerge, accent: "from-rose-500 via-red-500 to-orange-600" },
    "undo-changes": { icon: RotateCcw, accent: "from-emerald-500 via-teal-500 to-cyan-600" },
    "remote-workflow": { icon: Globe, accent: "from-indigo-500 via-blue-500 to-sky-600" },
    "fast-forward-merge": { icon: Zap, accent: "from-yellow-500 via-amber-500 to-orange-600" },
  };

  const selectChallenge = (id: string) => {
    setSelectedExercise(id);
    setView("detail");
  };

  const openNextChallenge = () => {
    const ids = Object.keys(exercises);
    const currentIndex = ids.indexOf(selectedExercise);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % ids.length : 0;
    setSelectedExercise(ids[nextIndex] || "feature-branch");
  };

  useGSAP(
    () => {
      if (!fabRef.current || sheetOpen || everOpened) {
        return;
      }

      const tween = gsap.to(fabRef.current, {
        scale: 1.08,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      return () => tween.kill();
    },
    { dependencies: [sheetOpen, everOpened] }
  );

  useGSAP(
    () => {
      const activeStep = document.querySelector<HTMLElement>(
        `[data-step-index="${selectedExercise}-${selectedExerciseData?.steps.findIndex((step) => !step.isCompleted) ?? -1}"] [data-step-bullet]`
      );
      if (!activeStep || !selectedExerciseData || !selectedExerciseData.isStarted || selectedExerciseData.isCompleted) {
        return;
      }

      const tween = gsap.to(activeStep, {
        scale: 1.015,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      return () => tween.kill();
    },
    {
      dependencies: [
        selectedExercise,
        selectedExerciseData?.isStarted,
        selectedExerciseData?.isCompleted,
        selectedExerciseData?.steps,
        view,
      ],
    }
  );

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          ref={fabRef}
          variant="default"
          className="gap-1.5 sm:gap-2 fixed bottom-4 right-4 rounded-full pl-2 sm:pl-3 md:pl-4 pr-3 sm:pr-4 md:pr-5 py-1 sm:py-1.5 md:py-2 h-auto z-50 
            bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl ring-2 ring-amber-300/50 hover:scale-105 transition-transform duration-200"
        >
          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <span className="text-[10px] sm:text-xs md:text-sm">{t("exercises.challenges", "Challenges")}</span>
          <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[9px] bg-white/20 text-white border-0 font-semibold">
            {completedCount}/{totalExercises}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={`w-full p-0 overflow-y-auto transition-all duration-300 ease-in-out ${
          view === "list" ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4 border-b sticky top-0 bg-background z-10">
          <div className="w-full">
            <div className="flex items-center gap-2">
              {view === "detail" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setView("list")}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("common.back", "Back")}
                </Button>
              ) : null}
              <SheetTitle className="text-sm sm:text-base md:text-xl font-semibold flex items-center gap-1 sm:gap-2 mb-1 sm:mb-0">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                {t("exercises.title", "Git Exercises")}
              </SheetTitle>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={challengeProgress} className="h-1.5 flex-1" />
              <span className="text-xs font-semibold text-muted-foreground">
                {completedCount}/{totalExercises}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <SheetDescription className="hidden sm:block text-[10px] sm:text-xs md:text-sm max-w-[200px] md:max-w-none">
              {t("exercises.description", "Complete these exercises to learn Git branching and team workflows")}
            </SheetDescription>
            <SheetClose asChild>
              <Button 
                size="sm" 
                variant="ghost"
                className="rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0"
              >
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
            </SheetClose>
          </div>
        </div>
        
        <div className="p-0">
          {view === "list" ? (
            <div className="p-3 sm:p-6 space-y-3">
              <SheetDescription className="text-xs sm:text-sm text-muted-foreground">
                {t("exercises.description", "Complete these exercises to learn Git branching and team workflows")}
              </SheetDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(exercises).map(([id, exercise]) => {
                  const meta = exerciseMeta[id];
                  const Icon = meta?.icon || Trophy;
                  const stepDone = exercise.steps.filter((step) => step.isCompleted).length;
                  const isInProgress = exercise.isStarted && !exercise.isCompleted;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectChallenge(id)}
                      className="text-left group rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta?.accent || "from-slate-500 to-slate-700"} text-white shadow-md`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">{exercise.title}</p>
                            {renderDifficultyBadge(exercise.difficulty)}
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{exercise.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-[11px]">
                            {exercise.isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {t("exercises.completed", "Completado")}
                              </span>
                            ) : isInProgress ? (
                              <>
                                <Progress value={(stepDone / Math.max(exercise.steps.length, 1)) * 100} className="h-1.5 w-20" />
                                <span className="text-muted-foreground">{stepDone}/{exercise.steps.length}</span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Lock className="h-3.5 w-3.5" />
                                {t("exercises.start", "Start")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : selectedExerciseData ? (
            <div className="p-3 sm:p-6 pt-0">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base sm:text-lg font-semibold">
                      {selectedExerciseData.title}
                    </CardTitle>
                    {renderDifficultyBadge(selectedExerciseData.difficulty)}
                  </div>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {selectedExerciseData.description}
                  </CardDescription>
                </CardHeader>
                
                {!selectedExerciseData.isStarted ? (
                    <CardContent className="flex flex-col items-center justify-center py-4 sm:py-8 space-y-3 sm:space-y-4 p-3 sm:p-6">
                      <div className="text-center space-y-1 sm:space-y-2 mb-1 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-medium">{t("exercises.readyToStart", "¿Listo para empezar?")}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t("exercises.startExplanation", "Al iniciar el ejercicio, se rastreará tu progreso en cada paso hasta que lo completes.")}
                        </p>
                      </div>
                      <Button 
                        onClick={startExercise}
                        className="px-4 sm:px-8 text-xs sm:text-sm h-8 sm:h-10"
                        size="auto"
                      >
                        {t("exercises.start", "Iniciar Ejercicio")}
                      </Button>
                    </CardContent>
                  ) : selectedExerciseData.isCompleted ? (
                    <CardContent className="flex flex-col items-center justify-center py-4 sm:py-8 space-y-3 sm:space-y-4 p-3 sm:p-6">
                      <div className="text-center space-y-1 sm:space-y-2 mb-1 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-medium text-green-600">{t("exercises.exerciseFinished", "¡Ejercicio Completado!")}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t("exercises.finishedExplanation", "Has completado este ejercicio. Puedes reiniciarlo o continuar con otro.")}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:gap-4">
                        <Button 
                          onClick={resetExercise}
                          variant="outline"
                          size="auto"
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        >
                          {t("exercises.startAgain", "Comenzar de nuevo")}
                        </Button>
                        <Button 
                          onClick={openNextChallenge}
                          variant="default"
                          size="auto"
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        >
                          {t("exercises.nextExercise", "Siguiente ejercicio")}
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                      {/* Steps list */}
                      <div className="space-y-2 sm:space-y-3">
                        <h3 className="font-medium flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {t("exercises.steps", "Steps to complete")}
                          </div>
                        </h3>
                        
                        <ol className="space-y-1 sm:space-y-1.5 md:space-y-2">
                          {selectedExerciseData.steps.map((step, index) => {
                            const activeIndex = selectedExerciseData.steps.findIndex((s) => !s.isCompleted);
                            const isActive = !step.isCompleted && index === activeIndex;
                            return (
                            <li
                              key={step.id}
                              data-step-index={`${selectedExercise}-${index}`}
                              className={`flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded ${step.isCompleted ? 'bg-green-50 border border-green-100' : isActive ? 'bg-blue-50 border border-blue-200 ring-1 ring-blue-200' : 'bg-muted/50'}`}
                            >
                              <div data-step-bullet className={`flex-shrink-0 mt-0.5 rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex items-center justify-center ${step.isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {step.isCompleted ? <CheckCircle2 data-step-check={`${selectedExercise}-${step.id}`} className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" /> : (index + 1)}
                              </div>
                              <div className="flex-1 space-y-0.5 sm:space-y-1">
                                <p className={`text-[10px] xs:text-xs sm:text-sm ${step.isCompleted ? 'text-green-700 font-medium' : 'font-medium'}`}>
                                  {step.description}
                                </p>
                                {!step.isCompleted && (
                                  <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                                    💡 {step.hint}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                          })}
                        </ol>
                      </div>
                      
                      <Separator />
                      
                      {/* Commands reference */}
                      <div className="space-y-2 sm:space-y-3">
                        <h3 className="font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {t("exercises.reference", "Command Reference")}
                        </h3>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <h4 className="text-[9px] xs:text-[10px] sm:text-xs font-medium flex items-center gap-1">
                            <Terminal className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                            {t("exercises.terminalCommands", "Terminal Commands")}
                          </h4>
                          <div className="bg-zinc-950 rounded-md p-1.5 sm:p-2 md:p-3 overflow-x-auto">
                            <ul className="space-y-0.5 sm:space-y-1">
                              {selectedExerciseData.terminalCommands.map((cmd, i) => (
                                <li key={i} className="text-[8px] xs:text-[9px] sm:text-xs text-green-400 font-mono">$ {cmd}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <h4 className="text-[9px] xs:text-[10px] sm:text-xs font-medium flex items-center gap-1">
                            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                            {t("exercises.uiActions", "UI Actions")}
                          </h4>
                          <ul className="space-y-0.5 sm:space-y-1 text-[8px] xs:text-[9px] sm:text-xs bg-muted p-1.5 sm:p-2 md:p-3 rounded-md">
                            {selectedExerciseData.uiActions.map((action, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="text-primary">•</span> {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {progress === 100 && (
                        <Alert className="bg-green-100 border-green-200">
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                          <AlertTitle className="text-green-800 text-xs sm:text-sm">¡Todos los pasos completados!</AlertTitle>
                          <AlertDescription className="text-green-700 text-xs sm:text-sm">
                            {t("exercises.completionMessage", "Felicidades! Has completado todos los pasos de este ejercicio.")}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  )}
                  
                  <CardFooter className="flex justify-between border-t pt-3 sm:pt-4 p-3 sm:p-6">
                    {selectedExerciseData.isStarted && !selectedExerciseData.isCompleted ? (
                      <>
                        <div className="flex gap-2">
                        </div>
                        <div></div>
                      </>
                    ) : (
                      <>
                        <div></div>
                        <SheetClose asChild>
                          <Button 
                            size="sm" 
                            variant="default"
                            className="text-xs sm:text-sm"
                          >
                            {t("exercises.close", "Cerrar")}
                          </Button>
                        </SheetClose>
                      </>
                    )}
                  </CardFooter>
                  
                  {/* Nueva sección para botones de completar/cerrar */}
                  {selectedExerciseData.isStarted && !selectedExerciseData.isCompleted && (
                    <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 flex justify-end gap-2 mt-1 sm:mt-2">
                      <Button 
                        size="sm"
                        onClick={completeExercise}
                        variant="outline"
                        className="gap-1 text-[10px] xs:text-xs sm:text-sm text-green-600 border-green-200 hover:bg-green-50 h-7 sm:h-8"
                      >
                        <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {t("exercises.markAsDone", "Marcar como completado")}
                      </Button>
                      
                      <SheetClose asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-[10px] xs:text-xs sm:text-sm h-7 sm:h-8"
                        >
                          {t("exercises.close", "Cerrar")}
                        </Button>
                      </SheetClose>
                    </div>
                  )}
              </Card>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GitExercises; 

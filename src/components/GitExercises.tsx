import React, { useState, useEffect, useRef, useCallback } from "react";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  GitBranch,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  Terminal,
  GitMerge,
  AlertTriangle,
  Code,
  XCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import useGitStore from "@/store/gitStore";
import { toast } from "sonner";

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

const GitExercises: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { 
    repository, 
    workingChanges,
    stagedChanges
  } = useGitStore();

  const [selectedExercise, setSelectedExercise] = useState<string>("feature-branch");
  const [progress, setProgress] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [conflictResolution, setConflictResolution] = useState("");
  const conflictTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Definir y actualizar los ejercicios en una función que depende de la traducción
  const getInitialExercises = useCallback((): Record<string, Exercise> => ({
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
            if (!devBranch) return false;
            const devCommit = repository.commits.find(c => c.id === devBranch.commitId);
            if (!devCommit) return false;

            // Si el commit en dev tiene múltiples padres, es un merge commit
            return devCommit.parentIds.length > 1;
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
            if (!devBranch || !releaseBranch) return false;
            
            const devCommit = repository.commits.find(c => c.id === devBranch.commitId);
            const releaseCommit = repository.commits.find(c => c.id === releaseBranch.commitId);
            if (!devCommit || !releaseCommit) return false;
            
            // Check if dev has merged from story
            const hasStoryMerge = devCommit.parentIds.length > 1;
            // Check if release has merged from dev
            const hasDevMerge = releaseCommit.parentIds.length > 0;
            
            return hasStoryMerge && hasDevMerge;
          }
        },
        {
          id: "prepare-production",
          description: t("exercises.teamWorkflow.steps.prepareProduction", "Merge 'release' into 'master' for production"),
          hint: t("exercises.teamWorkflow.hints.prepareProduction", "Switch to 'master' and merge from 'release'"),
          isCompleted: false,
          validation: () => {
            const masterBranch = repository.branches.find(b => b.name === "master");
            if (!masterBranch) return false;
            
            const masterCommit = repository.commits.find(c => c.id === masterBranch.commitId);
            if (!masterCommit) return false;
            
            // Check if master has a merge commit from release
            return masterCommit.parentIds.length > 1;
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
            const storyBranch = repository.branches.find(b => b.name === "story-456");
            if (!storyBranch) return false;
            
            // Check if the story branch has received merges
            const commits = repository.commits.filter(c => c.id === storyBranch.commitId || c.parentIds.includes(storyBranch.commitId));
            const mergesToStory = commits.filter(c => c.parentIds.length > 1);
            
            return mergesToStory.length >= 2;
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
          id: "resolve-conflict",
          description: t("exercises.mergeConflicts.steps.resolveConflict", "Resolve the merge conflict"),
          hint: t("exercises.mergeConflicts.hints.resolveConflict", "Edit the conflicted file to remove the conflict markers and create a working solution"),
          isCompleted: false,
          validation: () => {
            // Check if user has resolved the conflict manually
            const correctResolution = conflictResolution.includes("<<<<<<< HEAD") === false && 
                                       conflictResolution.includes("=======") === false && 
                                       conflictResolution.includes(">>>>>>>") === false && 
                                       conflictResolution.trim() !== "" &&
                                       conflictResolution.includes("console.log") &&
                                      (conflictResolution.includes("reduce") || conflictResolution.includes("timestamp"));
            
            return correctResolution;
          }
        }
      ],
      terminalCommands: [
        t("exercises.mergeConflicts.commands.afterResolve", "# After resolving the conflict in the editor"),
        t("exercises.mergeConflicts.commands.add", "git add ."),
        t("exercises.mergeConflicts.commands.commit", "git commit -m \"Merge and resolve conflicts\"")
      ],
      uiActions: [
        t("exercises.mergeConflicts.uiActions.editFile", "Edit file to resolve conflict"),
        t("exercises.mergeConflicts.uiActions.stageAndCommit", "Stage and commit resolved changes")
      ]
    }
  }), [t, i18n.language]);
  
  // Inicializar los ejercicios
  const [exercises, setExercises] = useState<Record<string, Exercise>>(getInitialExercises());
  
  // Efecto para actualizar los ejercicios cuando cambie el idioma
  useEffect(() => {
    // Para diagnóstico
    console.log('Idioma cambiado a:', i18n.language);
    
    // Obtener ejercicios con textos traducidos actualizados
    const updatedExercises = getInitialExercises();
    
    // Crear una copia actualizada que preserve el estado pero use los nuevos textos
    const newExercisesState = {...updatedExercises};
    
    // Para cada ejercicio, preservamos su estado pero actualizamos sus textos
    Object.keys(updatedExercises).forEach(key => {
      if (exercises[key]) {
        // Conservar estado (isStarted, isCompleted)
        newExercisesState[key] = {
          ...updatedExercises[key], // Nuevos textos traducidos
          isStarted: exercises[key].isStarted,
          isCompleted: exercises[key].isCompleted,
        };
        
        // Conservar el estado de completado de cada paso, pero usar textos actualizados
        if (updatedExercises[key].steps.length === exercises[key].steps.length) {
          newExercisesState[key].steps = updatedExercises[key].steps.map((step, index) => ({
            ...step, // Nuevos textos traducidos para el paso
            isCompleted: exercises[key].steps[index]?.isCompleted || false
          }));
        }
      }
    });
    
    // Actualizar el estado con la nueva estructura que tiene textos traducidos actualizados
    setExercises(newExercisesState);
    
    // Forzar actualización de la interfaz
    setForceUpdate(prev => prev + 1);
    
  }, [i18n.language]);  // Eliminar t de las dependencias para evitar múltiples actualizaciones
  
  // Efecto para actualizar la visualización cuando cambia el ejercicio seleccionado
  useEffect(() => {
    // Obtener la versión actualizada del ejercicio seleccionado
    const updatedExercises = getInitialExercises();
    const selectedExerciseData = updatedExercises[selectedExercise];
    
    if (selectedExerciseData) {
      // Actualizar solo el ejercicio seleccionado para asegurar textos actualizados
      setExercises(prev => {
        const updated = {...prev};
        
        // Si el ejercicio ya existe en el estado, preservamos su estado pero actualizamos textos
        if (prev[selectedExercise]) {
          updated[selectedExercise] = {
            ...selectedExerciseData, // Usar los textos actualizados
            isStarted: prev[selectedExercise].isStarted,
            isCompleted: prev[selectedExercise].isCompleted,
          };
          
          // Conservar estado de completado de los pasos 
          if (selectedExerciseData.steps.length === prev[selectedExercise].steps.length) {
            updated[selectedExercise].steps = selectedExerciseData.steps.map((step, index) => ({
              ...step, // Usar textos actualizados
              isCompleted: prev[selectedExercise].steps[index]?.isCompleted || false
            }));
          }
        }
        
        return updated;
      });
    }
    
    // Forzar actualización cuando cambia la pestaña seleccionada
    setForceUpdate(prev => prev + 1);
  }, [selectedExercise]);
  
  // Método para iniciar un ejercicio
  const startExercise = () => {
    // Obtener la versión actualizada de los ejercicios con las traducciones actuales
    const updatedExercises = getInitialExercises();
    
    // Guardar la información actualizada con los nuevos textos traducidos
    setExercises(prev => {
      const updated = {...prev};
      
      // Actualizamos el ejercicio seleccionado con los textos traducidos más las propiedades de estado
      updated[selectedExercise] = {
        ...updatedExercises[selectedExercise], // Usar los nuevos textos traducidos
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
    setExercises(prev => ({
      ...prev,
      [selectedExercise]: {
        ...prev[selectedExercise],
        isCompleted: true
      }
    }));
    
    toast.success(t("exercises.exerciseCompleted", "¡Ejercicio completado manualmente!"), {
      duration: 3000
    });
  };
  
  // Método para forzar una actualización de la validación
  const checkProgress = () => {
    setForceUpdate(prev => prev + 1);
  };
  
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
    setExercises(prev => ({
      ...prev,
      [selectedExercise]: {
        ...prev[selectedExercise],
        steps: updatedSteps
      }
    }));
    
    // Check if all steps are completed (solo mostrar mensaje si es un cambio nuevo)
    if (completedSteps === exercise.steps.length && completedSteps > prevCompletedSteps && progressPercentage === 100) {
      toast.success(t("exercises.exerciseFullyCompleted", "¡Todos los pasos completados! 🎉"), {
        duration: 5000,
        position: 'top-center'
      });
      
      // Marcar como completado automáticamente
      setExercises(prev => ({
        ...prev,
        [selectedExercise]: {
          ...prev[selectedExercise],
          isCompleted: true
        }
      }));
    }
  }, [repository, workingChanges, stagedChanges, selectedExercise, exercises, t, forceUpdate]);
  
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
        isStarted: prev[selectedExercise]?.isStarted || false // Mantener como iniciado si ya lo estaba
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
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-1.5 sm:gap-2 fixed bottom-4 right-4 shadow-md rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 h-auto z-50"
        >
          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <span className="text-[10px] sm:text-xs md:text-sm">{t("exercises.challenges", "Challenges")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className={`w-full p-0 overflow-y-auto transition-all duration-300 ease-in-out ${
          selectedExercise === "merge-conflicts" ? "sm:max-w-full" : "sm:max-w-lg"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-sm sm:text-base md:text-xl font-semibold flex items-center gap-1 sm:gap-2 mb-1 sm:mb-0">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            {t("exercises.title", "Git Exercises")}
          </SheetTitle>
          
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
          <Tabs defaultValue="feature-branch" value={selectedExercise} onValueChange={setSelectedExercise}>
            <div className="px-3 sm:px-4 md:px-6 pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2">
              <TabsList className="grid grid-cols-4 mb-2 h-auto w-full overflow-hidden">
                <TabsTrigger 
                  value="feature-branch" 
                  className="text-[8px] xs:text-[10px] sm:text-xs py-1 sm:py-1.5 px-0.5 sm:px-1 md:px-2 h-auto min-h-[2rem] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {t("exercises.featureBranch.tabTitle", "Feature Branch")}
                </TabsTrigger>
                <TabsTrigger 
                  value="team-workflow" 
                  className="text-[8px] xs:text-[10px] sm:text-xs py-1 sm:py-1.5 px-0.5 sm:px-1 md:px-2 h-auto min-h-[2rem] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {t("exercises.teamWorkflow.tabTitle", "Team Workflow")}
                </TabsTrigger>
                <TabsTrigger 
                  value="technical-tasks" 
                  className="text-[8px] xs:text-[10px] sm:text-xs py-1 sm:py-1.5 px-0.5 sm:px-1 md:px-2 h-auto min-h-[2rem] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {t("exercises.technicalTasks.tabTitle", "Technical Tasks")}
                </TabsTrigger>
                <TabsTrigger 
                  value="merge-conflicts" 
                  className="text-[8px] xs:text-[10px] sm:text-xs py-1 sm:py-1.5 px-0.5 sm:px-1 md:px-2 h-auto min-h-[2rem] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {t("exercises.mergeConflicts.tabTitle", "Merge Conflicts")}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="merge-conflicts" className="p-3 sm:p-6 pt-0">
              <Card className={`${selectedExercise === "merge-conflicts" && !exercises["merge-conflicts"].isCompleted ? "mx-auto max-w-5xl" : ""}`}>
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-1 sm:gap-2">
                      <GitMerge className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      {exercises["merge-conflicts"].title}
                    </CardTitle>
                    {renderDifficultyBadge(exercises["merge-conflicts"].difficulty)}
                  </div>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {exercises["merge-conflicts"].description}
                  </CardDescription>
                </CardHeader>
                
                {!exercises["merge-conflicts"].isStarted ? (
                  <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                    <div className="bg-amber-50 p-3 sm:p-4 rounded-md border border-amber-200 space-y-2 sm:space-y-3">
                      <h3 className="font-medium text-amber-800 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                        {t("exercises.mergeConflicts.scenario.title", "Scenario: Team Collaboration Conflict")}
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-700">
                        {t("exercises.mergeConflicts.scenario.description", "Your team is working on a feature. Two developers have modified the same function in different ways:")}
                      </p>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-xs sm:text-sm text-amber-700">
                          <strong>{t("exercises.mergeConflicts.scenario.dev1", "Developer 1 (feature-a branch)")}</strong>: {t("exercises.mergeConflicts.scenario.dev1desc", "Implemented a version focused on performance.")}
                        </p>
                        <p className="text-xs sm:text-sm text-amber-700">
                          <strong>{t("exercises.mergeConflicts.scenario.dev2", "Developer 2 (feature-b branch)")}</strong>: {t("exercises.mergeConflicts.scenario.dev2desc", "Implemented a version with additional logging.")}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-700">
                        {t("exercises.mergeConflicts.scenario.task", "When merging these branches into dev, a conflict occurred. Your task is to resolve this conflict by creating a solution that preserves both the performance improvements and the logging functionality.")}
                      </p>
                    </div>
                    
                    <div className="text-center space-y-1 sm:space-y-2">
                      <h3 className="text-base sm:text-lg font-medium">{t("exercises.readyToStart", "¿Listo para empezar?")}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("exercises.mergeConflicts.startExplanation", "You'll be presented with a conflict to resolve. You need to edit the code to create a version that combines both implementations correctly.")}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        onClick={startExercise}
                        className="px-4 sm:px-8 text-xs sm:text-sm h-8 sm:h-10"
                        size="auto"
                      >
                        {t("exercises.start", "Iniciar Ejercicio")}
                      </Button>
                    </div>
                  </CardContent>
                ) : exercises["merge-conflicts"].isCompleted ? (
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
                        onClick={() => setSelectedExercise(selectedExercise === "feature-branch" ? "team-workflow" : selectedExercise === "team-workflow" ? "technical-tasks" : selectedExercise === "merge-conflicts" ? "feature-branch" : "team-workflow")}
                        variant="default"
                        size="auto"
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      >
                        {t("exercises.nextExercise", "Siguiente ejercicio")}
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="space-y-3 sm:space-y-6 p-3 sm:p-6">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800 text-xs sm:text-sm">
                        {t("exercises.mergeConflicts.conflict.title", "Merge Conflict Detected!")}
                      </AlertTitle>
                      <AlertDescription className="text-amber-700 mt-1 sm:mt-2 text-xs sm:text-sm">
                        {t("exercises.mergeConflicts.conflict.description", "There is a merge conflict in your file. You need to resolve it manually by editing the content below.")}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs sm:text-sm font-medium flex items-center gap-1">
                          <Code className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {t("exercises.mergeConflicts.conflict.fileTitle", "Conflicted File Content:")}
                        </h4>
                        <Badge variant="outline" className="text-[10px] sm:text-xs bg-blue-50 text-blue-700">utils/feature.js</Badge>
                      </div>
                      <div className="border rounded-md">
                        <Textarea 
                          ref={conflictTextareaRef}
                          value={conflictResolution || `<<<<<<< HEAD
function addFeature(data) {
  // Feature B implementation (current branch)
  console.log("Processing data:", data);
  console.log("Feature started at:", new Date().toISOString());
  
  // Process the data
  const result = data.map(item => {
    console.log("Processing item:", item.id);
    return { ...item, processed: true };
  });
  
  console.log("Feature completed");
  return result;
}
=======
function addFeature(data) {
  // Feature A implementation (merging branch)
  // Optimized version with better performance
  
  // Use more efficient data processing
  const result = data.reduce((acc, item) => {
    acc.push({
      ...item,
      processed: true,
      timestamp: Date.now()
    });
    return acc;
  }, []);
  
  return result;
}
>>>>>>> feature-a`}
                          onChange={(e) => setConflictResolution(e.target.value)}
                          className="font-mono text-[9px] xs:text-[10px] sm:text-xs min-h-[250px] xs:min-h-[300px] sm:min-h-[350px] md:min-h-[450px] p-2 sm:p-4 w-full"
                          placeholder={t("exercises.mergeConflicts.conflict.placeholder", "Edit this code to resolve the conflict...")}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                        <div className="bg-blue-50 p-2 sm:p-4 rounded-md space-y-1.5 sm:space-y-3 border border-blue-100">
                          <h4 className="font-medium text-blue-800 text-[10px] sm:text-xs">{t("exercises.mergeConflicts.resolution.title", "How to Resolve This Conflict:")}</h4>
                          <ul className="space-y-1 sm:space-y-2 text-[9px] xs:text-[10px] sm:text-xs text-blue-700 list-disc pl-3 sm:pl-5">
                            <li>{t("exercises.mergeConflicts.resolution.step1", "Remove the conflict markers (<<<<<<< HEAD, =======, >>>>>>>)")}</li>
                            <li>{t("exercises.mergeConflicts.resolution.step2", "Combine both implementations to keep the performance improvements from feature-a")}</li>
                            <li>{t("exercises.mergeConflicts.resolution.step3", "Preserve the logging functionality from the current branch (HEAD)")}</li>
                            <li>{t("exercises.mergeConflicts.resolution.step4", "Make sure the result is valid JavaScript that would run without errors")}</li>
                          </ul>
                        </div>
                        
                        <div className="flex flex-col justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            className="w-full mt-auto text-[10px] xs:text-xs sm:text-sm h-7 sm:h-8 md:h-10"
                            onClick={() => {
                              const resolution = conflictResolution;
                              if (
                                !resolution.includes("<<<<<<< HEAD") && 
                                !resolution.includes("=======") && 
                                !resolution.includes(">>>>>>>") && 
                                resolution.trim() !== "" &&
                                resolution.includes("console.log") &&
                                (resolution.includes("reduce") || resolution.includes("timestamp"))
                              ) {
                                toast.success(t("exercises.mergeConflicts.conflict.success", "¡Conflicto resuelto correctamente!"), {
                                  duration: 3000,
                                });
                                
                                // Update the step as completed
                                setExercises(prev => {
                                  const updatedSteps = prev["merge-conflicts"].steps.map(step => {
                                    if (step.id === "resolve-conflict") {
                                      return { ...step, isCompleted: true };
                                    }
                                    return step;
                                  });
                                  
                                  return {
                                    ...prev,
                                    ["merge-conflicts"]: {
                                      ...prev["merge-conflicts"],
                                      steps: updatedSteps,
                                      isCompleted: true
                                    }
                                  };
                                });
                                
                                // Trigger check
                                setForceUpdate(prev => prev + 1);
                              } else if (
                                !resolution.includes("<<<<<<< HEAD") && 
                                !resolution.includes("=======") && 
                                !resolution.includes(">>>>>>>") && 
                                resolution.trim() !== ""
                              ) {
                                toast.error(t("exercises.mergeConflicts.conflict.incomplete", "You've removed the conflict markers, but your solution should include both the logging and the performance improvements."), {
                                  duration: 3000,
                                });
                              } else {
                                toast.error(t("exercises.mergeConflicts.conflict.error", "There are still unresolved conflicts. Remove the conflict markers and provide a solution."), {
                                  duration: 3000,
                                });
                              }
                            }}
                          >
                            {t("exercises.mergeConflicts.conflict.validate", "Validate Resolution")}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 sm:pt-6 mt-4 sm:mt-6 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setConflictResolution("");
                            setExercises(prev => ({
                              ...prev,
                              ["merge-conflicts"]: {
                                ...prev["merge-conflicts"],
                                isStarted: false,
                                isCompleted: false,
                                steps: prev["merge-conflicts"].steps.map(step => ({
                                  ...step,
                                  isCompleted: false
                                }))
                              }
                            }));
                          }}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {t("exercises.cancel", "Cancelar")}
                        </Button>
                        
                        <SheetClose asChild>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="gap-1 sm:gap-2 text-xs sm:text-sm"
                          >
                            {t("exercises.close", "Cerrar")}
                          </Button>
                        </SheetClose>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>
            
            {Object.entries(exercises).filter(([id]) => id !== "merge-conflicts").map(([id, exercise]) => (
              <TabsContent key={id} value={id} className="p-3 sm:p-6 pt-0">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base sm:text-lg font-semibold">
                        {exercise.title}
                      </CardTitle>
                      {renderDifficultyBadge(exercise.difficulty)}
                    </div>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      {exercise.description}
                    </CardDescription>
                  </CardHeader>
                  
                  {!exercise.isStarted ? (
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
                  ) : exercise.isCompleted ? (
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
                          onClick={() => setSelectedExercise(selectedExercise === "feature-branch" ? "team-workflow" : selectedExercise === "team-workflow" ? "technical-tasks" : selectedExercise === "merge-conflicts" ? "feature-branch" : "team-workflow")}
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
                          {exercise.steps.map((step, index) => (
                            <li key={step.id} className={`flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded ${step.isCompleted ? 'bg-green-50 border border-green-100' : 'bg-muted/50'}`}>
                              <div className={`flex-shrink-0 mt-0.5 rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex items-center justify-center ${step.isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {step.isCompleted ? <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" /> : (index + 1)}
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
                          ))}
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
                              {exercise.terminalCommands.map((cmd, i) => (
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
                            {exercise.uiActions.map((action, i) => (
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
                    {exercise.isStarted && !exercise.isCompleted ? (
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
                  {exercise.isStarted && !exercise.isCompleted && (
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GitExercises; 
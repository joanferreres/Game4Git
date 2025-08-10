import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GitRepository, GitCommit, GitBranch, CodeFile, RemoteReference } from '../types/git';
import { toast } from 'sonner';
import * as diffLib from 'diff';

// Initial C file content
const initialContent = `#include <stdio.h>

int main() {
  printf("Hello, Git Game!\\n");
  return 0;
}`;

// Generate a random ID (simple implementation for demo)
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Detect if there's a conflict between two versions of content
const detectConflict = (sourceContent: string, targetContent: string): boolean => {
  // If contents are identical, there's no conflict
  if (sourceContent === targetContent) return false;
  
  // Get differences between the two contents
  const differences = diffLib.diffLines(targetContent, sourceContent);
  
  // Split content into lines for comparison
  const sourceLines = sourceContent.split('\n');
  const targetLines = targetContent.split('\n');
  
  // Fast check: if one file just adds lines at the end without modifying existing lines,
  // then there's no conflict
  let onlyAddedAtEnd = true;
  let seenAddition = false;
  let seenRemoval = false;
  
  for (const part of differences) {
    if (part.added) {
      seenAddition = true;
      if (seenRemoval) {
        onlyAddedAtEnd = false;
        break;
      }
    } else if (part.removed) {
      seenRemoval = true;
      if (seenAddition) {
        onlyAddedAtEnd = false;
        break;
      }
    }
  }
  
  // If we only add lines at the end, no conflict
  if (onlyAddedAtEnd) return false;
  
  // More thorough check - we need to find if the same lines were modified differently
  // Simple heuristic: if there are both additions and removals near each other (overlapping changes)
  let lastAddedIndex = -1;
  let lastRemovedIndex = -1;
  let currentIndex = 0;
  
  for (const part of differences) {
    const lineCount = part.value.split('\n').length - (part.value.endsWith('\n') ? 1 : 0);
    
    if (part.added) {
      lastAddedIndex = currentIndex + lineCount - 1;
    } else if (part.removed) {
      lastRemovedIndex = currentIndex + lineCount - 1;
    }
    
    // If additions and removals are close to each other (overlapping changes)
    // Consider it a conflict
    if (lastAddedIndex >= 0 && lastRemovedIndex >= 0) {
      const distance = Math.abs(lastAddedIndex - lastRemovedIndex);
      if (distance <= 3) { // Within 3 lines is considered a conflict
        return true;
      }
    }
    
    if (!part.added && !part.removed) {
      currentIndex += lineCount;
    }
  }
  
  // Additional check: if there are non-trivial changes on both sides
  const hasSignificantAdditions = differences.some(part => 
    part.added && part.value.trim().length > 0 && part.value.split('\n').length > 1);
  
  const hasSignificantRemovals = differences.some(part => 
    part.removed && part.value.trim().length > 0 && part.value.split('\n').length > 1);
  
  return hasSignificantAdditions && hasSignificantRemovals;
};

// Generate content with conflict markers
const generateConflictContent = (
  sourceContent: string,
  targetContent: string,
  sourceBranchName: string,
  targetBranchName: string
): string => {
  const differences = diffLib.diffLines(targetContent, sourceContent);
  let result = '';
  
  // Track our position in the original content
  let inConflict = false;
  let targetBuffer = '';
  let sourceBuffer = '';
  
  // Process differences and identify conflict regions
  differences.forEach((part, index) => {
    // Check if next part will be a conflict continuation
    const nextPart = differences[index + 1];
    const isConflictStart = (part.added && nextPart?.removed) || (part.removed && nextPart?.added);
    const isConflictEnd = (inConflict && !part.added && !part.removed);
    
    if (isConflictStart && !inConflict) {
      // Start new conflict
      inConflict = true;
      
      if (part.added) {
        sourceBuffer = part.value;
        targetBuffer = ''; // Will be filled by next part
      } else if (part.removed) {
        targetBuffer = part.value;
        sourceBuffer = ''; // Will be filled by next part
      }
    } else if (inConflict) {
      if (part.added) {
        sourceBuffer += part.value;
      } else if (part.removed) {
        targetBuffer += part.value;
      } else {
        // End conflict and output markers
        result += `<<<<<<< HEAD (${targetBranchName})\n`;
        result += targetBuffer;
        if (!targetBuffer.endsWith('\n')) result += '\n';
        result += `=======\n`;
        result += sourceBuffer;
        if (!sourceBuffer.endsWith('\n')) result += '\n';
        result += `>>>>>>> ${sourceBranchName}\n`;
        result += part.value;
        
        // Reset conflict state
        inConflict = false;
        targetBuffer = '';
        sourceBuffer = '';
      }
    } else {
      // No conflict, just output the content
      result += part.value;
    }
  });
  
  // If we end with a conflict in progress, close it
  if (inConflict) {
    result += `<<<<<<< HEAD (${targetBranchName})\n`;
    result += targetBuffer;
    if (!targetBuffer.endsWith('\n')) result += '\n';
    result += `=======\n`;
    result += sourceBuffer;
    if (!sourceBuffer.endsWith('\n')) result += '\n';
    result += `>>>>>>> ${sourceBranchName}\n`;
  }
  
  return result;
};

interface GitStore {
  repository: GitRepository;
  currentFile: CodeFile;
  workingChanges: string;
  stagedChanges: string | null;
  selectedCommitId: string | null;
  
  // Actions
  createCommit: (message: string) => void;
  createBranch: (name: string) => void;
  switchBranch: (name: string) => void;
  updateWorkingChanges: (content: string) => void;
  resetWorkingChanges: () => void;
  selectCommit: (id: string | null) => void;
  stageChanges: (content: string) => void;
  resetToInitialCommit: () => void;
  mergeBranch: (sourceBranchName: string, targetBranchName: string) => void;
  
  // Conflict resolution
  hasPendingConflict: () => boolean;
  resolveConflict: (resolvedContent: string) => void;
  abortMerge: () => void;
  
  // Operaciones Remotas
  fetchRemote: () => void;
  pullRemote: (branchName?: string) => void;
  pushToRemote: (branchName?: string) => void;
}

interface AdminState {
  isGdbEnabled: boolean;
  isValgrindEnabled: boolean;
  setGdbEnabled: (enabled: boolean) => void;
  setValgrindEnabled: (enabled: boolean) => void;
}

// Create initial repository with a master branch and initial commit
const createInitialRepo = (): GitRepository => {
  const initialCommitId = generateId();
  
  return {
    commits: [
      {
        id: initialCommitId,
        message: "Initial commit",
        content: initialContent,
        timestamp: Date.now(),
        parentIds: []
      }
    ],
    branches: [
      {
        name: "master",
        commitId: initialCommitId,
        isActive: true
      }
    ],
    HEAD: initialCommitId,
    remoteReferences: [
      {
        name: "origin/master",
        commitId: initialCommitId
      }
    ],
    remoteName: "origin"
  };
};

const useGitStore = create<GitStore>((set, get) => ({
  repository: createInitialRepo(),
  currentFile: {
    name: "hello.c",
    content: initialContent,
    language: "c"
  },
  workingChanges: initialContent,
  stagedChanges: null,
  selectedCommitId: null,

  // Stage changes (git add)
  stageChanges: (content: string) => {
    set({ stagedChanges: content });
  },

  // Create a new commit with the staged changes
  createCommit: (message: string) => {
    const { repository, stagedChanges } = get();
    
    // Ensure there are staged changes
    if (!stagedChanges) return;
    
    const newCommitId = generateId();
    const activeBranch = repository.branches.find(b => b.isActive);
    
    if (!activeBranch) return;
    
    const parentCommitId = activeBranch.commitId;
    
    const newCommit: GitCommit = {
      id: newCommitId,
      message,
      content: stagedChanges,
      timestamp: Date.now(),
      parentIds: [parentCommitId]
    };
    
    // Update the active branch to point to the new commit
    const updatedBranches = repository.branches.map(branch => 
      branch.isActive ? { ...branch, commitId: newCommitId } : branch
    );
    
    set({
      repository: {
        ...repository,
        commits: [...repository.commits, newCommit],
        branches: updatedBranches,
        HEAD: newCommitId
      },
      stagedChanges: null, // Clear staged changes after commit
      workingChanges: stagedChanges // Update working copy to match new commit
    });
  },

  // Create a new branch pointing to the current HEAD
  createBranch: (name: string) => {
    const { repository } = get();
    
    // Don't create duplicate branches
    if (repository.branches.some(b => b.name === name)) return;
    
    // Create the new branch
    const newBranch: GitBranch = {
      name,
      commitId: repository.HEAD,
      isActive: false
    };
    
    set({
      repository: {
        ...repository,
        branches: [...repository.branches, newBranch]
      }
    });
  },

  // Switch to a different branch
  switchBranch: (name: string) => {
    const { repository } = get();
    const targetBranch = repository.branches.find(b => b.name === name);
    
    if (!targetBranch) return;
    
    // Get the commit that the branch points to
    const targetCommit = repository.commits.find(c => c.id === targetBranch.commitId);
    
    if (!targetCommit) return;
    
    // Update all branches' isActive status
    const updatedBranches = repository.branches.map(branch => 
      ({ ...branch, isActive: branch.name === name })
    );
    
    set({
      repository: {
        ...repository,
        branches: updatedBranches,
        HEAD: targetBranch.commitId
      },
      workingChanges: targetCommit.content,
      stagedChanges: null // Clear staged changes when switching branches
    });
  },

  // Update the working copy with new changes
  updateWorkingChanges: (content: string) => {
    set({ workingChanges: content });
  },

  // Reset the working changes to the current HEAD
  resetWorkingChanges: () => {
    const { repository } = get();
    const currentCommit = repository.commits.find(c => c.id === repository.HEAD);
    
    if (currentCommit) {
      set({ 
        workingChanges: currentCommit.content,
        stagedChanges: null // Clear staged changes when resetting
      });
    }
  },

  // Select a commit for viewing
  selectCommit: (id: string | null) => {
    set({ selectedCommitId: id });
  },
  
  // Reset to initial commit
  resetToInitialCommit: () => {
    const { repository } = get();
    
    // Find the initial commit (the one without parent)
    const initialCommit = repository.commits.find(c => c.parentIds.length === 0);
    
    if (!initialCommit) return;
    
    // Update the master branch to point to the initial commit
    const updatedBranches = repository.branches.map(branch => 
      branch.name === "master" ? { ...branch, commitId: initialCommit.id, isActive: true } : { ...branch, isActive: false }
    );
    
    set({
      repository: {
        ...repository,
        branches: updatedBranches,
        HEAD: initialCommit.id
      },
      workingChanges: initialCommit.content,
      stagedChanges: null, // Clear staged changes when resetting
      selectedCommitId: null // Clear selected commit
    });
  },

  // Merge a source branch into the target branch
  mergeBranch: (sourceBranchName: string, targetBranchName: string) => {
    const { repository } = get();
    const sourceBranch = repository.branches.find(b => b.name === sourceBranchName);
    const targetBranch = repository.branches.find(b => b.name === targetBranchName);

    if (!sourceBranch) {
      toast.error(`Source branch "${sourceBranchName}" not found.`);
      return;
    }

    if (!targetBranch) {
      toast.error(`Target branch "${targetBranchName}" not found.`);
      return;
    }

    if (sourceBranchName === targetBranchName) {
      toast.error("Cannot merge a branch into itself.");
      return;
    }

    const sourceBranchHeadCommit = repository.commits.find(c => c.id === sourceBranch.commitId);
    const targetBranchHeadCommit = repository.commits.find(c => c.id === targetBranch.commitId);

    if (!sourceBranchHeadCommit || !targetBranchHeadCommit) {
      toast.error("Could not find head commits for branches.");
      return;
    }
    
    // Detect merge conflicts
    // For simplicity, we'll say there's a conflict if both branches modified the same file
    // and the content is different
    const hasConflict = detectConflict(sourceBranchHeadCommit.content, targetBranchHeadCommit.content);

    if (hasConflict) {
      // Create conflict content with markers
      const conflictContent = generateConflictContent(
        sourceBranchHeadCommit.content, 
        targetBranchHeadCommit.content,
        sourceBranchName,
        targetBranchName
      );

      // Store conflict information
      set({
        repository: {
          ...repository,
          pendingMergeConflict: {
            sourceCommitId: sourceBranchHeadCommit.id,
            targetCommitId: targetBranchHeadCommit.id,
            sourceBranch: sourceBranchName,
            targetBranch: targetBranchName,
            conflictContent
          }
        },
        workingChanges: conflictContent,
      });

      toast.error("Merge conflict detected. Please resolve the conflicts and commit the changes.");
      return;
    }
    
    // If no conflict, continue with normal merge
    const newCommitId = generateId();
    const mergeCommitMessage = `Merge branch '${sourceBranchName}' into ${targetBranchName}`;
    
    const mergeCommit: GitCommit = {
      id: newCommitId,
      message: mergeCommitMessage,
      content: sourceBranchHeadCommit.content, // Simplification: take source branch content
      timestamp: Date.now(),
      // Parents are the heads of the target and source branches
      parentIds: [targetBranchHeadCommit.id, sourceBranchHeadCommit.id].sort(), 
    };

    // Update branches: target branch points to new merge commit and becomes active.
    const updatedBranches = repository.branches.map(branch => {
      if (branch.name === targetBranchName) {
        return { ...branch, commitId: newCommitId, isActive: true };
      }
      return { ...branch, isActive: false }; // Other branches become inactive
    });

    set(state => ({
      repository: {
        ...state.repository,
        commits: [...state.repository.commits, mergeCommit],
        branches: updatedBranches,
        HEAD: newCommitId, // HEAD points to the new merge commit on the target branch
      },
      workingChanges: mergeCommit.content,
      stagedChanges: null,
      selectedCommitId: newCommitId,
    }));
  },

  // Operaciones Remotas

  // Fetch: Obtiene los cambios del remoto pero no los aplica a las ramas locales
  fetchRemote: () => {
    const { repository } = get();

    // Simulamos que el remoto tiene algunos commits que aún no tenemos localmente
    // En un caso real, esta información vendría realmente del servidor
    const remoteHasNewCommits = Math.random() > 0.3; // 70% de probabilidad

    if (!remoteHasNewCommits) {
      toast.info("Remote is up to date. No new changes to fetch.");
      return;
    }

    // Simular que obtenemos nuevos commits del remoto
    const simulateRemoteChanges = () => {
      // Elegir una rama aleatoria para actualizar
      const branchesToUpdate = repository.branches.filter(branch => {
        const remoteRef = repository.remoteReferences.find(ref => 
          ref.name === `${repository.remoteName}/${branch.name}`
        );
        return remoteRef && remoteRef.commitId === branch.commitId;
      });

      if (branchesToUpdate.length === 0) return null;

      const randomBranch = branchesToUpdate[Math.floor(Math.random() * branchesToUpdate.length)]!;
      const remoteRefName = `${repository.remoteName}/${randomBranch.name}`;
      
      // Crear un nuevo commit simulando que viene del remoto
      const lastCommit = repository.commits.find(c => c.id === randomBranch.commitId);
      if (!lastCommit) return null;
      
      const newRemoteCommitId = generateId();
      const randomChanges = lastCommit.content.replace(
        "Hello, Git Game!", 
        `Hello, Git Game! (Remote change at ${new Date().toLocaleTimeString()})`
      );
      
      const newRemoteCommit: GitCommit = {
        id: newRemoteCommitId,
        message: `Remote update on ${randomBranch.name}`,
        content: randomChanges,
        timestamp: Date.now(),
        parentIds: [randomBranch.commitId]
      };

      return {
        commit: newRemoteCommit,
        refName: remoteRefName,
        branchName: randomBranch.name
      };
    };

    const remoteChange = simulateRemoteChanges();
    
    if (!remoteChange) {
      toast.info("No changes to fetch from remote.");
      return;
    }

    // Actualizar los commits y referencias remotas
    const updatedRemoteRefs = repository.remoteReferences.map(ref => 
      ref.name === remoteChange.refName 
        ? { ...ref, commitId: remoteChange.commit.id } 
        : ref
    );

    // Si no existe la referencia remota, la creamos
    const refExists = repository.remoteReferences.some(ref => ref.name === remoteChange.refName);
    if (!refExists) {
      updatedRemoteRefs.push({
        name: remoteChange.refName,
        commitId: remoteChange.commit.id
      });
    }

    set({
      repository: {
        ...repository,
        commits: [...repository.commits, remoteChange.commit],
        remoteReferences: updatedRemoteRefs,
        lastFetchTime: Date.now()
      }
    });

    toast.success(`Fetched new changes for ${remoteChange.refName}`);
  },

  // Pull: Fetch + Merge de los cambios remotos a la rama local
  pullRemote: (branchName?: string) => {
    const { repository } = get();
    
    // Usar la rama activa si no se especifica
    const targetBranchName = branchName || repository.branches.find(b => b.isActive)?.name;
    
    if (!targetBranchName) {
      toast.error("No branch selected for pull operation");
      return;
    }
    
    const targetBranch = repository.branches.find(b => b.name === targetBranchName);
    if (!targetBranch) {
      toast.error(`Branch '${targetBranchName}' not found`);
      return;
    }
    
    // Primero hacemos fetch
    get().fetchRemote();
    
    // Luego buscamos si hay cambios en el remoto para la rama
    const remoteRefName = `${repository.remoteName}/${targetBranchName}`;
    const remoteRef = repository.remoteReferences.find(ref => ref.name === remoteRefName);
    
    if (!remoteRef) {
      toast.error(`No remote reference found for branch '${targetBranchName}'`);
      return;
    }
    
    // Si la rama local ya está en el mismo commit que el remoto, no hay nada que hacer
    if (targetBranch.commitId === remoteRef.commitId) {
      toast.info(`Branch '${targetBranchName}' is already up to date`);
      return;
    }
    
    // Ahora hay que hacer merge del remoto a la rama local
    const remoteCommit = repository.commits.find(c => c.id === remoteRef.commitId);
    if (!remoteCommit) {
      toast.error("Remote commit not found in local repository");
      return;
    }
    
    const localCommit = repository.commits.find(c => c.id === targetBranch.commitId);
    if (!localCommit) {
      toast.error("Local commit not found");
      return;
    }
    
    // Creamos un nuevo commit de merge
    const mergeCommitId = generateId();
    const mergeCommit: GitCommit = {
      id: mergeCommitId,
      message: `Merge branch '${remoteRefName}' into ${targetBranchName}`,
      content: remoteCommit.content, // Tomamos el contenido del remoto
      timestamp: Date.now(),
      parentIds: [targetBranch.commitId, remoteRef.commitId]
    };
    
    // Actualizamos la rama local para que apunte al nuevo commit
    const updatedBranches = repository.branches.map(branch => 
      branch.name === targetBranchName 
        ? { ...branch, commitId: mergeCommitId, isActive: true } 
        : { ...branch, isActive: false }
    );
    
    set({
      repository: {
        ...repository,
        commits: [...repository.commits, mergeCommit],
        branches: updatedBranches,
        HEAD: mergeCommitId
      },
      workingChanges: remoteCommit.content,
      stagedChanges: null
    });
    
    toast.success(`Pulled and merged changes from ${remoteRefName} into ${targetBranchName}`);
  },

  // Push: Envía los cambios locales al remoto
  pushToRemote: (branchName?: string) => {
    const { repository } = get();
    
    // Usar la rama activa si no se especifica
    const sourceBranchName = branchName || repository.branches.find(b => b.isActive)?.name;
    
    if (!sourceBranchName) {
      toast.error("No branch selected for push operation");
      return;
    }
    
    const sourceBranch = repository.branches.find(b => b.name === sourceBranchName);
    if (!sourceBranch) {
      toast.error(`Branch '${sourceBranchName}' not found`);
      return;
    }
    
    // Verificar si la rama existe en el remoto
    const remoteRefName = `${repository.remoteName}/${sourceBranchName}`;
    let remoteRef = repository.remoteReferences.find(ref => ref.name === remoteRefName);
    
    // Si no existe, simulamos que estamos creando una nueva rama en el remoto
    const isNewBranch = !remoteRef;
    
    if (isNewBranch) {
      // La rama no existe en el remoto, la creamos
      remoteRef = {
        name: remoteRefName,
        commitId: sourceBranch.commitId
      };
      
      set({
        repository: {
          ...repository,
          remoteReferences: [...repository.remoteReferences, remoteRef],
          lastPushTime: Date.now()
        }
      });
      
      toast.success(`Created new branch '${remoteRefName}' on remote with your commits`);
      return;
    }
    
    // La rama existe, verificar si es un fast-forward (el remoto es ancestro del local)
    // Simplificado: si el remoto no ha avanzado más allá del punto donde lo dejamos
    if (remoteRef && remoteRef.commitId === sourceBranch.commitId) {
      toast.info(`Branch '${sourceBranchName}' is already up to date on remote`);
      return;
    }
    
    // Verificar si podemos hacer un fast-forward
    // En un escenario real, verificaríamos que el commit remoto es ancestro del local
    // Aquí lo simplificamos y asumimos que siempre es posible
    
    // Actualizar la referencia remota para que apunte al commit local
    const updatedRemoteRefs = repository.remoteReferences.map(ref => 
      ref.name === remoteRefName 
        ? { ...ref, commitId: sourceBranch.commitId } 
        : ref
    );
    
    set({
      repository: {
        ...repository,
        remoteReferences: updatedRemoteRefs,
        lastPushTime: Date.now()
      }
    });
    
    toast.success(`Pushed local changes from '${sourceBranchName}' to '${remoteRefName}'`);
  },

  // Conflict resolution
  hasPendingConflict: () => {
    return !!get().repository.pendingMergeConflict;
  },
  
  resolveConflict: (resolvedContent: string) => {
    const { repository } = get();
    const conflict = repository.pendingMergeConflict;
    
    if (!conflict) {
      toast.error("No pending conflict to resolve.");
      return;
    }
    
    // Create a merge commit with the resolved content
    const newCommitId = generateId();
    const mergeCommitMessage = `Merge branch '${conflict.sourceBranch}' into ${conflict.targetBranch}`;
    
    const mergeCommit: GitCommit = {
      id: newCommitId,
      message: mergeCommitMessage,
      content: resolvedContent,
      timestamp: Date.now(),
      parentIds: [conflict.targetCommitId, conflict.sourceCommitId].sort(),
      hasConflict: true // Marcar que este commit resolvió conflictos
    };
    
    // Update the target branch to point to the new merge commit
    const updatedBranches = repository.branches.map(branch => {
      if (branch.name === conflict.targetBranch) {
        return { ...branch, commitId: newCommitId, isActive: true };
      }
      return { ...branch, isActive: false };
    });
    
    // Update the repository with the resolved conflict
    set({
      repository: {
        ...repository,
        commits: [...repository.commits, mergeCommit],
        branches: updatedBranches,
        HEAD: newCommitId,
        pendingMergeConflict: undefined, // Clear the conflict
      },
      workingChanges: resolvedContent,
      stagedChanges: null,
      selectedCommitId: newCommitId,
    });
    
    toast.success(`Conflicts resolved and branch '${conflict.sourceBranch}' merged into '${conflict.targetBranch}'.`);
  },
  
  abortMerge: () => {
    const { repository } = get();
    const conflict = repository.pendingMergeConflict;
    
    if (!conflict) {
      toast.error("No pending conflict to abort.");
      return;
    }
    
    // Find the commit content for the target branch
    const targetCommit = repository.commits.find(c => c.id === conflict.targetCommitId);
    
    if (!targetCommit) {
      toast.error("Could not find target commit to abort merge.");
      return;
    }
    
    // Reset working changes to target branch's content
    set({
      repository: {
        ...repository,
        pendingMergeConflict: undefined, // Clear the conflict
      },
      workingChanges: targetCommit.content,
      stagedChanges: null,
    });
    
    toast.info(`Merge aborted. Branch '${conflict.targetBranch}' remains unchanged.`);
  }
}));

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isGdbEnabled: true,
      isValgrindEnabled: true,
      setGdbEnabled: (enabled: boolean) => set({ isGdbEnabled: enabled }),
      setValgrindEnabled: (enabled: boolean) => set({ isValgrindEnabled: enabled }),
    }),
    {
      name: 'admin-settings',
    }
  )
);

export default useGitStore;

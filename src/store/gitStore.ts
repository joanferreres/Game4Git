import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GitRepository, GitCommit, GitBranch, CodeFile, RemoteReference } from '../types/git';
import { toast } from 'sonner';
import { threeWayMerge } from '../lib/threeWayMerge';

// Result of a merge attempt, so the UI can report what actually happened
// instead of always assuming success.
export type MergeResult =
  | { status: 'fast-forward' | 'merged' | 'conflict' | 'up-to-date' }
  | { status: 'error'; message: string };

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

// Find the common ancestor (merge-base) of two commits
const findMergeBase = (commits: GitCommit[], commit1Id: string, commit2Id: string): GitCommit | null => {
  // Build a set of all ancestors of commit1
  const ancestors1 = new Set<string>();
  const queue1: string[] = [commit1Id];
  
  while (queue1.length > 0) {
    const currentId = queue1.shift()!;
    if (ancestors1.has(currentId)) continue;
    ancestors1.add(currentId);
    
    const commit = commits.find(c => c.id === currentId);
    if (commit) {
      queue1.push(...commit.parentIds);
    }
  }
  
  // BFS from commit2 to find first ancestor that's also in ancestors1
  const queue2: string[] = [commit2Id];
  const visited2 = new Set<string>();
  
  while (queue2.length > 0) {
    const currentId = queue2.shift()!;
    if (visited2.has(currentId)) continue;
    visited2.add(currentId);
    
    if (ancestors1.has(currentId)) {
      return commits.find(c => c.id === currentId) || null;
    }
    
    const commit = commits.find(c => c.id === currentId);
    if (commit) {
      queue2.push(...commit.parentIds);
    }
  }
  
  return null;
};

const isAncestor = (commits: GitCommit[], ancestorId: string, descendantId: string): boolean => {
  if (ancestorId === descendantId) return true;
  const ancestors = new Set<string>();
  const queue = [descendantId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (ancestors.has(currentId)) continue;
    ancestors.add(currentId);
    const commit = commits.find((c) => c.id === currentId);
    if (commit) queue.push(...commit.parentIds);
  }
  return ancestors.has(ancestorId);
};

const resolveCommitRef = (repository: GitRepository, ref: string): GitCommit | null => {
  const normalized = ref.trim().toLowerCase();
  if (normalized === "head") {
    return repository.commits.find((c) => c.id === repository.HEAD) ?? null;
  }
  const tildeMatch = /^head~(\d+)$/.exec(normalized);
  if (tildeMatch) {
    let current = repository.commits.find((c) => c.id === repository.HEAD) ?? null;
    const steps = Number(tildeMatch[1]);
    for (let i = 0; i < steps && current; i++) {
      const parentId = current.parentIds[0];
      current = parentId ? repository.commits.find((c) => c.id === parentId) ?? null : null;
    }
    return current;
  }
  const byId = repository.commits.find((c) => c.id === ref || c.id.startsWith(ref));
  return byId ?? null;
};

interface GitStore {
  repository: GitRepository;
  currentFile: CodeFile;
  workingChanges: string;
  stagedChanges: string | null;
  selectedCommitId: string | null;
  
  // Actions
  createCommit: (message: string) => boolean;
  amendCommit: (message?: string) => boolean;
  revertCommit: (commitId: string) => boolean;
  createBranch: (name: string) => void;
  switchBranch: (name: string) => void;
  updateWorkingChanges: (content: string) => void;
  resetWorkingChanges: () => void;
  resetToRef: (mode: "soft" | "mixed" | "hard", ref: string) => boolean;
  selectCommit: (id: string | null) => void;
  stageChanges: (content: string) => void;
  resetToInitialCommit: () => void;
  mergeBranch: (
    sourceBranchName: string,
    targetBranchName: string,
    options?: { noFf?: boolean }
  ) => MergeResult;
  
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
    if (!stagedChanges) {
      toast.error("Nothing staged. Use 'git add' before committing.");
      return false;
    }
    
    const newCommitId = generateId();
    const activeBranch = repository.branches.find(b => b.isActive);
    
    if (!activeBranch) return false;
    
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
    return true;
  },

  amendCommit: (message?: string) => {
    const { repository, stagedChanges } = get();
    const activeBranch = repository.branches.find((b) => b.isActive);
    if (!activeBranch) {
      toast.error("No active branch to amend.");
      return false;
    }
    const headCommit = repository.commits.find((c) => c.id === activeBranch.commitId);
    if (!headCommit) return false;

    const amendedContent = stagedChanges ?? headCommit.content;
    const amendedMessage = message ?? headCommit.message;

    const updatedCommit: GitCommit = {
      ...headCommit,
      message: amendedMessage,
      content: amendedContent,
      timestamp: Date.now(),
    };

    set({
      repository: {
        ...repository,
        commits: repository.commits.map((c) => (c.id === headCommit.id ? updatedCommit : c)),
      },
      stagedChanges: null,
      workingChanges: amendedContent,
    });
    toast.success("Last commit amended.");
    return true;
  },

  revertCommit: (commitId: string) => {
    const { repository } = get();
    const target =
      repository.commits.find((c) => c.id === commitId || c.id.startsWith(commitId)) ?? null;
    if (!target) {
      toast.error(`Commit '${commitId}' not found.`);
      return false;
    }
    const activeBranch = repository.branches.find((b) => b.isActive);
    if (!activeBranch) return false;

    const headCommit = repository.commits.find((c) => c.id === activeBranch.commitId);
    if (!headCommit) return false;

    // Reverting a commit means undoing the diff it introduced (its parent -> target)
    // and applying that inverse on top of the current HEAD. Modelled as a 3-way
    // merge: base = target, ours = HEAD, theirs = target's parent.
    const parentCommit = target.parentIds[0]
      ? repository.commits.find((c) => c.id === target.parentIds[0]) ?? null
      : null;
    const parentContent = parentCommit?.content ?? '';
    const { content: revertedContent, hasConflict } = threeWayMerge(
      target.content,
      headCommit.content,
      parentContent,
      'HEAD',
      `parent of ${target.id.slice(0, 7)}`
    );

    if (hasConflict) {
      toast.error(
        `Revert of ${target.id.slice(0, 7)} conflicts with later changes. Resolve manually.`
      );
      return false;
    }

    const newCommitId = generateId();
    const revertCommit: GitCommit = {
      id: newCommitId,
      message: `Revert "${target.message}"`,
      content: revertedContent,
      timestamp: Date.now(),
      parentIds: [activeBranch.commitId],
    };

    const updatedBranches = repository.branches.map((branch) =>
      branch.isActive ? { ...branch, commitId: newCommitId } : branch
    );

    set({
      repository: {
        ...repository,
        commits: [...repository.commits, revertCommit],
        branches: updatedBranches,
        HEAD: newCommitId,
      },
      workingChanges: revertedContent,
      stagedChanges: null,
      selectedCommitId: newCommitId,
    });
    toast.success(`Reverted commit ${target.id.slice(0, 7)}`);
    return true;
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

  resetToRef: (mode: "soft" | "mixed" | "hard", ref: string) => {
    const { repository } = get();
    const targetCommit = resolveCommitRef(repository, ref);
    if (!targetCommit) {
      toast.error(`Could not resolve '${ref}'.`);
      return false;
    }

    const activeBranch = repository.branches.find((b) => b.isActive);
    if (!activeBranch) return false;

    // Every reset mode moves the CURRENT BRANCH (and HEAD with it) to the target
    // commit. The modes differ only in what happens to the index and working tree.
    const updatedBranches = repository.branches.map((branch) =>
      branch.isActive ? { ...branch, commitId: targetCommit.id } : branch
    );
    const baseRepo = { ...repository, branches: updatedBranches, HEAD: targetCommit.id };

    if (mode === "soft") {
      // Keep the working tree and the staged index untouched.
      set({ repository: baseRepo, selectedCommitId: null });
      toast.success(`Soft reset to ${ref}.`);
      return true;
    }

    if (mode === "mixed") {
      // Reset the index (unstage), keep the working tree.
      set({ repository: baseRepo, stagedChanges: null, selectedCommitId: null });
      toast.success(`Mixed reset to ${ref}.`);
      return true;
    }

    // Hard: reset the index and the working tree to the target commit.
    set({
      repository: baseRepo,
      workingChanges: targetCommit.content,
      stagedChanges: null,
      selectedCommitId: null,
    });
    toast.success(`Hard reset to ${ref}.`);
    return true;
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
  mergeBranch: (
    sourceBranchName: string,
    targetBranchName: string,
    options?: { noFf?: boolean }
  ) => {
    const { repository } = get();
    const sourceBranch = repository.branches.find(b => b.name === sourceBranchName);
    const targetBranch = repository.branches.find(b => b.name === targetBranchName);

    if (!sourceBranch) {
      const message = `Source branch "${sourceBranchName}" not found.`;
      toast.error(message);
      return { status: 'error', message };
    }

    if (!targetBranch) {
      const message = `Target branch "${targetBranchName}" not found.`;
      toast.error(message);
      return { status: 'error', message };
    }

    if (sourceBranchName === targetBranchName) {
      const message = "Cannot merge a branch into itself.";
      toast.error(message);
      return { status: 'error', message };
    }

    const sourceBranchHeadCommit = repository.commits.find(c => c.id === sourceBranch.commitId);
    const targetBranchHeadCommit = repository.commits.find(c => c.id === targetBranch.commitId);

    if (!sourceBranchHeadCommit || !targetBranchHeadCommit) {
      const message = "Could not find head commits for branches.";
      toast.error(message);
      return { status: 'error', message };
    }

    // Already up to date: the target already contains every commit from source.
    if (
      sourceBranchHeadCommit.id === targetBranchHeadCommit.id ||
      isAncestor(repository.commits, sourceBranchHeadCommit.id, targetBranchHeadCommit.id)
    ) {
      toast.info(`'${targetBranchName}' is already up to date.`);
      return { status: 'up-to-date' };
    }

    // Fast-forward: target has no commits of its own since the branch point,
    // so we just move the target pointer up to the source tip (no merge commit).
    const canFastForward =
      !options?.noFf &&
      isAncestor(repository.commits, targetBranchHeadCommit.id, sourceBranchHeadCommit.id);

    if (canFastForward) {
      const updatedBranches = repository.branches.map((branch) => {
        if (branch.name === targetBranchName) {
          return { ...branch, commitId: sourceBranchHeadCommit.id, isActive: true };
        }
        return { ...branch, isActive: false };
      });
      set({
        repository: {
          ...repository,
          branches: updatedBranches,
          HEAD: sourceBranchHeadCommit.id,
        },
        workingChanges: sourceBranchHeadCommit.content,
        stagedChanges: null,
        selectedCommitId: sourceBranchHeadCommit.id,
      });
      toast.success(`Fast-forward merge of '${sourceBranchName}' into '${targetBranchName}'.`);
      return { status: 'fast-forward' };
    }

    // Three-way merge. "ours" is the branch we merge into (target/HEAD),
    // "theirs" is the branch being merged in (source).
    const mergeBase = findMergeBase(repository.commits, sourceBranch.commitId, targetBranch.commitId);
    const baseContent = mergeBase?.content ?? '';
    const { content: mergedContent, hasConflict } = threeWayMerge(
      baseContent,
      targetBranchHeadCommit.content,
      sourceBranchHeadCommit.content,
      `HEAD (${targetBranchName})`,
      sourceBranchName
    );

    if (hasConflict) {
      set({
        repository: {
          ...repository,
          pendingMergeConflict: {
            sourceCommitId: sourceBranchHeadCommit.id,
            targetCommitId: targetBranchHeadCommit.id,
            sourceBranch: sourceBranchName,
            targetBranch: targetBranchName,
            conflictContent: mergedContent,
          },
        },
        workingChanges: mergedContent,
      });

      toast.error("Merge conflict detected. Please resolve the conflicts and commit the changes.");
      return { status: 'conflict' };
    }

    // Clean merge: record a merge commit whose content combines both sides.
    const newCommitId = generateId();
    const mergeCommit: GitCommit = {
      id: newCommitId,
      message: `Merge branch '${sourceBranchName}' into ${targetBranchName}`,
      content: mergedContent,
      timestamp: Date.now(),
      // First parent is the branch we were on (target), second is the merged-in
      // branch (source) — this preserves Git's first-parent semantics.
      parentIds: [targetBranchHeadCommit.id, sourceBranchHeadCommit.id],
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
    toast.success(`Merged '${sourceBranchName}' into '${targetBranchName}'.`);
    return { status: 'merged' };
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
    // Usar la rama activa si no se especifica
    const targetBranchName =
      branchName || get().repository.branches.find(b => b.isActive)?.name;

    if (!targetBranchName) {
      toast.error("No branch selected for pull operation");
      return;
    }

    // Primero hacemos fetch (esto puede traer nuevos commits del remoto)...
    get().fetchRemote();

    // ...y luego leemos el estado ACTUALIZADO (no la copia previa al fetch).
    const repository = get().repository;
    const targetBranch = repository.branches.find(b => b.name === targetBranchName);
    if (!targetBranch) {
      toast.error(`Branch '${targetBranchName}' not found`);
      return;
    }

    const remoteRefName = `${repository.remoteName}/${targetBranchName}`;
    const remoteRef = repository.remoteReferences.find(ref => ref.name === remoteRefName);
    if (!remoteRef) {
      toast.error(`No remote reference found for branch '${targetBranchName}'`);
      return;
    }

    const remoteCommit = repository.commits.find(c => c.id === remoteRef.commitId);
    const localCommit = repository.commits.find(c => c.id === targetBranch.commitId);
    if (!remoteCommit || !localCommit) {
      toast.error("Could not resolve commits for pull.");
      return;
    }

    // Local already contains the remote tip -> nothing to pull.
    if (
      localCommit.id === remoteCommit.id ||
      isAncestor(repository.commits, remoteCommit.id, localCommit.id)
    ) {
      toast.info(`Branch '${targetBranchName}' is already up to date`);
      return;
    }

    const setActive = (commitId: string) =>
      repository.branches.map(branch =>
        branch.name === targetBranchName
          ? { ...branch, commitId, isActive: true }
          : { ...branch, isActive: false }
      );

    // Fast-forward: local is behind the remote with no local commits of its own.
    if (isAncestor(repository.commits, localCommit.id, remoteCommit.id)) {
      set({
        repository: {
          ...repository,
          branches: setActive(remoteCommit.id),
          HEAD: remoteCommit.id,
        },
        workingChanges: remoteCommit.content,
        stagedChanges: null,
      });
      toast.success(`Fast-forwarded '${targetBranchName}' to ${remoteRefName}.`);
      return;
    }

    // Diverged -> 3-way merge (ours = local, theirs = remote).
    const mergeBase = findMergeBase(repository.commits, localCommit.id, remoteCommit.id);
    const { content: mergedContent, hasConflict } = threeWayMerge(
      mergeBase?.content ?? '',
      localCommit.content,
      remoteCommit.content,
      `HEAD (${targetBranchName})`,
      remoteRefName
    );

    if (hasConflict) {
      set({
        repository: {
          ...repository,
          pendingMergeConflict: {
            sourceCommitId: remoteCommit.id,
            targetCommitId: localCommit.id,
            sourceBranch: remoteRefName,
            targetBranch: targetBranchName,
            conflictContent: mergedContent,
          },
        },
        workingChanges: mergedContent,
      });
      toast.error("Pull produced a merge conflict. Resolve the conflicts and commit.");
      return;
    }

    const mergeCommitId = generateId();
    const mergeCommit: GitCommit = {
      id: mergeCommitId,
      message: `Merge branch '${remoteRefName}' into ${targetBranchName}`,
      content: mergedContent,
      timestamp: Date.now(),
      parentIds: [localCommit.id, remoteCommit.id],
    };

    set({
      repository: {
        ...repository,
        commits: [...repository.commits, mergeCommit],
        branches: setActive(mergeCommitId),
        HEAD: mergeCommitId,
      },
      workingChanges: mergedContent,
      stagedChanges: null,
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
      // First parent = the branch we were on (target), second = merged-in (source).
      parentIds: [conflict.targetCommitId, conflict.sourceCommitId],
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

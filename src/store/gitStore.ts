import { create } from 'zustand';
import { GitRepository, GitCommit, GitBranch, CodeFile } from '../types/git';
import { toast } from 'sonner';

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
    HEAD: initialCommitId
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
    
    // Prevent merging if source is already an ancestor of target (fast-forward possibility, though we always create a merge commit here)
    // Or if target is an ancestor of source (already merged in a sense, or should rebase source)
    // For simplicity, this check is omitted, but in a real system, it would be important.

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
  }
}));

export default useGitStore;

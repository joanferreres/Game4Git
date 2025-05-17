import { create } from 'zustand';
import { GitRepository, GitCommit, GitBranch, CodeFile, RemoteReference } from '../types/git';
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
  
  // Operaciones Remotas
  fetchRemote: () => void;
  pullRemote: (branchName?: string) => void;
  pushToRemote: (branchName?: string) => void;
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

      const randomBranch = branchesToUpdate[Math.floor(Math.random() * branchesToUpdate.length)];
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
    if (remoteRef.commitId === sourceBranch.commitId) {
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
  }
}));

export default useGitStore;

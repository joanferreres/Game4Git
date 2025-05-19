export interface GitCommit {
  id: string;
  message: string;
  content: string;
  timestamp: number;
  parentIds: string[];
  hasConflict?: boolean;
}

export interface GitBranch {
  name: string;
  commitId: string;
  isActive: boolean;
}

export interface RemoteReference {
  name: string;      // Ejemplo: origin/main
  commitId: string;  // El commit al que apunta en el remoto
}

export interface GitRepository {
  commits: GitCommit[];
  branches: GitBranch[];
  HEAD: string; // Current commit ID
  remoteReferences: RemoteReference[]; // Referencias a ramas remotas
  remoteName: string; // Nombre del repositorio remoto (ejemplo: "origin")
  lastFetchTime?: number; // Última vez que se hizo fetch (timestamp)
  lastPushTime?: number; // Última vez que se hizo push (timestamp)
  pendingMergeConflict?: {
    sourceCommitId: string;
    targetCommitId: string;
    sourceBranch: string;
    targetBranch: string;
    conflictContent: string;
    resolvedContent?: string;
  };
}

export interface CodeFile {
  name: string;
  content: string;
  language: string;
}

export type DiffType = {
  type: 'add' | 'remove' | 'unchanged' | 'conflict';
  content: string;
  lineNumber: number;
  isResolved?: boolean;
};


export interface GitCommit {
  id: string;
  message: string;
  content: string;
  timestamp: number;
  parentIds: string[];
}

export interface GitBranch {
  name: string;
  commitId: string;
  isActive: boolean;
}

export interface GitRepository {
  commits: GitCommit[];
  branches: GitBranch[];
  HEAD: string; // Current commit ID
}

export interface CodeFile {
  name: string;
  content: string;
  language: string;
}

export type DiffType = {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  lineNumber: number;
};

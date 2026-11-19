export const GITORYX_OPERATIONS = {
  commit: "git commit",
  branch: "git branch / switch",
  merge: "git merge",
  "fast-forward": "git merge --ff-only",
  remote: "git push / fetch",
  conflict: "merge conflict",
  stash: "git stash",
} as const;

export type GitoryxOperation = keyof typeof GITORYX_OPERATIONS;

export function isGitoryxOperation(value: string | null): value is GitoryxOperation {
  return value !== null && Object.prototype.hasOwnProperty.call(GITORYX_OPERATIONS, value);
}

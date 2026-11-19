import type { GitoryxOperation } from "./gitoryxOperations";

export const gitoryxOperationByExercise = {
  "feature-branch": "branch",
  "remote-workflow": "remote",
  "fast-forward-merge": "fast-forward",
} as const satisfies Record<string, GitoryxOperation>;

export type GitoryxOutroExerciseId = keyof typeof gitoryxOperationByExercise;

export function isGitoryxOutroExercise(id: string): id is GitoryxOutroExerciseId {
  return Object.prototype.hasOwnProperty.call(gitoryxOperationByExercise, id);
}

export function gitoryxOutroStorageKey(exerciseId: GitoryxOutroExerciseId) {
  return `gitoryx-outro-dismissed:${exerciseId}`;
}

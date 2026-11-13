export const GITORX_OUTRO_EXERCISE_IDS = [
  "feature-branch",
  "remote-workflow",
  "fast-forward-merge",
] as const;

export type GitoryxOutroExerciseId = (typeof GITORX_OUTRO_EXERCISE_IDS)[number];

export function isGitoryxOutroExercise(id: string): id is GitoryxOutroExerciseId {
  return (GITORX_OUTRO_EXERCISE_IDS as readonly string[]).includes(id);
}

export const GITORX_OUTRO_STORAGE_PREFIX = "gitoryx-outro-dismissed:";

export function gitoryxOutroStorageKey(exerciseId: string) {
  return `${GITORX_OUTRO_STORAGE_PREFIX}${exerciseId}`;
}

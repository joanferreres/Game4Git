const STORAGE_KEY = "git-exercise-progress";

export type ExerciseProgressEntry = {
  isStarted: boolean;
  isCompleted: boolean;
  completedStepIds: string[];
};

export type ExerciseProgressMap = Record<string, ExerciseProgressEntry>;

export const loadExerciseProgress = (): ExerciseProgressMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ExerciseProgressMap) : {};
  } catch {
    return {};
  }
};

export const saveExerciseProgress = (progress: ExerciseProgressMap) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
};

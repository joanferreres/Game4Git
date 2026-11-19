import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { gitoryxOperationByExercise, gitoryxOutroStorageKey, type GitoryxOutroExerciseId } from "@/lib/gitoryxOutro";

export function GitoryxExerciseOutro({ exerciseId }: { exerciseId: GitoryxOutroExerciseId }) {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(gitoryxOutroStorageKey(exerciseId)) !== "1");
    } catch {
      setVisible(true);
    }
  }, [exerciseId]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(gitoryxOutroStorageKey(exerciseId), "1");
    } catch {
      // The tip stays dismissed until this exercise view remounts.
    }
  }

  return (
    <aside
      className="mt-3 w-full max-w-md rounded-lg border border-sky-200 bg-sky-50 p-4 text-left dark:border-sky-800 dark:bg-sky-950"
      aria-label={t("gitoryx.outro.ariaLabel")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">
            {t(`gitoryx.outro.${exerciseId}.title`)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-sky-900 dark:text-sky-200">
            {t(`gitoryx.outro.${exerciseId}.body`)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mt-2 -mr-2 h-11 w-11 shrink-0 text-sky-800 dark:text-sky-200"
          onClick={dismiss}
          aria-label={t("gitoryx.outro.dismiss")}
        >
          <X aria-hidden size={17} />
        </Button>
      </div>
      <Link
        to={`${localizePath("/gitoryx")}?operation=${gitoryxOperationByExercise[exerciseId]}#practice`}
        className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-sky-800 underline underline-offset-4 dark:text-sky-200"
      >
        {t("gitoryx.start.exerciseLink")}
      </Link>
    </aside>
  );
}

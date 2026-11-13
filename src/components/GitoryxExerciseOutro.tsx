import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import {
  gitoryxOutroStorageKey,
  isGitoryxOutroExercise,
} from "@/lib/gitoryxOutro";

const GITORYX_URL =
  "https://www.gitoryx.com/?utm_source=game4git&utm_medium=outro&utm_campaign=ambassador";
const PROMO_CODE = "GAME4GIT";

interface GitoryxExerciseOutroProps {
  exerciseId: string;
}

export function GitoryxExerciseOutro({ exerciseId }: GitoryxExerciseOutroProps) {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isGitoryxOutroExercise(exerciseId)) {
      setVisible(false);
      return;
    }
    try {
      const dismissed = localStorage.getItem(gitoryxOutroStorageKey(exerciseId)) === "1";
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, [exerciseId]);

  if (!isGitoryxOutroExercise(exerciseId) || !visible) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(gitoryxOutroStorageKey(exerciseId), "1");
    } catch {
      // ignore quota / private mode
    }
    setVisible(false);
  };

  const copyPromo = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="mt-3 w-full max-w-md rounded-lg border border-sky-200 bg-sky-50/90 p-3 text-left dark:border-sky-900/40 dark:bg-sky-950/40"
      role="region"
      aria-label={t("gitoryx.outro.ariaLabel", "Gitoryx tip after exercise")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-sky-900 dark:text-sky-100">
            {t(`gitoryx.outro.${exerciseId}.title`, "You practised this on the CLI")}
          </p>
          <p className="text-[11px] sm:text-xs text-sky-800/90 dark:text-sky-200/90">
            {t(
              `gitoryx.outro.${exerciseId}.body`,
              "In Gitoryx you would see the same changes update on the commit graph."
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0 text-sky-700 hover:text-sky-900 dark:text-sky-300"
          onClick={dismiss}
          aria-label={t("gitoryx.outro.dismiss", "Don't show again")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Button asChild size="sm" className="h-7 text-[11px] sm:text-xs">
          <Link to={localizePath("/gitoryx")}>
            {t("gitoryx.outro.guideCta", "Open Gitoryx guide")}
          </Link>
        </Button>
        <a
          href={GITORYX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
        >
          {t("gitoryx.outro.externalCta", "Open Gitoryx")}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-foreground">
        <span>{t("gitoryx.outro.promoLabel", "Promo:")}</span>
        <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-foreground">
          {PROMO_CODE}
        </code>
        <button
          type="button"
          onClick={copyPromo}
          className="inline-flex items-center gap-0.5 text-sky-700 hover:underline dark:text-sky-300"
          aria-label={t("gitoryx.promo.copyCode", "Copy promo code")}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied
            ? t("gitoryx.promo.copied", "Copied")
            : t("gitoryx.outro.copy", "Copy")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          {t("gitoryx.outro.dismiss", "Don't show again")}
        </button>
      </div>
    </div>
  );
}

export default GitoryxExerciseOutro;

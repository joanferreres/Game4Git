import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SITE_NAME } from "@/config/site";
import { buttonVariants } from "@/lib/button-variants";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { cn } from "@/lib/utils";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border bg-background", className)}>
      <div className="container max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-1.5 font-bold tracking-tight text-foreground sm:justify-start">
              <span className="h-2 w-2 rounded-full bg-orange-brand" aria-hidden />
              <span>{SITE_NAME}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground sm:text-sm sm:justify-end">
            <Link
              to={localizePath("/")}
              className="transition-colors hover:text-foreground"
            >
              {t("nav.guides")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <Link
              to={localizePath("/git-practice-game")}
              className="transition-colors hover:text-foreground"
            >
              {t("landingPages.gitPracticeGame.eyebrow", "Practice Git online")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <Link
              to={localizePath("/git-branch-practice")}
              className="transition-colors hover:text-foreground"
            >
              {t("landingPages.gitBranchPractice.eyebrow", "Git branch practice")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <Link
              to={localizePath("/git-merge-conflicts")}
              className="transition-colors hover:text-foreground"
            >
              {t("landingPages.gitMergeConflicts.eyebrow", "Merge conflicts")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <Link
              to={localizePath("/valgrind-memory-leaks")}
              className="transition-colors hover:text-foreground"
            >
              {t("landingPages.valgrindMemoryLeaks.eyebrow", "Memory leaks")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <Link
              to={localizePath("/playground")}
              className="transition-colors hover:text-foreground"
            >
              {t("nav.playground", "Playground")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <Link
              to={localizePath("/gdb")}
              className="transition-colors hover:text-foreground"
            >
              {t("footer.gdb")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <Link
              to={localizePath("/valgrind")}
              className="transition-colors hover:text-foreground"
            >
              {t("footer.valgrind")}
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              •
            </span>
            <a
              href="mailto:game4git@gmail.com"
              className="transition-colors hover:text-foreground"
            >
              {t("footer.contact")}
            </a>
            <a
              href="https://ko-fi.com/joanferreres"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              ☕ {t("footer.support")}
            </a>
          </div>
        </div>

        <p className="mt-4 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          © {currentYear} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;

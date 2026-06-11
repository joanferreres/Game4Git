import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { ThemeToggle } from "@/components/ThemeToggle";
import NativeLanguageSelect from "@/components/NativeLanguageSelect";

interface AppNavProps {
  variant: "landing" | "inner";
  badge?: string;
  centerBrand?: boolean;
  showPlaygroundCta?: boolean;
}

const AppNav = ({
  variant,
  badge,
  centerBrand = false,
  showPlaygroundCta = false,
}: AppNavProps) => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const showCenteredInnerBrand = variant === "inner" && centerBrand;
  const showStackedMobilePlaygroundCta = variant === "inner" && showPlaygroundCta && !showCenteredInnerBrand;

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        className={
          showCenteredInnerBrand
            ? "container max-w-full px-4 sm:px-6 lg:px-8 h-14 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3"
            : showStackedMobilePlaygroundCta
              ? "container max-w-full px-4 sm:px-6 lg:px-8 min-h-14 py-2 flex flex-wrap items-center justify-between gap-3"
            : "container max-w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4"
        }
      >
        {!showCenteredInnerBrand && (
          <Link
            to={localizePath("/")}
            className="flex items-center gap-1.5 font-bold text-[15px] tracking-tight text-foreground shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-orange-brand" aria-hidden />
            Game4Git
          </Link>
        )}

        {variant === "landing" ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden xs:inline font-mono text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
              {t("nav.gitInitBadge", "git init")}
            </span>
            <Link
              to={localizePath("/playground")}
              className="hidden md:inline text-sm text-foreground font-semibold hover:text-orange-brand transition-colors"
            >
              {t("nav.playground", "Playground")}
            </Link>
            <a
              href="#guides"
              className="hidden md:inline text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              {t("nav.guides", "Guías")}
            </a>
            <ThemeToggle />
            <NativeLanguageSelect />
            <Link
              to={localizePath("/playground")}
              className="bg-orange-brand hover:bg-orange-brand-hover text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {t("nav.playground", "Playground")}
            </Link>
          </div>
        ) : showCenteredInnerBrand ? (
          <>
            <div className="flex min-w-0 items-center gap-3 justify-self-start">
              <Link
                to={localizePath("/")}
                className="text-xs sm:text-sm text-muted-foreground font-medium hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span className="sm:hidden">← {t("nav.guides", "Guías")}</span>
                <span className="hidden sm:inline">{t("nav.backToGuides", "← Volver a guías")}</span>
              </Link>
              {badge && (
                <>
                  <span className="w-px h-4 bg-border" aria-hidden />
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded hidden xs:inline">
                    {badge}
                  </span>
                </>
              )}
            </div>
            {showCenteredInnerBrand && (
              <Link
                to={localizePath("/")}
                className="flex items-center gap-1.5 font-bold text-[15px] tracking-tight text-foreground justify-self-center"
              >
                <span className="w-2 h-2 rounded-full bg-orange-brand" aria-hidden />
                Game4Git
              </Link>
            )}
            <div className="flex items-center gap-1 justify-self-end">
              {showPlaygroundCta && (
                <Link
                  to={localizePath("/playground")}
                  className="hidden sm:inline-flex items-center rounded-lg bg-orange-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-brand-hover"
                >
                  {t("nav.playground", "Playground")}
                </Link>
              )}
              <ThemeToggle />
              <NativeLanguageSelect />
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              to={localizePath("/")}
              className="text-xs sm:text-sm text-muted-foreground font-medium hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span className="sm:hidden">← {t("nav.guides", "Guías")}</span>
              <span className="hidden sm:inline">{t("nav.backToGuides", "← Volver a guías")}</span>
            </Link>
            {badge && (
              <>
                <span className="w-px h-4 bg-border" aria-hidden />
                <span className="font-mono text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded hidden xs:inline">
                  {badge}
                </span>
              </>
            )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {showPlaygroundCta && (
                <Link
                  to={localizePath("/playground")}
                  className="hidden sm:inline-flex items-center rounded-lg bg-orange-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-brand-hover"
                >
                  {t("nav.playground", "Playground")}
                </Link>
              )}
              <ThemeToggle />
              <NativeLanguageSelect />
            </div>
            {showStackedMobilePlaygroundCta && (
              <Link
                to={localizePath("/playground")}
                className="sm:hidden inline-flex w-full items-center justify-center rounded-lg bg-orange-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-brand-hover"
              >
                {t("nav.playground", "Playground")}
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default AppNav;

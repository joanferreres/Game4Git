import { Link } from "react-router-dom";
import { useLocalizedPath } from "@/lib/localizedRoutes";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";

interface AppNavProps {
  variant: "landing" | "inner";
  badge?: string;
}

const AppNav = ({ variant, badge }: AppNavProps) => {
  const localizePath = useLocalizedPath();

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container max-w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to={localizePath("/")}
          className="flex items-center gap-1.5 font-bold text-[15px] tracking-tight text-foreground shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-orange-brand" aria-hidden />
          commitquest
        </Link>

        {variant === "landing" ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden xs:inline font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
              git init
            </span>
            <a
              href="#guides"
              className="hidden md:inline text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              Guías
            </a>
            <Link
              to={localizePath("/playground")}
              className="hidden md:inline text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              Playground
            </Link>
            <ThemeToggle />
            <LanguageSelector />
            <a
              href="#guides"
              className="bg-orange-brand hover:bg-orange-brand-hover text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Empezar →
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to={localizePath("/")}
              className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors flex items-center gap-1"
            >
              ← Volver a guías
            </Link>
            {badge && (
              <>
                <span className="w-px h-4 bg-border" aria-hidden />
                <span className="font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded hidden xs:inline">
                  {badge}
                </span>
              </>
            )}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNav;

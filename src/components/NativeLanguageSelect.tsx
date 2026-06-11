import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  getLocaleFromPathname,
  getLocalizedPath,
  type SupportedLocale,
} from "@/lib/localizedRoutes";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "ca", name: "Català" },
  { code: "fr", name: "Français" },
] as const;

interface NativeLanguageSelectProps {
  className?: string;
}

const NativeLanguageSelect = ({ className }: NativeLanguageSelectProps) => {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocale = getLocaleFromPathname(location.pathname);

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as SupportedLocale;
    const nextPathname = getLocalizedPath(location.pathname, nextLocale);
    const nextUrl = `${nextPathname}${location.search}${location.hash}`;
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;

    if (nextUrl === currentUrl) {
      return;
    }

    try {
      await i18n.changeLanguage(nextLocale);
      navigate(nextUrl);
    } catch (err) {
      console.error("Error changing language", err);
    }
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      aria-label={t("common.selectLanguage", "Select language")}
      className={cn(
        "h-10 min-w-[4.75rem] cursor-pointer appearance-none rounded-md border border-input bg-background bg-[length:0.65rem] bg-[right_0.45rem_center] bg-no-repeat py-1 pl-2 pr-6 text-xs font-semibold uppercase tracking-wide text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.code.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

export default NativeLanguageSelect;

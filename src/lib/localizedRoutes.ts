import { useLocation } from "react-router-dom";
import { SITE_URL } from "@/config/site";

export const SUPPORTED_LOCALES = ["en", "es", "ca", "fr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export const normalizePathname = (pathname: string): string => {
  if (!pathname) {
    return "/";
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalized !== "/" && normalized.endsWith("/")) {
    return normalized.slice(0, -1);
  }

  return normalized;
};

export const ensureTrailingSlash = (pathname: string): string => {
  const suffixStart = pathname.search(/[?#]/);
  const pathOnly = suffixStart === -1 ? pathname : pathname.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : pathname.slice(suffixStart);
  const normalized = pathOnly || "/";

  if (normalized === "/") {
    return `/${suffix}`;
  }

  return `${normalized.endsWith("/") ? normalized : `${normalized}/`}${suffix}`;
};

export const isSupportedLocale = (value: string | null | undefined): value is SupportedLocale =>
  Boolean(value && SUPPORTED_LOCALE_SET.has(value));

export const stripLocalePrefix = (pathname: string): string => {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  if (isSupportedLocale(segments[0])) {
    const stripped = `/${segments.slice(1).join("/")}`;
    return stripped === "/" ? "/" : normalizePathname(stripped);
  }

  return normalized;
};

export const getLocaleFromPathname = (pathname: string): SupportedLocale => {
  const normalized = normalizePathname(pathname);
  const firstSegment = normalized.split("/").filter(Boolean)[0];

  if (isSupportedLocale(firstSegment)) {
    return firstSegment;
  }

  return DEFAULT_LOCALE;
};

export const getLocalizedPath = (pathname: string, locale: SupportedLocale): string => {
  const routePath = stripLocalePrefix(pathname);
  const localized =
    locale === DEFAULT_LOCALE
      ? routePath
      : routePath === "/"
        ? `/${locale}`
        : `/${locale}${routePath}`;

  return ensureTrailingSlash(localized);
};

export const getLocalizedUrl = (pathname: string, locale: SupportedLocale): string =>
  `${SITE_URL}${getLocalizedPath(pathname, locale)}`;

export const getCanonicalUrl = (pathname: string): string => {
  const locale = getLocaleFromPathname(pathname);
  return getLocalizedUrl(pathname, locale);
};

export const getAlternateLinks = (pathname: string) => {
  const routePath = stripLocalePrefix(pathname);
  const defaultUrl = getLocalizedUrl(routePath, DEFAULT_LOCALE);

  return [
    { hrefLang: "x-default", href: defaultUrl },
    ...SUPPORTED_LOCALES.map((locale) => ({
      hrefLang: locale,
      href: getLocalizedUrl(routePath, locale),
    })),
  ];
};

export const useLocalizedPath = () => {
  const location = useLocation();
  const currentLocale = getLocaleFromPathname(location.pathname);

  return (pathname: string, locale: SupportedLocale = currentLocale) => getLocalizedPath(pathname, locale);
};

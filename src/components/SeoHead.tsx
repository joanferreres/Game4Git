import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  getAlternateLinks,
  getCanonicalUrl,
  getLocaleFromPathname,
  type SupportedLocale,
} from "@/lib/localizedRoutes";

type SeoPageKey =
  | "home"
  | "gdb"
  | "valgrind"
  | "gitPracticeGame"
  | "gitBranchPractice"
  | "gitMergeConflicts"
  | "valgrindMemoryLeaks";

const OG_LOCALE_MAP: Record<SupportedLocale, string> = {
  en: "en_US",
  es: "es_ES",
  ca: "ca_ES",
  fr: "fr_FR",
};

const SITE_NAME = "Game4Git";
const OG_IMAGE_URL = "https://game4git.games/og-image.png";
const TWITTER_HANDLE = "@gitgame";

interface SeoHeadProps {
  page: SeoPageKey;
  /** Ruta absoluta desde la raíz del sitio (p. ej. /hero-foo.webp) para acelerar LCP en landings. */
  preloadHeroImage?: string;
  /** p. ej. `image/webp` cuando el preload apunta a WebP. */
  preloadHeroImageType?: string;
}

export const SeoHead = ({ page, preloadHeroImage, preloadHeroImageType }: SeoHeadProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const canonicalUrl = getCanonicalUrl(location.pathname);
  const alternateLinks = getAlternateLinks(location.pathname);
  const title = t(`seo.${page}.title`);
  const description = t(`seo.${page}.description`);

  return (
    <Helmet prioritizeSeoTags>
      {preloadHeroImage ? (
        <link
          rel="preload"
          as="image"
          href={preloadHeroImage}
          type={preloadHeroImageType || undefined}
          fetchPriority="high"
        />
      ) : null}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta name="content-language" content={locale} />
      <link rel="canonical" href={canonicalUrl} />
      {alternateLinks.map((alternate) => (
        <link
          key={alternate.hrefLang}
          rel="alternate"
          hrefLang={alternate.hrefLang}
          href={alternate.href}
        />
      ))}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALE_MAP[locale]} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
    </Helmet>
  );
};

export default SeoHead;

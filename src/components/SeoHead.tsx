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
  | "gitRemoteWorkflow"
  | "gitResetGuide"
  | "valgrindMemoryLeaks"
  | "playground";

const OG_LOCALE_MAP: Record<SupportedLocale, string> = {
  en: "en_US",
  es: "es_ES",
  ca: "ca_ES",
  fr: "fr_FR",
};

const SITE_NAME = "Game4Git";
const SITE_URL = "https://game4git.games";
const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = "@gitgame";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-96.png`,
  sameAs: [],
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export type FaqItem = { q: string; a: string };
export type BreadcrumbItem = { name: string; path: string };

interface SeoHeadProps {
  page: SeoPageKey;
  /** Ruta absoluta desde la raíz del sitio (p. ej. /hero-foo.webp) para acelerar LCP en landings. */
  preloadHeroImage?: string;
  /** p. ej. `image/webp` cuando el preload apunta a WebP. */
  preloadHeroImageType?: string;
  /** OG/Twitter image; por defecto og-image global o hero de landing. */
  ogImage?: string;
  faqItems?: FaqItem[];
  breadcrumbs?: BreadcrumbItem[];
}

const buildFaqSchema = (items: FaqItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
});

const buildBreadcrumbSchema = (items: BreadcrumbItem[], locale: SupportedLocale) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path === "/" && locale !== "en" ? `/${locale}` : item.path}`,
  })),
});

export const SeoHead = ({
  page,
  preloadHeroImage,
  preloadHeroImageType,
  ogImage,
  faqItems,
  breadcrumbs,
}: SeoHeadProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const canonicalUrl = getCanonicalUrl(location.pathname);
  const alternateLinks = getAlternateLinks(location.pathname);
  const title = t(`seo.${page}.title`);
  const description = t(`seo.${page}.description`);
  const imageUrl = ogImage ?? DEFAULT_OG_IMAGE_URL;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: { "@id": SITE_URL },
  };

  const homeFaqItems: FaqItem[] =
    page === "home"
      ? [1, 2, 3, 4].map((index) => ({
          q: t(`home.faq.q${index}`),
          a: t(`home.faq.a${index}`),
        }))
      : [];

  const gdbFaqItems: FaqItem[] =
    page === "gdb"
      ? ([1, 2, 3, 4] as const).map((index) => ({
          q: t(`gdb.faq.q${index}`, ""),
          a: t(`gdb.faq.a${index}`, ""),
        })).filter((item) => item.q && item.a)
      : [];

  const valgrindFaqItems: FaqItem[] =
    page === "valgrind"
      ? ([1, 2, 3, 4] as const).map((index) => ({
          q: t(`valgrind.faq.q${index}`, ""),
          a: t(`valgrind.faq.a${index}`, ""),
        })).filter((item) => item.q && item.a)
      : [];

  const resolvedFaq =
    faqItems ??
    (page === "home"
      ? homeFaqItems
      : page === "gdb"
        ? gdbFaqItems
        : page === "valgrind"
          ? valgrindFaqItems
          : []);
  const faqSchema = resolvedFaq.length > 0 ? buildFaqSchema(resolvedFaq) : null;

  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? buildBreadcrumbSchema(breadcrumbs, locale)
      : null;

  const webApplicationSchema =
    page === "home"
      ? {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: SITE_NAME,
          url: canonicalUrl,
          description,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Any",
          inLanguage: locale,
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
        }
      : null;

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
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALE_MAP[locale]} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      {page === "home" && (
        <>
          <script type="application/ld+json">{JSON.stringify(ORGANIZATION_SCHEMA)}</script>
          <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
        </>
      )}
      {webApplicationSchema ? (
        <script type="application/ld+json">{JSON.stringify(webApplicationSchema)}</script>
      ) : null}
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      {faqSchema ? (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      ) : null}
      {breadcrumbSchema ? (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      ) : null}
    </Helmet>
  );
};

export default SeoHead;

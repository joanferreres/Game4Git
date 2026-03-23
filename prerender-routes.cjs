#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { SITE_URL } = require('./src/config/site.cjs');

const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');
const LOCALES = ['en', 'es', 'ca', 'fr'];
const DEFAULT_LOCALE = 'en';
const OG_LOCALE_MAP = {
  en: 'en_US',
  es: 'es_ES',
  ca: 'ca_ES',
  fr: 'fr_FR',
};

const ROUTES = [
  { key: 'home', path: '/' },
  { key: 'gdb', path: '/gdb' },
  { key: 'valgrind', path: '/valgrind' },
  { key: 'gitPracticeGame', path: '/git-practice-game' },
  { key: 'gitBranchPractice', path: '/git-branch-practice' },
  { key: 'gitMergeConflicts', path: '/git-merge-conflicts' },
  { key: 'valgrindMemoryLeaks', path: '/valgrind-memory-leaks' },
];

const LANDING_ROUTE_CONFIG = {
  gitPracticeGame: {
    primaryHref: (locale) => `${getLocalizedPath('/', locale)}?exercise=feature-branch`,
    secondaryPath: '/',
    related: ['gitBranchPractice', 'gitMergeConflicts', 'gdb'],
  },
  gitBranchPractice: {
    primaryHref: (locale) => `${getLocalizedPath('/', locale)}?exercise=feature-branch`,
    secondaryPath: '/',
    related: ['gitPracticeGame', 'gitMergeConflicts', 'gdb'],
  },
  gitMergeConflicts: {
    primaryHref: (locale) => `${getLocalizedPath('/', locale)}?exercise=merge-conflicts`,
    secondaryPath: '/',
    related: ['gitBranchPractice', 'gitPracticeGame', 'gdb'],
  },
  valgrindMemoryLeaks: {
    primaryHref: (locale) => getLocalizedPath('/valgrind', locale),
    secondaryPath: '/',
    related: ['valgrind', 'gdb', 'gitPracticeGame'],
  },
};

const translations = Object.fromEntries(
  LOCALES.map((locale) => {
    const file = path.join(__dirname, 'src', 'i18n', 'locales', `${locale}.json`);
    return [locale, JSON.parse(fs.readFileSync(file, 'utf8'))];
  })
);

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

function getLocalizedPath(pathname, locale) {
  const normalized = normalizePath(pathname);

  if (locale === DEFAULT_LOCALE) {
    return normalized;
  }

  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}

const getLocalizedUrl = (pathname, locale) => `${SITE_URL}${getLocalizedPath(pathname, locale)}`;

const t = (locale, key, fallback = '') => {
  const value = key.split('.').reduce((acc, segment) => acc && acc[segment], translations[locale]);
  return value ?? fallback;
};

const isLandingRoute = (routeKey) => Object.prototype.hasOwnProperty.call(LANDING_ROUTE_CONFIG, routeKey);

const buildAlternateLinks = (routePath) => {
  const defaultUrl = `${SITE_URL}${normalizePath(routePath)}`;

  return [
    { hreflang: 'x-default', href: defaultUrl },
    ...LOCALES.map((locale) => ({
      hreflang: locale,
      href: getLocalizedUrl(routePath, locale),
    })),
  ];
};

const getRouteTitle = (locale, routeKey) => {
  switch (routeKey) {
    case 'gdb':
      return t(locale, 'gdb.pageTitle');
    case 'valgrind':
      return t(locale, 'valgrind.pageTitle');
    case 'home':
      return t(locale, 'general.title');
    default:
      return t(locale, `landingPages.${routeKey}.heroTitle`);
  }
};

const getRouteDescription = (locale, routeKey) => {
  switch (routeKey) {
    case 'gdb':
      return t(locale, 'gdb.subtitle');
    case 'valgrind':
      return t(locale, 'valgrind.intro.subtitle');
    case 'home':
      return t(locale, 'home.seoIntroShort');
    default:
      return t(locale, `landingPages.${routeKey}.heroDescription`);
  }
};

const buildSeoBlock = (route, locale) => {
  const title = t(locale, `seo.${route.key}.title`);
  const description = t(locale, `seo.${route.key}.description`);
  const canonicalUrl = getLocalizedUrl(route.path, locale);
  const alternateLinks = buildAlternateLinks(route.path)
    .map(
      (alternate) =>
        `    <link data-rh="true" rel="alternate" hreflang="${alternate.hreflang}" href="${escapeHtml(alternate.href)}" />`
    )
    .join('\n');

  return [
    `    <title data-rh="true">${escapeHtml(title)}</title>`,
    `    <meta data-rh="true" name="description" content="${escapeHtml(description)}" />`,
    `    <meta data-rh="true" name="robots" content="index, follow" />`,
    `    <meta data-rh="true" name="content-language" content="${locale}" />`,
    `    <link data-rh="true" rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    alternateLinks,
    `    <meta data-rh="true" property="og:title" content="${escapeHtml(title)}" />`,
    `    <meta data-rh="true" property="og:description" content="${escapeHtml(description)}" />`,
    `    <meta data-rh="true" property="og:type" content="website" />`,
    `    <meta data-rh="true" property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `    <meta data-rh="true" property="og:image" content="${SITE_URL}/og-image.png" />`,
    `    <meta data-rh="true" property="og:site_name" content="Game4Git" />`,
    `    <meta data-rh="true" property="og:locale" content="${OG_LOCALE_MAP[locale]}" />`,
    `    <meta data-rh="true" name="twitter:card" content="summary_large_image" />`,
    `    <meta data-rh="true" name="twitter:title" content="${escapeHtml(title)}" />`,
    `    <meta data-rh="true" name="twitter:description" content="${escapeHtml(description)}" />`,
    `    <meta data-rh="true" name="twitter:image" content="${SITE_URL}/og-image.png" />`,
    `    <meta data-rh="true" name="twitter:site" content="@gitgame" />`,
  ].join('\n');
};

const buildFaqSchemaBlock = (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.a,
      },
    })),
  };
};

const buildStructuredData = (route, locale) => {
  const title = t(locale, `seo.${route.key}.title`);
  const description = t(locale, `seo.${route.key}.description`);
  const url = getLocalizedUrl(route.path, locale);

  if (route.key === 'home') {
    const appSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Game4Git',
      url,
      description,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      inLanguage: locale,
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Game4Git',
        url: SITE_URL,
      },
    };

    const faqSchema = buildFaqSchemaBlock(
      [1, 2, 3, 4].map((index) => ({
        q: t(locale, `home.faq.q${index}`),
        a: t(locale, `home.faq.a${index}`),
      }))
    );

    return [
      '    <script data-rh="true" type="application/ld+json">',
      `      ${JSON.stringify(appSchema)}`,
      '    </script>',
      '    <script data-rh="true" type="application/ld+json">',
      `      ${JSON.stringify(faqSchema)}`,
      '    </script>',
    ].join('\n');
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url,
    description,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Game4Git',
      url: SITE_URL,
    },
  };

  const faqEntries = isLandingRoute(route.key) ? t(locale, `landingPages.${route.key}.faq`, []) : [];
  const faqSchema = buildFaqSchemaBlock(faqEntries);
  const schemaBlocks = [
    '    <script data-rh="true" type="application/ld+json">',
    `      ${JSON.stringify(pageSchema)}`,
    '    </script>',
  ];

  if (faqSchema) {
    schemaBlocks.push(
      '    <script data-rh="true" type="application/ld+json">',
      `      ${JSON.stringify(faqSchema)}`,
      '    </script>'
    );
  }

  return schemaBlocks.join('\n');
};

const buildHomeMarkup = (locale) => {
  const gdbPath = getLocalizedPath('/gdb', locale);
  const valgrindPath = getLocalizedPath('/valgrind', locale);
  const guideRoutes = [
    { key: 'gitPracticeGame', path: '/git-practice-game' },
    { key: 'gitBranchPractice', path: '/git-branch-practice' },
    { key: 'gitMergeConflicts', path: '/git-merge-conflicts' },
    { key: 'valgrindMemoryLeaks', path: '/valgrind-memory-leaks' },
  ];

  return `
      <main class="container min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <header class="mx-auto max-w-3xl text-center">
          <p class="text-sm text-muted-foreground">Game4Git</p>
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${escapeHtml(t(locale, 'general.title'))}</h1>
          <p class="mt-3 text-sm sm:text-base text-muted-foreground">${escapeHtml(t(locale, 'home.seoIntroShort'))}</p>
        </header>
        <section class="mx-auto max-w-3xl mt-8 rounded-xl border bg-card p-6">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'welcome.title'))}</h2>
          <p class="mt-2 text-sm text-muted-foreground">${escapeHtml(t(locale, 'welcome.introShortImproved'))}</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <a class="underline" href="${escapeHtml(gdbPath)}">GDB</a>
            <a class="underline" href="${escapeHtml(valgrindPath)}">Valgrind</a>
          </div>
        </section>
        <section class="mx-auto max-w-6xl mt-8">
          <h2 class="text-xl font-semibold text-center">${escapeHtml(t(locale, 'home.guidesTitle'))}</h2>
          <p class="mt-2 text-sm text-muted-foreground text-center max-w-3xl mx-auto">${escapeHtml(t(locale, 'home.guidesDescription'))}</p>
          <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            ${guideRoutes
              .map(
                (route) => `
            <article class="rounded-xl border bg-card p-4">
              <h3 class="font-medium">${escapeHtml(getRouteTitle(locale, route.key))}</h3>
              <p class="mt-2 text-sm text-muted-foreground">${escapeHtml(getRouteDescription(locale, route.key))}</p>
              <a class="mt-4 inline-flex text-sm underline" href="${escapeHtml(getLocalizedPath(route.path, locale))}">${escapeHtml(t(locale, 'home.guidesPrimaryCta'))}</a>
            </article>`
              )
              .join('')}
          </div>
        </section>
        <section class="mx-auto max-w-3xl mt-8">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'home.faqTitle'))}</h2>
          <dl class="mt-4 space-y-4">
            ${[1, 2, 3, 4]
              .map(
                (index) => `
            <div class="rounded-lg border bg-card p-4">
              <dt class="font-medium">${escapeHtml(t(locale, `home.faq.q${index}`))}</dt>
              <dd class="mt-2 text-sm text-muted-foreground">${escapeHtml(t(locale, `home.faq.a${index}`))}</dd>
            </div>`
              )
              .join('')}
          </dl>
        </section>
      </main>`;
};

const buildGdbMarkup = (locale) => {
  const homePath = getLocalizedPath('/', locale);
  const useCaseKeys = ['useCase1', 'useCase2', 'useCase3', 'useCase4'];
  const cheatsheetItems = ['run', 'break', 'breakLine', 'next', 'step', 'continue', 'print', 'backtrace', 'quit'];
  const useCasesHtml = useCaseKeys
    .map(
      (key) =>
        `<li><strong>${escapeHtml(t(locale, `gdb.commonUseCases.${key}.title`))}:</strong> ${escapeHtml(t(locale, `gdb.commonUseCases.${key}.description`))}</li>`
    )
    .join('\n            ');
  const cheatsheetHtml = cheatsheetItems
    .map((key) => {
      const label = key === 'breakLine' ? 'break file:line' : key;
      const desc = t(locale, `gdb.cheatsheet.items.${key}`);
      return desc ? `<li><code>${escapeHtml(label)}</code> — ${escapeHtml(desc)}</li>` : '';
    })
    .filter(Boolean)
    .join('\n            ');

  return `
      <main class="container min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <header class="mx-auto max-w-3xl text-center">
          <a class="underline text-sm" href="${escapeHtml(homePath)}">${escapeHtml(t(locale, 'common.backToHome', 'Back to Home'))}</a>
          <h1 class="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">${escapeHtml(t(locale, 'gdb.pageTitle'))}</h1>
          <p class="mt-3 text-sm sm:text-base text-muted-foreground">${escapeHtml(t(locale, 'gdb.subtitle'))}</p>
        </header>
        <section class="mx-auto max-w-3xl mt-8 rounded-xl border bg-card p-6">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'gdb.concepts.title'))}</h2>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><strong>${escapeHtml(t(locale, 'gdb.concepts.breakpoints.title'))}:</strong> ${escapeHtml(t(locale, 'gdb.concepts.breakpoints.desc'))}</li>
            <li><strong>${escapeHtml(t(locale, 'gdb.concepts.watchpoints.title'))}:</strong> ${escapeHtml(t(locale, 'gdb.concepts.watchpoints.desc'))}</li>
            <li><strong>${escapeHtml(t(locale, 'gdb.concepts.stack.title'))}:</strong> ${escapeHtml(t(locale, 'gdb.concepts.stack.desc'))}</li>
            <li><strong>${escapeHtml(t(locale, 'gdb.concepts.memory.title'))}:</strong> ${escapeHtml(t(locale, 'gdb.concepts.memory.desc'))}</li>
          </ul>
        </section>
        <section class="mx-auto max-w-3xl mt-8 rounded-xl border bg-card p-6">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'gdb.commonUseCases.title'))}</h2>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            ${useCasesHtml}
          </ul>
        </section>
        <section class="mx-auto max-w-3xl mt-8 rounded-xl border bg-card p-6">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'gdb.cheatsheet.title'))}</h2>
          <p class="mt-2 text-sm text-muted-foreground">${escapeHtml(t(locale, 'gdb.cheatsheet.description'))}</p>
          <ul class="mt-4 space-y-2 text-sm text-muted-foreground">
            ${cheatsheetHtml}
          </ul>
        </section>
      </main>`;
};

const buildValgrindMarkup = (locale) => {
  const homePath = getLocalizedPath('/', locale);
  const errorTypeKeys = ['memoryLeaks', 'invalidAccess', 'uninitializedValue', 'doubleFree', 'mismatchedFree', 'overlappingMemory'];
  const errorTypesHtml = errorTypeKeys
    .map(
      (key) =>
        `<li><strong>${escapeHtml(t(locale, `valgrind.errorTypes.${key}.title`))}:</strong> ${escapeHtml(t(locale, `valgrind.errorTypes.${key}.description`))}</li>`
    )
    .filter((html) => html && !html.includes('undefined'))
    .join('\n            ');
  const commandsHtml = [
    { key: 'basic', titleKey: 'valgrind.commands.basic.title', descKey: 'valgrind.commands.basic.description' },
    { key: 'leak', titleKey: 'valgrind.commands.leak.title', descKey: 'valgrind.commands.leak.description' },
    { key: 'perf', titleKey: 'valgrind.commands.perf.title', descKey: 'valgrind.commands.perf.description' },
  ]
    .map(
      (c) =>
        `<li><strong>${escapeHtml(t(locale, c.titleKey))}:</strong> ${escapeHtml(t(locale, c.descKey))}</li>`
    )
    .join('\n            ');

  return `
      <main class="container min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <header class="mx-auto max-w-3xl text-center">
          <a class="underline text-sm" href="${escapeHtml(homePath)}">${escapeHtml(t(locale, 'common.backToHome', 'Back to Home'))}</a>
          <h1 class="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">${escapeHtml(t(locale, 'valgrind.pageTitle'))}</h1>
          <p class="mt-3 text-sm sm:text-base text-muted-foreground">${escapeHtml(t(locale, 'valgrind.intro.subtitle'))}</p>
        </header>
        <section class="mx-auto max-w-3xl mt-8 rounded-xl border bg-card p-6">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'valgrind.tools.title'))}</h2>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><strong>${escapeHtml(t(locale, 'valgrind.tools.tool1.title'))}:</strong> ${escapeHtml(t(locale, 'valgrind.tools.tool1.description'))}</li>
            <li><strong>${escapeHtml(t(locale, 'valgrind.tools.tool2.title'))}:</strong> ${escapeHtml(t(locale, 'valgrind.tools.tool2.description'))}</li>
            <li><strong>${escapeHtml(t(locale, 'valgrind.tools.tool3.title'))}:</strong> ${escapeHtml(t(locale, 'valgrind.tools.tool3.description'))}</li>
            <li><strong>${escapeHtml(t(locale, 'valgrind.tools.tool4.title'))}:</strong> ${escapeHtml(t(locale, 'valgrind.tools.tool4.description'))}</li>
          </ul>
        </section>
        <section class="mx-auto max-w-3xl mt-8 rounded-xl border bg-card p-6">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'valgrind.errorTypes.title'))}</h2>
          <p class="mt-2 text-sm text-muted-foreground">${escapeHtml(t(locale, 'valgrind.errorTypes.description'))}</p>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            ${errorTypesHtml}
          </ul>
        </section>
        <section class="mx-auto max-w-3xl mt-8 rounded-xl border bg-card p-6">
          <h2 class="text-xl font-semibold">${escapeHtml(t(locale, 'valgrind.commands.header.title'))}</h2>
          <p class="mt-2 text-sm text-muted-foreground">${escapeHtml(t(locale, 'valgrind.commands.header.description'))}</p>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            ${commandsHtml}
          </ul>
        </section>
      </main>`;
};

const buildLandingMarkup = (route, locale) => {
  const config = LANDING_ROUTE_CONFIG[route.key];
  const homePath = getLocalizedPath('/', locale);
  const highlights = t(locale, `landingPages.${route.key}.highlights`, []);
  const steps = t(locale, `landingPages.${route.key}.steps`, []);
  const featuredSteps = steps.slice(0, 3);
  const faqs = t(locale, `landingPages.${route.key}.faq`, []);
  const relatedLinks = config.related
    .map((target) => {
      const targetRoute = ROUTES.find((routeItem) => routeItem.key === target);
      const href = targetRoute ? getLocalizedPath(targetRoute.path, locale) : getLocalizedPath('/', locale);

      return `
            <a class="group block rounded-2xl border border-border/60 bg-background/80 p-4 transition-all duration-200" href="${escapeHtml(href)}">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium leading-snug">${escapeHtml(getRouteTitle(locale, target))}</p>
                  <p class="mt-1 text-sm text-muted-foreground leading-relaxed">${escapeHtml(getRouteDescription(locale, target))}</p>
                </div>
                <span class="mt-1 text-sm text-muted-foreground">↗</span>
              </div>
            </a>`;
    })
    .join('');

  return `
      <div class="container relative min-h-screen max-w-full px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <header class="mb-8 sm:mb-10">
          <div class="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a class="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline sm:justify-start" href="${escapeHtml(homePath)}">
              <span>←</span>
              <span>${escapeHtml(t(locale, 'common.backToHome', 'Back to Home'))}</span>
            </a>
            <div class="h-10 w-[92px] self-center rounded-md border border-input bg-background" aria-hidden="true"></div>
          </div>
        </header>

        <main class="mx-auto max-w-6xl space-y-8">
          <section class="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/95 shadow-sm">
            <div class="relative grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10">
              <div class="flex flex-col justify-center">
                <div class="inline-flex max-w-full items-center gap-2 self-start rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-foreground shadow-sm">
                  <span class="text-xs font-medium uppercase tracking-[0.18em] sm:text-sm">${escapeHtml(t(locale, `landingPages.${route.key}.eyebrow`))}</span>
                </div>
                <h1 class="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">${escapeHtml(t(locale, `landingPages.${route.key}.heroTitle`))}</h1>
                <p class="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">${escapeHtml(t(locale, `landingPages.${route.key}.heroDescription`))}</p>
                <div class="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <a class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-foreground px-6 py-3 text-sm font-medium text-background shadow-sm sm:w-auto" href="${escapeHtml(config.primaryHref(locale))}">${escapeHtml(t(locale, `landingPages.${route.key}.primaryCta`))}<span>→</span></a>
                  <a class="inline-flex w-full items-center justify-center rounded-full border border-border/80 bg-background/80 px-6 py-3 text-sm sm:w-auto" href="${escapeHtml(getLocalizedPath(config.secondaryPath, locale))}">${escapeHtml(t(locale, `landingPages.${route.key}.secondaryCta`))}</a>
                </div>
                <div class="mt-6 flex flex-wrap gap-2">
                  ${highlights
                    .map(
                      (highlight, index) => `
                  <div class="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-left text-xs text-muted-foreground shadow-sm sm:text-sm">
                    <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-[11px] font-semibold text-foreground">${index + 1}</span>
                    <span class="leading-relaxed">${escapeHtml(highlight)}</span>
                  </div>`
                    )
                    .join('')}
                </div>
              </div>

              <div class="relative">
                <div class="relative rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-sm sm:p-5">
                  <div class="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">${escapeHtml(t(locale, `landingPages.${route.key}.stepsTitle`))}</p>
                      <p class="mt-1 text-sm text-muted-foreground">${escapeHtml(t(locale, `landingPages.${route.key}.primaryCta`))}</p>
                    </div>
                    <div class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm">•</div>
                  </div>
                  <div class="mt-4 space-y-3">
                    ${featuredSteps
                      .map(
                        (step, index) => `
                    <div class="rounded-2xl border border-border/70 bg-card/80 p-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">${String(index + 1).padStart(2, '0')}</p>
                          <h2 class="mt-2 text-base font-semibold leading-snug sm:text-lg">${escapeHtml(step.title)}</h2>
                          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">${escapeHtml(step.description)}</p>
                        </div>
                        <span class="mt-1 text-sm text-muted-foreground">↗</span>
                      </div>
                    </div>`
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            ${highlights
              .map(
                (highlight, index) => `
            <article class="relative overflow-hidden rounded-xl border border-border/60 bg-card/90 p-6 shadow-sm">
              <div class="absolute inset-x-0 top-0 h-1 bg-border"></div>
              <div class="absolute -right-4 -top-6 text-6xl font-semibold tracking-tight text-muted-foreground/10">${String(index + 1).padStart(2, '0')}</div>
              <div class="relative">
                <div class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background text-foreground shadow-sm">✓</div>
                <h2 class="pt-2 text-lg font-semibold leading-snug">${escapeHtml(highlight)}</h2>
              </div>
            </article>`
              )
              .join('')}
          </section>

          <section class="rounded-[28px] border border-border/60 bg-muted/25 p-5 shadow-sm sm:p-6 lg:p-8">
            <div class="mb-6 flex flex-col gap-2 text-center sm:text-left">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">${escapeHtml(t(locale, `landingPages.${route.key}.eyebrow`))}</p>
              <h2 class="text-2xl font-bold tracking-tight">${escapeHtml(t(locale, `landingPages.${route.key}.stepsTitle`))}</h2>
            </div>
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              ${steps
                .map(
                  (step, index) => `
              <article class="relative h-full overflow-hidden rounded-xl border border-border/60 bg-background/90 shadow-sm">
                <div class="absolute inset-x-0 top-0 h-1 bg-border"></div>
                <div class="p-6">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">${String(index + 1).padStart(2, '0')}</span>
                    <div class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card text-xs font-semibold text-foreground">${index + 1}</div>
                  </div>
                  <h3 class="mt-3 text-lg font-semibold leading-snug">${escapeHtml(step.title)}</h3>
                  <p class="mt-2 text-sm text-muted-foreground leading-relaxed">${escapeHtml(step.description)}</p>
                </div>
              </article>`
                )
                .join('')}
            </div>
          </section>

          <section class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <article class="overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-sm">
              <div class="h-1 w-full bg-border"></div>
              <div class="p-6">
                <h2 class="text-xl font-semibold">${escapeHtml(t(locale, `landingPages.${route.key}.faqTitle`))}</h2>
                <dl class="mt-4 space-y-4">
                  ${faqs
                    .map(
                      (faq) => `
                  <div>
                    <dt class="font-medium">${escapeHtml(faq.q)}</dt>
                    <dd class="mt-2 text-sm text-muted-foreground leading-relaxed">${escapeHtml(faq.a)}</dd>
                  </div>`
                    )
                    .join('')}
                </dl>
              </div>
            </article>

            <article class="overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-sm">
              <div class="h-1 w-full bg-border"></div>
              <div class="p-6">
                <h2 class="text-xl font-semibold">${escapeHtml(t(locale, `landingPages.${route.key}.relatedTitle`))}</h2>
                <p class="mt-2 text-sm text-muted-foreground">${escapeHtml(t(locale, `landingPages.${route.key}.relatedDescription`))}</p>
                <div class="mt-4 space-y-3">
                  ${relatedLinks}
                </div>
              </div>
            </article>
          </section>
        </main>
      </div>`;
};

const buildRouteMarkup = (route, locale) => {
  switch (route.key) {
    case 'gdb':
      return buildGdbMarkup(locale);
    case 'valgrind':
      return buildValgrindMarkup(locale);
    case 'home':
      return buildHomeMarkup(locale);
    default:
      return buildLandingMarkup(route, locale);
  }
};

const addPreloadForIndexCss = (template) => {
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const indexCss = files.find((f) => f.startsWith('Index-') && f.endsWith('.css'));
    if (indexCss) {
      const preload = `\n    <link rel="preload" href="/assets/${indexCss}" as="style">`;
      return template.replace(/(<link rel="preconnect"[^>]+>)/, `$1${preload}`);
    }
  }
  return template;
};

const injectRouteIntoTemplate = (template, route, locale) =>
  addPreloadForIndexCss(template)
    .replace(/<html lang="[^"]*">/, `<html lang="${locale}">`)
    .replace(
      /<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/,
      `<!-- SEO_START -->\n${buildSeoBlock(route, locale)}\n    <!-- SEO_END -->`
    )
    .replace(
      /<!-- STRUCTURED_DATA_START -->[\s\S]*?<!-- STRUCTURED_DATA_END -->/,
      `<!-- STRUCTURED_DATA_START -->\n${buildStructuredData(route, locale)}\n    <!-- STRUCTURED_DATA_END -->`
    )
    .replace('<!-- APP_HTML -->', buildRouteMarkup(route, locale));

const writeHtmlFile = (relativePath, html) => {
  const normalizedPath = relativePath.replace(/^\/+/, '');
  const targetFile = relativePath === '/' ? INDEX_FILE : path.join(DIST_DIR, normalizedPath, 'index.html');
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, html);
};

const buildAdminHtml = (template) =>
  template
    .replace(/<html lang="[^"]*">/, '<html lang="en">')
    .replace(
      /<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/,
      `<!-- SEO_START -->\n    <title data-rh="true">Game4Git Admin</title>\n    <meta data-rh="true" name="description" content="Game4Git admin area." />\n    <meta data-rh="true" name="robots" content="noindex, nofollow" />\n    <link data-rh="true" rel="canonical" href="${SITE_URL}/admin" />\n    <!-- SEO_END -->`
    )
    .replace(/<!-- STRUCTURED_DATA_START -->[\s\S]*?<!-- STRUCTURED_DATA_END -->/, '<!-- STRUCTURED_DATA_START -->\n    <!-- STRUCTURED_DATA_END -->')
    .replace(
      '<!-- APP_HTML -->',
      `
      <main class="container min-h-screen px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <section class="max-w-lg rounded-xl border bg-card p-6 text-center">
          <h1 class="text-3xl font-bold tracking-tight">Game4Git Admin</h1>
          <p class="mt-3 text-sm text-muted-foreground">Administration area for Game4Git.</p>
        </section>
      </main>`
    );

const prerender = () => {
  if (!fs.existsSync(INDEX_FILE)) {
    throw new Error(`Missing build output: ${INDEX_FILE}`);
  }

  const template = fs.readFileSync(INDEX_FILE, 'utf8');

  ROUTES.forEach((route) => {
    LOCALES.forEach((locale) => {
      const outputPath = getLocalizedPath(route.path, locale);
      const html = injectRouteIntoTemplate(template, route, locale);
      writeHtmlFile(outputPath, html);
    });
  });

  writeHtmlFile('/admin', buildAdminHtml(template));
  console.log('✅ Prerender generated for localized routes and admin.');
};

prerender();

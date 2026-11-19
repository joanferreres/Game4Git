import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppNav from "@/components/AppNav";
import SeoHead from "@/components/SeoHead";
import SiteFooter from "@/components/SiteFooter";
import GitoryxInteractiveDemo from "@/components/GitoryxInteractiveDemo";
import { GitoryxQuickStart } from "@/components/GitoryxQuickStart";
import { useLocalizedPath } from "@/lib/localizedRoutes";

import guide from "@/lib/gitoryxGuide.json";
import { isGitoryxOperation } from "@/lib/gitoryxOperations";

export default function GitoryxLearning() {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const { hash, search, key } = useLocation();
  const requestedOperation = new URLSearchParams(search).get("operation");
  const operation = isGitoryxOperation(requestedOperation) ? requestedOperation : null;

  useEffect(() => {
    if (hash !== "#practice" && hash !== "#quick-start") return;
    const section = document.getElementById(hash.slice(1));
    section?.querySelector("h2")?.focus({ preventScroll: true });
    section?.scrollIntoView();
  }, [hash, key]);

  return (
    <div className="container flex min-h-screen max-w-full flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <SeoHead
        page="gitoryx"
        breadcrumbs={[
          { name: t("general.title"), path: localizePath("/") },
          { name: t("gitoryx.pageTitle"), path: localizePath("/gitoryx") },
        ]}
      />
      <AppNav variant="inner" activeMode="gitoryx" />

      <main id="main-content" className="mx-auto mt-4 w-full max-w-6xl space-y-12 pb-14 sm:mt-6 sm:space-y-16">
        <header className="grid items-center gap-6 rounded-xl border border-border/60 bg-surface-warm p-5 dark:bg-muted/20 sm:p-8 md:grid-cols-2 md:gap-10 lg:p-10">
          <div>
            <h1 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {t("gitoryx.start.headline")}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("gitoryx.start.summary")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button asChild variant="brand" className="h-auto min-h-11 whitespace-normal py-2">
                <Link to={{ search, hash: "#quick-start" }}>{t("gitoryx.start.jump")}</Link>
              </Button>
              <Button asChild variant="outline" className="h-auto min-h-11 whitespace-normal rounded-lg py-2">
                <Link to={{ search, hash: "#practice" }}>{t("gitoryx.start.preview")}</Link>
              </Button>
            </div>
          </div>

          <figure className="min-w-0">
            <picture className="block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <source
                type="image/webp"
                srcSet="/guides/gitoryx/commit-graph-light-sm.webp 800w, /guides/gitoryx/commit-graph-light.webp 1241w, /guides/gitoryx/commit-graph-light-2x.webp 2482w"
                sizes="(min-width: 1200px) 630px, (min-width: 768px) 54vw, calc(100vw - 2rem)"
              />
              <img
                src="/guides/gitoryx/commit-graph-light.png"
                alt={t("gitoryx.start.screenshotAlt")}
                className="h-auto w-full"
                width={1241}
                height={789}
                fetchPriority="high"
              />
            </picture>
          </figure>
        </header>

        <section id="practice" aria-labelledby="practice-title" className="scroll-mt-28 border-t border-border pt-10 sm:pt-14">
          <h2 id="practice-title" tabIndex={-1} className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("gitoryx.start.practiceTitle")}</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{t("gitoryx.start.practiceLead")}</p>

          <Tabs key={operation} defaultValue={operation ? "commands" : "tour"} className="mt-5">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted/60 sm:w-fit sm:min-w-80">
              <TabsTrigger value="tour" className="min-h-11 cursor-pointer whitespace-normal rounded-md px-3 text-center data-[state=active]:bg-card data-[state=active]:text-orange-brand-accessible dark:data-[state=active]:text-orange-300">
                {t("gitoryx.start.tourTab")}
              </TabsTrigger>
              <TabsTrigger value="commands" className="min-h-11 cursor-pointer whitespace-normal rounded-md px-3 text-center data-[state=active]:bg-card data-[state=active]:text-orange-brand-accessible dark:data-[state=active]:text-orange-300">
                {t("gitoryx.tabs.cliVisual")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tour">
              <GitoryxInteractiveDemo mode="tour" />
            </TabsContent>
            <TabsContent value="commands">
              <GitoryxInteractiveDemo mode="mapper" initialOperation={operation} />
            </TabsContent>
          </Tabs>
        </section>

        <GitoryxQuickStart />

        <section aria-labelledby="gitoryx-reference-title" className="border-t border-border pt-8">
          <h2 id="gitoryx-reference-title" className="text-2xl font-extrabold tracking-tight">{t("gitoryx.cheatsheet.title")}</h2>
          <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {guide.commands.map(({ cli, key }) => (
              <div key={key} className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
                <dt><code className="inline-flex rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">{cli}</code></dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{t(`gitoryx.cheatsheet.items.${key}`)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
            <a href="https://www.gitoryx.com/tutorials" className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
              {t("gitoryx.start.officialTutorials")}
            </a>
            <Link to={localizePath("/playground")} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
              {t("gitoryx.try.backPlayground")}
            </Link>
          </div>
        </section>

        <section aria-labelledby="gitoryx-faq-title" className="border-t border-border pt-8">
          <h2 id="gitoryx-faq-title" className="text-2xl font-extrabold tracking-tight">{t("gitoryx.faqTitle")}</h2>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {[1, 2, 3, 4].map((index) => (
              <details key={index} className="px-4 sm:px-5">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">
                  {t(`gitoryx.faq.q${index}`)}
                </summary>
                <p className="max-w-prose pb-4 text-sm leading-relaxed text-muted-foreground">
                  {t(`gitoryx.faq.a${index}`)}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter className="mt-auto" />
    </div>
  );
}

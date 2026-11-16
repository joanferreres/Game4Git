import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  GitBranch,
  Lightbulb,
  ListChecks,
  Play,
  Route,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import SeoHead from "@/components/SeoHead";
import SiteFooter from "@/components/SiteFooter";
import GitoryxInteractiveDemo from "@/components/GitoryxInteractiveDemo";
import { useLocalizedPath } from "@/lib/localizedRoutes";

const GITORYX_URL =
  "https://www.gitoryx.com/?utm_source=game4git&utm_medium=guide&utm_campaign=ambassador";
const DOWNLOAD_URL =
  "https://www.gitoryx.com/download?utm_source=game4git&utm_medium=guide&utm_campaign=ambassador";
const PROMO_CODE = "GAME4GIT";

const TUTORIAL_LINKS = [
  {
    key: "commit",
    href: "https://www.gitoryx.com/tutorials/git-commit-basics?utm_source=game4git&utm_medium=guide&utm_campaign=ambassador",
  },
  {
    key: "branch",
    href: "https://www.gitoryx.com/tutorials/git-branch-basics?utm_source=game4git&utm_medium=guide&utm_campaign=ambassador",
  },
  {
    key: "conflict",
    href: "https://www.gitoryx.com/tutorials/how-to-resolve-merge-conflicts?utm_source=game4git&utm_medium=guide&utm_campaign=ambassador",
  },
  {
    key: "terminal",
    href: "https://www.gitoryx.com/tutorials/open-repo-from-terminal?utm_source=game4git&utm_medium=guide&utm_campaign=ambassador",
  },
] as const;

const GitoryxLearning: React.FC = () => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopyError(null);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopyError(t("common.copyError", "Could not copy. Copy it manually."));
    }
  };

  /** CLI stays literal (like GDB cheat sheet); only the visual side is translated. */
  const cheatRows = [
    { cli: "git commit", key: "commit" },
    { cli: "git switch -c <name>", key: "branch" },
    { cli: "git switch <branch>", key: "switch" },
    { cli: "git merge <branch>", key: "merge" },
    { cli: "git fetch / git push", key: "remote" },
    { cli: "git add -p", key: "stage" },
    { cli: "merge conflict", key: "conflict" },
    { cli: "gitoryx", key: "open" },
  ] as const;

  return (
    <div className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <SeoHead
        page="gitoryx"
        breadcrumbs={[
          { name: t("general.title"), path: localizePath("/") },
          { name: t("gitoryx.pageTitle"), path: localizePath("/gitoryx") },
        ]}
      />
      <AppNav variant="inner" activeMode="gitoryx" />

      <main id="main-content" className="max-w-7xl mx-auto w-full">
        <h1 className="sr-only">{t("gitoryx.intro.whatIsTitle", "What is Gitoryx?")}</h1>

        <Tabs defaultValue="introduction" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 h-auto bg-muted/20 rounded-lg">
              <TabsTrigger
                value="introduction"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-orange-brand-accessible dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 rounded-md"
              >
                <Lightbulb className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.introduction", "Introduction")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="cli-visual"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-orange-brand-accessible dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 rounded-md"
              >
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.cliVisual", "CLI ↔ Visual")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="path"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-orange-brand-accessible dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 rounded-md"
              >
                <Route className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.path", "Mini path")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="try"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-orange-brand-accessible dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 rounded-md"
              >
                <Play className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.try", "Try it")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="cheatsheet"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-orange-brand-accessible dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400 rounded-md"
              >
                <ListChecks className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.cheatsheet", "Cheat sheet")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="introduction" className="space-y-4">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                    <GitBranch className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {t("gitoryx.intro.whatIsTitle", "What is Gitoryx?")}
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {t(
                        "gitoryx.intro.whatIsSubtitle",
                        "A native visual Git client that complements CLI practice"
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    {t(
                      "gitoryx.intro.paragraph",
                      "Gitoryx is a native desktop Git client for macOS, Windows and Linux. It shows your repository as a colour-coded commit graph and turns operations people usually drop to the terminal for — interactive rebase, merge conflicts, line-level staging — into visual workflows with undo. Every action maps to a real Git operation and is named after it."
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "gitoryx.intro.paragraph2",
                      "After you practise commands in Game4Git, opening the same ideas in Gitoryx reinforces the mental model — without replacing the CLI."
                    )}
                  </p>

                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-100 dark:border-sky-900/30">
                      <h3 className="font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {t("gitoryx.intro.whyTitle", "Why it helps learning")}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        {[0, 1, 2].map((i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{t(`gitoryx.intro.why.${i}`, "")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                      <h3 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        {t("gitoryx.intro.withCliTitle", "With the CLI playground")}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        {[0, 1, 2].map((i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                            <span>{t(`gitoryx.intro.withCli.${i}`, "")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 not-prose">
                    <p className="mb-3 text-sm font-medium text-foreground">
                      {t(
                        "gitoryx.intro.demoLead",
                        "Try a simplified graph offline — same ideas as the real client, no install required."
                      )}
                    </p>
                    <GitoryxInteractiveDemo mode="mapper" />
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 not-prose">
                    <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <Lightbulb className="h-4 w-4 text-sky-500" />
                      {t("gitoryx.promo.tipTitle", "Tip if you try Gitoryx Pro")}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t(
                        "gitoryx.promo.tipBody",
                        "If you try Gitoryx Pro, the code GAME4GIT gives 20% off for 12 months."
                      )}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <code className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded text-sm font-mono">
                        {PROMO_CODE}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => handleCopy(PROMO_CODE, "promo")}
                        aria-label={t("gitoryx.promo.copyCode", "Copy promo code")}
                      >
                        {copiedId === "promo" ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedId === "promo"
                          ? t("gitoryx.promo.copied", "Copied")
                          : t("gitoryx.promo.copyCode", "Copy code")}
                      </Button>
                      <a
                        href={GITORYX_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                      >
                        {t("gitoryx.promo.open", "Open Gitoryx")}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    {copyError ? (
                      <p className="mt-2 text-xs text-destructive">{copyError}</p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cli-visual" className="space-y-4">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("gitoryx.cliVisual.title", "CLI ↔ visual map")}</CardTitle>
                <CardDescription>
                  {t(
                    "gitoryx.cliVisual.subtitle",
                    "Click a CLI operation to see how the same Git idea updates a visual commit graph — the way Gitoryx names real Git operations."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GitoryxInteractiveDemo mode="mapper" />
                <p className="text-xs text-muted-foreground">
                  {t(
                    "gitoryx.cliVisual.footnote",
                    "This is a teaching mock inside Game4Git. In Gitoryx the graph is colour-coded, virtualised, and tied to your real local repository."
                  )}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="path" className="space-y-4">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("gitoryx.studentPath.title", "Guided path (5–10 min)")}</CardTitle>
                <CardDescription>
                  {t(
                    "gitoryx.studentPath.subtitle",
                    "Step through open repo → commit → branch → merge on a simplified graph."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GitoryxInteractiveDemo mode="tour" />
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    {t("gitoryx.studentPath.afterTitle", "Then try it on a real repo")}
                  </p>
                  <ol className="mt-2 list-decimal pl-5 text-sm text-emerald-800 dark:text-emerald-200 space-y-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <li key={n}>{t(`gitoryx.studentPath.step${n}`, `Step ${n}`)}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="try" className="space-y-4">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("gitoryx.try.title", "Try Gitoryx")}</CardTitle>
                <CardDescription>
                  {t(
                    "gitoryx.try.subtitle",
                    "Open the desktop client on a real repo — no iframe, no account required to start on public repositories."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <figure className="overflow-hidden rounded-lg border border-border bg-muted/20">
                  <img
                    src="/guides/gitoryx/commit-graph-light.png"
                    alt={t(
                      "gitoryx.try.screenshotAlt",
                      "Official Gitoryx commit graph screenshot"
                    )}
                    className="h-auto w-full"
                    loading="lazy"
                    width={1241}
                    height={789}
                  />
                  <figcaption className="px-3 py-2 text-[11px] text-muted-foreground">
                    {t(
                      "gitoryx.try.screenshotCaption",
                      "Screenshot from gitoryx.com — visual commit graph in the desktop client."
                    )}{" "}
                    <a
                      href="https://www.gitoryx.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      gitoryx.com
                    </a>
                  </figcaption>
                </figure>

                <p className="text-sm text-muted-foreground">
                  {t(
                    "gitoryx.try.body",
                    "Download Gitoryx for macOS, Windows or Linux, open a local repository, and watch the commit graph update as you work. Keep practising CLI in Game4Git; use Gitoryx when you want a clearer picture of the same operations. You can also open the current folder with the gitoryx shell helper."
                  )}
                </p>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
                  >
                    {t("gitoryx.try.cta", "Download Gitoryx")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <Link to={localizePath("/playground")}>
                      {t("gitoryx.try.backPlayground", "Back to playground")}
                    </Link>
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    {t("gitoryx.try.tutorialsTitle", "Official CLI ↔ GUI tutorials")}
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {TUTORIAL_LINKS.map((item) => (
                      <li key={item.key}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                        >
                          {t(`gitoryx.try.tutorials.${item.key}`)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t(
                    "gitoryx.try.promoLine",
                    "Pro tip: promo code GAME4GIT — 20% off for 12 months (see Introduction)."
                  )}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cheatsheet" className="space-y-4">
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  {t("gitoryx.cheatsheet.title", "CLI ↔ Gitoryx cheat sheet")}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t(
                    "gitoryx.cheatsheet.subtitle",
                    "Same Git names on both sides. CLI left, what you see in Gitoryx right."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  className="hidden sm:grid grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.4fr)] gap-x-3 gap-y-0 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  aria-hidden
                >
                  <span>{t("gitoryx.cheatsheet.colCli", "CLI")}</span>
                  <span />
                  <span>{t("gitoryx.cheatsheet.colVisual", "In Gitoryx")}</span>
                </div>
                <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-muted/20 overflow-hidden">
                  {cheatRows.map((row) => (
                    <li
                      key={row.key}
                      className="flex flex-col gap-2 p-3 sm:grid sm:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.4fr)] sm:items-center sm:gap-3 sm:p-3.5"
                    >
                      <div className="min-w-0">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">
                          {t("gitoryx.cheatsheet.colCli", "CLI")}
                        </span>
                        <code className="block w-full overflow-x-auto rounded-md bg-sky-100 px-3 py-2.5 font-mono text-[13px] leading-snug text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                          {row.cli}
                        </code>
                      </div>
                      <span
                        className="hidden sm:inline text-muted-foreground/70 font-mono text-xs"
                        aria-hidden
                      >
                        →
                      </span>
                      <div className="min-w-0">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">
                          {t("gitoryx.cheatsheet.colVisual", "In Gitoryx")}
                        </span>
                        <p className="text-sm leading-snug text-foreground">
                          {t(`gitoryx.cheatsheet.items.${row.key}`, "")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t(
                    "gitoryx.cheatsheet.footnote",
                    "Actions keep real Git names. Use CLI for short commands; open Gitoryx when the graph or conflict state is the hard part."
                  )}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <SiteFooter className="mt-auto" />
    </div>
  );
};

export default GitoryxLearning;

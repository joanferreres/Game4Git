import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  GitBranch,
  GitCommit,
  GitMerge,
  Lightbulb,
  ListChecks,
  Play,
  Route,
  Terminal,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import SeoHead from "@/components/SeoHead";
import SiteFooter from "@/components/SiteFooter";
import { useLocalizedPath } from "@/lib/localizedRoutes";

const GITORYX_URL =
  "https://www.gitoryx.com/?utm_source=game4git&utm_medium=guide&utm_campaign=ambassador";
const PROMO_CODE = "GAME4GIT";

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

  const cliVisualRows = [
    {
      cli: "git commit",
      visual: t("gitoryx.cliVisual.commit", "New node appears on the commit graph"),
      icon: GitCommit,
    },
    {
      cli: "git branch / checkout",
      visual: t("gitoryx.cliVisual.branch", "Branch lines split and switch focus"),
      icon: GitBranch,
    },
    {
      cli: "git merge",
      visual: t("gitoryx.cliVisual.merge", "Lines join; conflicts open side-by-side"),
      icon: GitMerge,
    },
    {
      cli: "git push / fetch / pull",
      visual: t("gitoryx.cliVisual.remote", "Local and remote tips move on the graph"),
      icon: Terminal,
    },
  ];

  const studentPath = [1, 2, 3, 4, 5].map((n) =>
    t(`gitoryx.studentPath.step${n}`, `Step ${n}`)
  );

  const cheatItems = [1, 2, 3, 4, 5, 6].map((n) => ({
    title: t(`gitoryx.cheatsheet.item${n}.title`, `Item ${n}`),
    desc: t(`gitoryx.cheatsheet.item${n}.desc`, ""),
  }));

  return (
    <div className="container min-h-screen max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col">
      <SeoHead
        page="gitoryx"
        breadcrumbs={[
          { name: t("general.title"), path: localizePath("/") },
          { name: t("gitoryx.pageTitle"), path: localizePath("/gitoryx") },
        ]}
      />
      <AppNav variant="inner" badge="gitoryx" showPlaygroundCta />

      <main id="main-content" className="max-w-7xl mx-auto w-full">
        <h1 className="sr-only">{t("gitoryx.intro.whatIsTitle", "What is Gitoryx?")}</h1>

        <Tabs defaultValue="introduction" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 h-auto bg-muted/20 rounded-lg">
              <TabsTrigger
                value="introduction"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Lightbulb className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.introduction", "Introduction")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="cli-visual"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.cliVisual", "CLI ↔ Visual")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="path"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Route className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.path", "Mini path")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="try"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
              >
                <Play className="h-4 w-4 flex-shrink-0" />
                <span>{t("gitoryx.tabs.try", "Try it")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="cheatsheet"
                className="flex flex-col sm:flex-row items-center gap-1.5 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md"
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
                      "Gitoryx helps you see what Git is doing: commit graph, branches, merges and remotes as a clear visual picture. After you practise commands in Game4Git, opening the same ideas in a visual client reinforces the mental model."
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
                        <Terminal className="h-4 w-4" />
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

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <Lightbulb className="h-4 w-4 text-sky-500" />
                      {t(
                        "gitoryx.promo.tipTitle",
                        "Tip if you try Gitoryx Pro"
                      )}
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
                    "The same Git ideas you type in Game4Git, seen as graph updates in Gitoryx."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">
                          {t("gitoryx.cliVisual.colCli", "CLI (Game4Git)")}
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          {t("gitoryx.cliVisual.colVisual", "Visual (Gitoryx)")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cliVisualRows.map((row) => {
                        const Icon = row.icon;
                        return (
                          <tr key={row.cli} className="border-t border-border">
                            <td className="px-3 py-3 align-top">
                              <code className="font-mono text-xs sm:text-sm">{row.cli}</code>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="inline-flex items-start gap-2">
                                <Icon className="h-4 w-4 mt-0.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                                <span>{row.visual}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                    "A short loop after you finish a Game4Git challenge."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                  <ol className="list-decimal pl-5 text-sm text-emerald-800 dark:text-emerald-200 space-y-2">
                    {studentPath.map((step, index) => (
                      <li key={index}>{step}</li>
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
                    "Open the desktop client on a real repo — no iframe, no account required to start."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t(
                    "gitoryx.try.body",
                    "Download Gitoryx for macOS, Windows or Linux, open a local repository, and watch the commit graph update as you work. Keep practising CLI in Game4Git; use Gitoryx when you want a clearer picture of the same operations."
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={GITORYX_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
                  >
                    {t("gitoryx.try.cta", "Open Gitoryx")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <Link to={localizePath("/playground")}>
                      {t("gitoryx.try.backPlayground", "Back to playground")}
                    </Link>
                  </Button>
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
              <CardHeader>
                <CardTitle>{t("gitoryx.cheatsheet.title", "Visual operations cheat sheet")}</CardTitle>
                <CardDescription>
                  {t(
                    "gitoryx.cheatsheet.subtitle",
                    "Six common Git moves and how they show up visually."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {cheatItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
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

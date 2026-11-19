import { Download, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GitoryxCopyButton } from "@/components/GitoryxCopyButton";
import { Button } from "@/components/ui/button";
import guide from "@/lib/gitoryxGuide.json";

export function GitoryxQuickStart() {
  const { t } = useTranslation();

  return (
    <section id="quick-start" aria-labelledby="quick-start-title" className="scroll-mt-28 border-t border-border pt-10 sm:pt-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
        <div>
          <h2 id="quick-start-title" tabIndex={-1} className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("gitoryx.start.title")}
          </h2>
          <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{t("gitoryx.start.lead")}</p>
          <Button asChild variant="outline" className="mt-5 min-h-11 gap-2">
            <a href={guide.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download aria-hidden size={16} />
              {t("gitoryx.start.download")}
            </a>
          </Button>
        </div>

        <ol className="relative space-y-7 before:absolute before:bottom-6 before:left-[15px] before:top-4 before:w-px before:bg-border before:content-['']">
          {guide.steps.map((step, index) => (
            <li key={step} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 sm:gap-5">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-700 bg-background font-mono text-sm font-semibold text-sky-800 dark:border-sky-400 dark:text-sky-200">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{t(`gitoryx.start.steps.${step}.title`)}</h3>
                <p className="mt-1 max-w-prose leading-relaxed text-muted-foreground">
                  {t(`gitoryx.start.steps.${step}.body`)}
                </p>
                {step === "clone" && (
                  <>
                    <code className="mt-3 block break-all rounded-md bg-muted px-3 py-2 text-sm">{guide.practiceRepo}</code>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <GitoryxCopyButton value={guide.practiceRepo} label={t("gitoryx.start.copyRepo")} />
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <aside aria-labelledby="gitoryx-pro-title" className="mt-12 grid gap-5 rounded-xl border border-sky-800 bg-sky-950 p-5 text-white sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <div>
          <h3 id="gitoryx-pro-title" className="text-2xl font-bold tracking-tight">{t("gitoryx.offer.title")}</h3>
          <p className="mt-2 max-w-prose text-sky-100">{t("gitoryx.offer.benefit")}</p>
          <p className="mt-3 text-sm font-medium text-sky-100">
            {t("gitoryx.offer.terms")} <code className="ml-1 rounded border border-sky-400 px-2 py-0.5 text-white">{guide.promoCode}</code>
          </p>
          <p className="mt-3 text-sm text-sky-200">{t("gitoryx.offer.disclosure")}</p>
        </div>
        <Button asChild className="min-h-11 h-auto whitespace-normal bg-white px-4 py-2 text-sky-950 hover:bg-sky-100 focus-visible:ring-white">
          <a href={guide.proUrl} target="_blank" rel="sponsored noopener noreferrer">
            {t("gitoryx.offer.cta")}
            <ExternalLink aria-hidden size={16} className="ml-2 shrink-0" />
          </a>
        </Button>
      </aside>
    </section>
  );
}

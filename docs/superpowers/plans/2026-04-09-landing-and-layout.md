# Landing & Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a proper landing page at `/`, move the git playground to `/playground`, and give all inner pages a consistent minimal nav.

**Architecture:** New `AppNav` component (two variants: landing/inner) is shared by all pages. New `Landing.tsx` replaces Index.tsx at `/`. Index.tsx moves to `/playground`. Inner pages (GdbLearning, ValgrindLearning, SeoLandingPage) replace their custom headers with `<AppNav variant="inner">`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, react-router-dom, react-i18next, GSAP + ScrollTrigger, shadcn/ui.

---

### Task 1: Create `src/components/AppNav.tsx`

**Files:**
- Create: `src/components/AppNav.tsx`

- [ ] **Step 1: Create the component**

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to AppNav.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppNav.tsx
git commit -m "feat: add AppNav component with landing and inner variants"
```

---

### Task 2: Create `src/pages/Landing.tsx`

**Files:**
- Create: `src/pages/Landing.tsx`

- [ ] **Step 1: Create the file with all sections**

```tsx
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  GitBranch,
  GitMerge,
  Terminal,
  Shield,
  Cpu,
  ArrowRight,
} from "lucide-react";
import AppNav from "@/components/AppNav";
import SeoHead from "@/components/SeoHead";
import { useLocalizedPath } from "@/lib/localizedRoutes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GUIDE_BADGE =
  "font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded";

const guideColorMap = {
  orange: {
    icon: "bg-[#fff4f1]",
    tag: "bg-[#fff4f1] text-[#c2410c]",
    arrow: "text-orange-brand",
    badge: GUIDE_BADGE,
  },
  sky: {
    icon: "bg-sky-50",
    tag: "bg-sky-50 text-blue-700",
    arrow: "text-blue-600",
    badge: GUIDE_BADGE,
  },
  amber: {
    icon: "bg-amber-50",
    tag: "bg-amber-50 text-amber-700",
    arrow: "text-amber-600",
    badge: GUIDE_BADGE,
  },
  green: {
    icon: "bg-green-50",
    tag: "bg-green-50 text-green-700",
    arrow: "text-green-600",
    badge: GUIDE_BADGE,
  },
  slate: {
    icon: "bg-slate-50",
    tag: "bg-slate-50 text-slate-700",
    arrow: "text-slate-600",
    badge: GUIDE_BADGE,
  },
  teal: {
    icon: "bg-teal-50",
    tag: "bg-teal-50 text-teal-700",
    arrow: "text-teal-600",
    badge: GUIDE_BADGE,
  },
} as const;

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const localizePath = useLocalizedPath();
  const rootRef = useRef<HTMLDivElement>(null);

  const guides = [
    {
      href: localizePath("/git-practice-game"),
      title: t("landingPages.gitPracticeGame.heroTitle"),
      description: t("landingPages.gitPracticeGame.heroDescription"),
      icon: Sparkles,
      color: "orange" as const,
      command: "git practice",
      difficulty: t("home.levelBasic", "Básico"),
    },
    {
      href: localizePath("/git-branch-practice"),
      title: t("landingPages.gitBranchPractice.heroTitle"),
      description: t("landingPages.gitBranchPractice.heroDescription"),
      icon: GitBranch,
      color: "sky" as const,
      command: "git branch",
      difficulty: t("home.levelIntermediate", "Intermedio"),
    },
    {
      href: localizePath("/git-merge-conflicts"),
      title: t("landingPages.gitMergeConflicts.heroTitle"),
      description: t("landingPages.gitMergeConflicts.heroDescription"),
      icon: GitMerge,
      color: "amber" as const,
      command: "git merge",
      difficulty: t("home.levelIntermediate", "Intermedio"),
    },
    {
      href: localizePath("/gdb"),
      title: t("gdb.pageTitle"),
      description: t("gdb.subtitle"),
      icon: Terminal,
      color: "slate" as const,
      command: "gdb",
      difficulty: t("home.levelAdvanced", "Avanzado"),
    },
    {
      href: localizePath("/valgrind"),
      title: t("valgrind.pageTitle"),
      description: t("valgrind.intro.subtitle"),
      icon: Cpu,
      color: "teal" as const,
      command: "valgrind",
      difficulty: t("home.levelAdvanced", "Avanzado"),
    },
    {
      href: localizePath("/valgrind-memory-leaks"),
      title: t("landingPages.valgrindMemoryLeaks.heroTitle"),
      description: t("landingPages.valgrindMemoryLeaks.heroDescription"),
      icon: Shield,
      color: "green" as const,
      command: "valgrind --leak",
      difficulty: t("home.levelAdvanced", "Avanzado"),
    },
  ];

  const faqs = [
    {
      q: "¿Necesito instalar Git?",
      a: "No. Todo funciona en el navegador. Git, GDB y Valgrind están simulados para que puedas practicar sin configurar nada.",
    },
    {
      q: "¿Qué nivel necesito para empezar?",
      a: "Ninguno. Las guías de Git empiezan desde cero. Las de GDB y Valgrind requieren conocimientos básicos de C.",
    },
    {
      q: "¿Está disponible en inglés?",
      a: "Sí. Puedes cambiar el idioma con el selector de la barra de navegación. Actualmente disponible en español, inglés, catalán y francés.",
    },
    {
      q: "¿Es gratis?",
      a: "Sí, completamente gratis y sin registro. Abre una guía y empieza a practicar ahora mismo.",
    },
  ];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 640px)",
        },
        (ctx) => {
          const { animate, desktop } = ctx.conditions as {
            animate: boolean;
            desktop: boolean;
          };
          if (!animate || !desktop) {
            gsap.set(
              "[data-home-header], .home-guide-card, .home-faq-item",
              { clearProps: "all" }
            );
            return;
          }

          gsap.set("[data-home-header]", { autoAlpha: 0, y: 16 });
          gsap.set(".home-guide-card, .home-faq-item", {
            autoAlpha: 0,
            y: 20,
          });

          const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
          tl.to("[data-home-header]", { autoAlpha: 1, y: 0, duration: 0.35 }, 0);

          ScrollTrigger.batch(".home-guide-card", {
            start: "top 90%",
            once: true,
            interval: 0.06,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.05,
                ease: "power2.out",
              });
            },
          });

          ScrollTrigger.batch(".home-faq-item", {
            start: "top 92%",
            once: true,
            interval: 0.06,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.04,
                ease: "power2.out",
              });
            },
          });
        },
        root
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="min-h-screen bg-background">
      <SeoHead page="home" />
      <AppNav variant="landing" />

      {/* Hero */}
      <section
        data-home-header
        className="bg-[#faf9f7] border-b border-border/60"
      >
        <div className="container max-w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-orange-brand mb-4"
                aria-hidden
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-brand" />
                {t("home.eyebrow", "Aprende Git de verdad")}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                {t("general.title")}
              </h1>
              <section
                className="max-w-lg mb-6"
                aria-label={t("home.seoIntroLabel", "App description")}
              >
                <p className="text-sm text-muted-foreground leading-relaxed sm:hidden">
                  {t(
                    "home.seoIntroMobile",
                    "Learn Git by doing with visual commits and guided challenges."
                  )}
                </p>
                <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "home.seoIntroShort",
                    "Learn Git by doing. Visualize branches and merges while running real commands. Try guided challenges or switch to the terminal anytime."
                  )}{" "}
                  <Link
                    to={localizePath("/gdb")}
                    className="underline hover:text-primary"
                  >
                    GDB
                  </Link>{" "}
                  {t("home.seoIntroAnd", "and")}{" "}
                  <Link
                    to={localizePath("/valgrind")}
                    className="underline hover:text-primary"
                  >
                    Valgrind
                  </Link>{" "}
                  {t("home.seoIntroTailShort", "basics included.")}
                </p>
              </section>
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                <a
                  href="#guides"
                  className="inline-flex items-center gap-1.5 bg-orange-brand hover:bg-orange-brand-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Empezar gratis
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </a>
                <Link
                  to={localizePath("/playground")}
                  className="inline-flex items-center gap-1.5 border border-border text-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  Ver playground
                </Link>
              </div>
              {/* Stats row */}
              <div className="hidden sm:flex gap-6 mt-6 pt-5 border-t border-border/60">
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">6</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("home.statGuides", "Guías interactivas")}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">
                    ES · EN
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("home.statLanguages", "Idiomas")}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">0</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("home.statInstalls", "Instalaciones necesarias")}
                  </p>
                </div>
              </div>
            </div>
            {/* Right: terminal snippet */}
            <div className="hidden md:block" aria-hidden>
              <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-4 font-mono text-[12px] leading-[2]">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-slate-500 ml-2">
                    commitquest — terminal
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git init my-project</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span>{" "}
                  <span className="text-slate-500">
                    Initialized empty Git repository
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git commit -m </span>
                  <span className="text-amber-400">"feat: primer commit"</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span>{" "}
                  <span className="text-slate-500">
                    1 file changed — HEAD → main
                  </span>
                </div>
                <div className="border-t border-[#1e293b] mt-2 pt-2 flex gap-2 flex-wrap">
                  <span className="bg-[#fff4f1] text-[#c2410c] text-[10px] px-2 py-0.5 rounded">
                    main
                  </span>
                  <span className="bg-green-950 text-green-400 text-[10px] px-2 py-0.5 rounded">
                    feature/login
                  </span>
                  <span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded">
                    HEAD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guide cards */}
      <section
        id="guides"
        className="container max-w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-brand mb-2">
              Guías interactivas
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">
              {t("home.guidesTitle", "Elige tu guía")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "home.guidesDescription",
                "Start from the exact topic you want to practice and jump straight into the right challenge or debugging guide."
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {guides.map((guide) => {
              const Icon = guide.icon;
              const colors = guideColorMap[guide.color];
              return (
                <Link
                  key={guide.href}
                  to={guide.href}
                  className="home-guide-card group bg-white border border-border rounded-lg p-4 flex flex-col gap-3 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-brand focus-visible:ring-offset-2 transition-all duration-150 hover:-translate-y-0.5"
                  aria-label={guide.title}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.icon}`}
                    >
                      <Icon
                        className="w-4 h-4 text-foreground/70"
                        aria-hidden
                      />
                    </div>
                    <span className={colors.badge}>{guide.command}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground leading-snug mb-1">
                      {guide.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${colors.tag}`}
                    >
                      {guide.difficulty}
                    </span>
                    <span
                      className={`text-sm ${colors.arrow} group-hover:translate-x-0.5 transition-transform`}
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Playground strip */}
      <section className="container max-w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0f172a] rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-mono text-[11px] text-slate-500 mb-3">
                $ git playground --open
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                Practica con el playground
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Editor de código, árbol de commits y controles de Git en una
                sola pantalla. Sin configurar nada.
              </p>
              <Link
                to={localizePath("/playground")}
                className="inline-flex items-center gap-2 bg-orange-brand hover:bg-orange-brand-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                Abrir playground
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
            <div className="hidden md:block" aria-hidden>
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-4 font-mono text-[11px] leading-[1.8] text-slate-400">
                <div className="flex gap-1.5 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#334155]" />
                  <span className="w-2 h-2 rounded-full bg-[#334155]" />
                  <span className="w-2 h-2 rounded-full bg-[#334155]" />
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git branch feature/nav</span>
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git checkout feature/nav</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span>{" "}
                  <span className="text-slate-500">Switched to branch 'feature/nav'</span>
                </div>
                <div>
                  <span className="text-slate-500">$</span>{" "}
                  <span className="text-slate-200">git merge main</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span>{" "}
                  <span className="text-slate-500">Already up to date.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container max-w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {faqs.map((faq, i) => (
              <div key={i} className="home-faq-item p-5 bg-white">
                <p className="text-sm font-semibold text-foreground mb-1.5">
                  {faq.q}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container max-w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-bold text-[15px] tracking-tight text-foreground">
            <span className="w-2 h-2 rounded-full bg-orange-brand" aria-hidden />
            commitquest
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} commitquest
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Link
              to={localizePath("/")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to Landing.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat: add Landing page with hero, 6 guide cards, playground strip, FAQ"
```

---

### Task 3: Update routing in `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add Landing lazy import after the existing imports**

In `src/App.tsx`, after line `const Admin = lazy(() => import("./pages/Admin"));`, add:

```tsx
const Landing = lazy(() => import("./pages/Landing"));
```

- [ ] **Step 2: Update `localizedPageDefinitions`**

Replace:
```tsx
const localizedPageDefinitions = [
  { path: "/", component: Index },
  { path: "/gdb", component: GdbLearning },
```

With:
```tsx
const localizedPageDefinitions = [
  { path: "/", component: Landing },
  { path: "/playground", component: Index },
  { path: "/gdb", component: GdbLearning },
```

- [ ] **Step 3: Verify it compiles**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: route Landing to /, Index to /playground"
```

---

### Task 4: Update `src/pages/Index.tsx` (playground)

Remove the hero section, remove the guide cards section, add AppNav, update GSAP.

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Add AppNav import**

At the top of `src/pages/Index.tsx`, add after the existing imports:

```tsx
import AppNav from "@/components/AppNav";
```

- [ ] **Step 2: Remove unused imports**

In the import list, remove: `ThemeToggle`, `LanguageSelector`, `Bug`, `Shield`, `Sparkles`.

The import line for icons currently contains many items. After the hero and guide cards are removed, `ThemeToggle`, `LanguageSelector`, `Bug`, `Shield`, `Sparkles` become unused. Keep all other icons since they're used in the Sheet (how-to-use panel) or other sections.

Find the import block and remove those 5 specific items. The existing import line:
```tsx
import { Info, Sparkles, Play, Plus, ArrowDownUp, Upload, DownloadCloud, GitBranch as GitBranchIcon, GitMerge as GitMergeIcon, GitCommit as GitCommitIcon, Terminal as TerminalIcon, BookOpen, HelpCircle, CheckCircle2, ArrowUpRight } from "lucide-react";
```
Should become:
```tsx
import { Info, Play, Plus, ArrowDownUp, Upload, DownloadCloud, GitBranch as GitBranchIcon, GitMerge as GitMergeIcon, GitCommit as GitCommitIcon, Terminal as TerminalIcon, BookOpen, HelpCircle, CheckCircle2, ArrowUpRight } from "lucide-react";
```

Also remove:
```tsx
import { ThemeToggle } from "@/components/ThemeToggle";
```
And:
```tsx
import LanguageSelector from "@/components/LanguageSelector";
```

- [ ] **Step 3: Remove `gdbPath`, `valgrindPath` and the guide path variables**

In the GitGame component body, remove these lines (they're only used in the hero and guide cards which are being deleted):
```tsx
const gdbPath = localizePath("/gdb");
const valgrindPath = localizePath("/valgrind");
const gitPracticeGamePath = localizePath("/git-practice-game");
const gitBranchPracticePath = localizePath("/git-branch-practice");
const gitMergeConflictsPath = localizePath("/git-merge-conflicts");
const valgrindMemoryLeaksPath = localizePath("/valgrind-memory-leaks");
```

Also remove the `featuredGuides` array (lines 126–163) and the `GUIDE_BADGE` + `guideColorMap` constants (lines 240–246).

- [ ] **Step 4: Remove `isGdbEnabled` and `isValgrindEnabled` from the admin store destructure**

Find:
```tsx
const { isGdbEnabled, isValgrindEnabled, setGdbEnabled, setValgrindEnabled } = useAdminStore();
```
Replace with:
```tsx
const { setGdbEnabled, setValgrindEnabled } = useAdminStore();
```

- [ ] **Step 5: Update the GSAP animation**

The GSAP `useGSAP` block currently animates `[data-home-header]`, `[data-home-strip]`, `[data-home-panel]`, `[data-home-controls]`, `.home-guide-card`, `.home-faq-item`.

After removing the hero and guide cards, only `[data-home-strip]`, `[data-home-panel]`, and `[data-home-controls]` remain on this page.

Find and replace the GSAP set call:
```tsx
gsap.set("[data-home-header], [data-home-strip], [data-home-panel], [data-home-controls]", {
  autoAlpha: 0,
  y: 16,
});
gsap.set(".home-guide-card, .home-faq-item", { autoAlpha: 0, y: 20 });
```
With:
```tsx
gsap.set("[data-home-strip], [data-home-panel], [data-home-controls]", {
  autoAlpha: 0,
  y: 16,
});
```

Find and replace the GSAP timeline:
```tsx
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
tl.to("[data-home-header]", { autoAlpha: 1, y: 0, duration: 0.3 }, 0)
  .to("[data-home-strip]", { autoAlpha: 1, y: 0, duration: 0.28 }, "<0.05")
  .to("[data-home-panel]", { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07 }, "<0.1")
  .to("[data-home-controls]", { autoAlpha: 1, y: 0, duration: 0.3 }, "<0.12");
```
With:
```tsx
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
tl.to("[data-home-strip]", { autoAlpha: 1, y: 0, duration: 0.28 }, 0)
  .to("[data-home-panel]", { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07 }, "<0.1")
  .to("[data-home-controls]", { autoAlpha: 1, y: 0, duration: 0.3 }, "<0.12");
```

Also find and replace the clearProps call:
```tsx
gsap.set(
  "[data-home-header], [data-home-strip], [data-home-panel], [data-home-controls], .home-guide-card, .home-faq-item",
  { clearProps: "all" }
);
```
With:
```tsx
gsap.set(
  "[data-home-strip], [data-home-panel], [data-home-controls]",
  { clearProps: "all" }
);
```

Remove the `ScrollTrigger.batch(".home-guide-card", ...)` and `ScrollTrigger.batch(".home-faq-item", ...)` blocks entirely (they reference elements that no longer exist on this page).

- [ ] **Step 6: Remove the hero header from JSX**

In the JSX return, find and remove the entire `<header data-home-header>` block (the two-column hero grid with logo, ThemeToggle, LanguageSelector, h1, description, CTAs, stats, terminal snippet). This is the section starting at:
```tsx
<header data-home-header className="mb-4 sm:mb-6 relative">
```
and ending at the closing `</header>` (approximately 100 lines).

Also remove the DeferUntilAfterPaint wrapper that wraps ThemeToggle and LanguageSelector inside that header.

- [ ] **Step 7: Remove the guide cards section from JSX**

Find and remove the `<DeferUntilAfterPaint>` block that wraps the guide cards section (the one with `<section className="mt-6 mx-auto max-w-6xl w-full min-h-[340px]">` and the `.home-guide-card` links). This includes the fallback skeleton and the actual section.

- [ ] **Step 8: Add AppNav at top of JSX**

In the return JSX, immediately after `<div ref={rootRef} className="container ...">`, add:

```tsx
<AppNav variant="inner" badge="git playground" />
```

- [ ] **Step 9: Verify it compiles**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "refactor: remove hero and guide cards from Index, add AppNav inner"
```

---

### Task 5: Update `src/components/SeoLandingPage.tsx`

Replace the custom sticky header with `<AppNav variant="inner" badge={config.badge} />`, remove gradient decoration, add `badge` and `color` fields to config.

**Files:**
- Modify: `src/components/SeoLandingPage.tsx`

- [ ] **Step 1: Add AppNav import**

Add after the existing imports:
```tsx
import AppNav from "@/components/AppNav";
```

- [ ] **Step 2: Add `badge` and `color` to `LandingPageConfig` interface**

Find:
```tsx
interface LandingPageConfig {
  path: string;
  seoKey: LandingPageKey;
  accent: string;
  accentSolid: string;
  softAccent: string;
  surfaceAccent: string;
  icon: typeof Sparkles;
  primaryAction: { type: "exercise"; exercise: ExerciseId } | { type: "path"; path: string };
  secondaryPath: string;
  related: RelatedPageTarget[];
}
```
Replace with:
```tsx
interface LandingPageConfig {
  path: string;
  seoKey: LandingPageKey;
  badge: string;
  color: "orange" | "sky" | "amber" | "green";
  icon: typeof Sparkles;
  primaryAction: { type: "exercise"; exercise: ExerciseId } | { type: "path"; path: string };
  secondaryPath: string;
  related: RelatedPageTarget[];
}
```

- [ ] **Step 3: Update `PAGE_CONFIG` entries**

Replace the entire `PAGE_CONFIG` object:
```tsx
const PAGE_CONFIG: Record<LandingPageKey, LandingPageConfig> = {
  gitPracticeGame: {
    path: "/git-practice-game",
    seoKey: "gitPracticeGame",
    badge: "git practice",
    color: "orange",
    icon: Sparkles,
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitBranchPractice", "gitMergeConflicts", "valgrindMemoryLeaks"],
  },
  gitBranchPractice: {
    path: "/git-branch-practice",
    seoKey: "gitBranchPractice",
    badge: "git branch",
    color: "sky",
    icon: GitBranch,
    primaryAction: { type: "exercise", exercise: "feature-branch" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitPracticeGame", "gitMergeConflicts", "valgrindMemoryLeaks"],
  },
  gitMergeConflicts: {
    path: "/git-merge-conflicts",
    seoKey: "gitMergeConflicts",
    badge: "git merge",
    color: "amber",
    icon: Swords,
    primaryAction: { type: "exercise", exercise: "merge-conflicts" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitPracticeGame", "gitBranchPractice", "valgrindMemoryLeaks"],
  },
  valgrindMemoryLeaks: {
    path: "/valgrind-memory-leaks",
    seoKey: "valgrindMemoryLeaks",
    badge: "valgrind",
    color: "green",
    icon: ShieldAlert,
    primaryAction: { type: "path", path: "/valgrind" },
    secondaryPath: "/",
    related: ["gdb", "valgrind", "gitPracticeGame", "gitBranchPractice", "gitMergeConflicts"],
  },
};
```

- [ ] **Step 4: Update `RELATED_META` to remove gradient accents**

Replace:
```tsx
const RELATED_META: Record<RelatedPageTarget, RelatedMeta> = {
  home:                { icon: Home,        accent: "from-slate-500 to-slate-700" },
  gdb:                 { icon: Terminal,    accent: "from-slate-500 via-zinc-600 to-stone-600" },
  valgrind:            { icon: Cpu,         accent: "from-cyan-500 via-teal-500 to-sky-600" },
  gitPracticeGame:     { icon: Sparkles,    accent: "from-amber-500 via-orange-500 to-rose-500" },
  gitBranchPractice:   { icon: GitBranch,   accent: "from-sky-500 via-cyan-500 to-blue-600" },
  gitMergeConflicts:   { icon: Swords,      accent: "from-fuchsia-500 via-violet-500 to-purple-600" },
  valgrindMemoryLeaks: { icon: ShieldAlert, accent: "from-emerald-500 via-teal-500 to-green-600" },
};
```

The `RelatedMeta` type and `RELATED_META` will still need an `accent` field if used in badge rendering below — grep the file for how `RELATED_META` is used in JSX. If `accent` is used in a gradient Badge, replace that Badge with a plain border Badge. Update `RelatedMeta`:

```tsx
type RelatedMeta = { icon: typeof Sparkles; accent: string };
```

Leave this type as-is (accent is still referenced in JSX when rendering related page badges). The goal is only to update the gradient strings to solid Tailwind classes. Replace each `accent` value with a solid bg color class string:
```tsx
const RELATED_META: Record<RelatedPageTarget, RelatedMeta> = {
  home:                { icon: Home,        accent: "bg-slate-100 text-slate-700" },
  gdb:                 { icon: Terminal,    accent: "bg-slate-100 text-slate-700" },
  valgrind:            { icon: Cpu,         accent: "bg-teal-50 text-teal-700" },
  gitPracticeGame:     { icon: Sparkles,    accent: "bg-[#fff4f1] text-[#c2410c]" },
  gitBranchPractice:   { icon: GitBranch,   accent: "bg-sky-50 text-blue-700" },
  gitMergeConflicts:   { icon: Swords,      accent: "bg-amber-50 text-amber-700" },
  valgrindMemoryLeaks: { icon: ShieldAlert, accent: "bg-green-50 text-green-700" },
};
```

Then find where `RELATED_META[target].accent` is used in JSX to render a badge. It will look something like:
```tsx
className={cn("rounded-full ... bg-gradient-to-r", relatedMeta.accent, "text-white")}
```
Replace with:
```tsx
className={cn("rounded-full border border-border px-3 py-1 text-[11px] font-semibold", relatedMeta.accent)}
```
(Remove the `text-white` since accent now includes its own text color.)

- [ ] **Step 5: Remove gradient decorative divs**

Find and remove the three `pointer-events-none absolute` gradient divs that appear right after the `<div ref={rootRef}>` opener:
```tsx
<div
  className={`pointer-events-none absolute inset-x-0 -top-24 h-[36rem] bg-gradient-to-b ${config.softAccent} blur-3xl`}
/>
<div
  className={`pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-gradient-to-br ${config.accent} opacity-[0.18] blur-3xl`}
/>
<div
  className={`pointer-events-none absolute -left-20 top-[28rem] h-64 w-64 rounded-full bg-gradient-to-br ${config.accent} opacity-[0.12] blur-3xl`}
/>
```

- [ ] **Step 6: Replace custom header with AppNav**

Find the `<header className="sticky top-3 z-30 ..." data-landing-header>` block (it contains the BookOpen logo link and ThemeToggle/LanguageSelector). Remove that entire `<header>...</header>` block.

Immediately above where the `<header>` was (before `<div className="container relative ...">`), add:
```tsx
<AppNav variant="inner" badge={config.badge} />
```

- [ ] **Step 7: Replace gradient eyebrow Badge in hero**

Find the Badge usage in the hero section that uses `config.accent`:
```tsx
<Badge
  variant="secondary"
  className={cn(
    "rounded-full border-0 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
    `bg-gradient-to-r ${config.accent} text-white shadow-md`
  )}
>
  {t(`landingPages.${pageKey}.eyebrow`)}
</Badge>
```

Replace with:
```tsx
<Badge
  variant="secondary"
  className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] bg-orange-brand/10 text-orange-brand"
>
  {t(`landingPages.${pageKey}.eyebrow`)}
</Badge>
```

- [ ] **Step 8: Remove unused imports**

Remove `Home` from the lucide-react import if it only appeared in RELATED_META (which no longer uses it as an icon rendered in JSX — verify this). Actually keep it if it's still in RELATED_META icon field even if not rendered. Check the JSX for `relatedMeta.icon` usage; if it renders `<relatedMeta.icon>`, `Home` is still needed.

Remove `ThemeToggle` import if it was only used in the header.
Remove `LanguageSelector` import if it was only used in the header.
Remove `BookOpen` import if it was only used in the header Link icon.

- [ ] **Step 9: Verify it compiles**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors. If TypeScript complains about `config.accent`, `config.accentSolid`, etc. being used elsewhere, search for all usages of those fields and replace/remove each one.

- [ ] **Step 10: Commit**

```bash
git add src/components/SeoLandingPage.tsx
git commit -m "refactor: replace SeoLandingPage header with AppNav, remove gradient config"
```

---

### Task 6: Update `src/pages/GdbLearning.tsx`

**Files:**
- Modify: `src/pages/GdbLearning.tsx`

- [ ] **Step 1: Add AppNav import**

Add after the existing imports:
```tsx
import AppNav from "@/components/AppNav";
```

- [ ] **Step 2: Remove the custom header from JSX**

Find and remove the `<header className="mb-4 sm:mb-6">` block. It looks like:
```tsx
<header className="mb-4 sm:mb-6">
  <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <Link
      to={homePath}
      className="inline-flex items-center justify-center text-blue-600 dark:text-blue-400 hover:underline font-medium sm:justify-start"
    >
      ← {t('common.backToHome', 'Back to Home')}
    </Link>
    <div className="flex items-center justify-center gap-2 sm:justify-end">
      <ThemeToggle />
      <LanguageSelector />
    </div>
  </div>
  <div className="mt-6 text-center sm:mt-8">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('gdb.pageTitle')}</h1>
    <p className="text-xs sm:text-sm text-muted-foreground mt-1 md:mt-2">
      {t('gdb.subtitle')}
    </p>
  </div>
</header>
```

Remove the entire block.

- [ ] **Step 3: Add AppNav before the main content**

In the return JSX, immediately after `<div className="container min-h-screen max-w-full ...">`, add:

```tsx
<AppNav variant="inner" badge="gdb" />
```

- [ ] **Step 4: Remove now-unused imports**

Remove `ThemeToggle` and `LanguageSelector` imports. Remove `Link` import if it's only used in that header (check the rest of the file for other `<Link>` usages first — if none, remove it). Also remove `homePath` variable if it's no longer used (`const homePath = localizePath("/")`).

- [ ] **Step 5: Verify it compiles**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/GdbLearning.tsx
git commit -m "refactor: replace GdbLearning header with AppNav inner"
```

---

### Task 7: Update `src/pages/ValgrindLearning.tsx`

**Files:**
- Modify: `src/pages/ValgrindLearning.tsx`

- [ ] **Step 1: Add AppNav import**

```tsx
import AppNav from "@/components/AppNav";
```

- [ ] **Step 2: Remove custom header from JSX**

Find and remove the `<header className="mb-4 sm:mb-6">` block:
```tsx
<header className="mb-4 sm:mb-6">
  <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <Link
      to={homePath}
      className="inline-flex items-center justify-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors sm:justify-start"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      {t('common.backToHome', 'Back to Home')}
    </Link>
    <div className="flex items-center justify-center gap-2 sm:justify-end">
      <ThemeToggle />
      <LanguageSelector />
    </div>
  </div>
</header>
```

- [ ] **Step 3: Add AppNav before main content**

Immediately after `<div className="container min-h-screen max-w-full ...">`, add:

```tsx
<AppNav variant="inner" badge="valgrind" />
```

- [ ] **Step 4: Remove now-unused imports and variables**

Remove `ThemeToggle`, `LanguageSelector`, `Link` imports (verify `Link` is not used elsewhere in the file). Remove `homePath` variable. Remove `useLocalizedPath` import if `localizePath` is not used elsewhere.

- [ ] **Step 5: Verify it compiles**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 6: Run the dev server to manually verify routing**

```bash
cd /Users/joanferreres/Desktop/commit-quest-visualizer && npm run dev &
sleep 3
curl -s http://localhost:5173/ | grep -o '<title>[^<]*</title>' | head -3
```

Expected: dev server starts, title shows.

- [ ] **Step 7: Commit**

```bash
git add src/pages/ValgrindLearning.tsx
git commit -m "refactor: replace ValgrindLearning header with AppNav inner"
```

# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the gradient-heavy AI-generated aesthetic with a professional, typographically-strong design using git-orange (#f05133), DM Sans, and clean bordered cards — without touching SEO, content, or internal educational page layouts.

**Architecture:** Update design tokens globally (CSS variables + Tailwind), load DM Sans via `<link>` in `index.html`, then rework `Index.tsx` in three targeted passes: featured guide cards, hero header, and gradient cleanup. Each task is independently committable.

**Tech Stack:** React 18 + TypeScript, Tailwind CSS 3, Vite, DM Sans + JetBrains Mono (Google Fonts), shadcn/ui, GSAP.

---

## File Map

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add `orange-brand` color token |
| `src/index.css` | Update `--primary` to orange, `--ring` to orange, `body` font-family |
| `index.html` | Add Google Fonts `<link>`, update critical CSS inline, fix CSP |
| `src/pages/Index.tsx` | Redesign hero, guide cards, remove all decorative gradients |

---

## Task 1: Orange design token

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Add `orange-brand` to Tailwind config**

In `tailwind.config.ts`, inside `theme.extend.colors`, add `'orange-brand'` alongside the existing `git` object:

```ts
// tailwind.config.ts — inside extend.colors, after the git block
'orange-brand': '#f05133',
```

Result after edit (the git block + new entry):
```ts
git: {
  add: '#4caf50',
  delete: '#f44336',
  commit: '#2196f3',
  branch: '#ff9800',
  master: '#e91e63',
  merge: '#9c27b0',
  editor: '#1e293b'
},
'orange-brand': '#f05133',
```

- [ ] **Step 2: Update `--primary` and `--ring` in `src/index.css`**

The `--primary` variable is `221.2 83.2% 53.3%` (blue). Replace it with git-orange in both `:root` and `.dark`. The HSL for `#f05133` is `14 86% 57%`. For dark mode use `14 86% 62%` (slightly lighter).

In `src/index.css`, change the `:root` block:
```css
/* FROM */
--primary: 221.2 83.2% 53.3%;
--primary-foreground: 210 40% 98%;
/* ... */
--ring: 240 5.2% 33.9%;
```
```css
/* TO */
--primary: 14 86% 57%;
--primary-foreground: 0 0% 100%;
/* ... */
--ring: 14 86% 57%;
```

In `src/index.css`, change the `.dark` block:
```css
/* FROM */
--primary: 217.2 91.2% 59.8%;
--primary-foreground: 210 40% 98%;
```
```css
/* TO */
--primary: 14 86% 62%;
--primary-foreground: 0 0% 100%;
```

Also update `--sidebar-ring` in `:root` (currently blue):
```css
/* FROM */
--sidebar-ring: 217.2 91.2% 59.8%;
/* TO */
--sidebar-ring: 14 86% 57%;
```

- [ ] **Step 3: Verify token in browser**

Run: `npm run dev`

Open `http://localhost:5173`. The default button (e.g. "Start first challenge") should now be orange. The focus ring on interactive elements should be orange. No other visual regressions expected.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/index.css
git commit -m "design: switch primary token to git-orange #f05133"
```

---

## Task 2: Typography — DM Sans + JetBrains Mono

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Step 1: Add Google Fonts preconnects and stylesheet link to `index.html`**

After the existing `<link rel="preconnect" href="https://scripts.clarity.ms" crossorigin />` line (line ~9), add:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" />
```

- [ ] **Step 2: Update body font in the inline critical CSS in `index.html`**

In `index.html`, find the inline `<style>` tag (lines ~12–36). Find the `html{...}` rule and update `font-family`:

```css
/* FROM */
html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
```
```css
/* TO */
html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:'DM Sans',system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
```

Also update the `--primary` in the inline `:root` inside the same `<style>`:
```css
/* FROM (inside :root{...}) */
--primary:221.2 83.2% 53.3%;
/* TO */
--primary:14 86% 57%;
```
And in `.dark{...}`:
```css
/* FROM */
--primary:217.2 91.2% 59.8%;
/* TO */
--primary:14 86% 62%;
```

- [ ] **Step 3: Update font-family in `src/index.css` body rule**

In `src/index.css`, find the `@layer base` block. After the `:root` and `.dark` variable blocks, there's a `* { ... }` and `body { ... }` rule. Add or update the `font-family` on `body`:

```css
/* Add inside @layer base, after the .dark block */
body {
  font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

If a `body` rule already exists in the file, extend it. Do not create a duplicate.

- [ ] **Step 4: Add Google Fonts to CSP `font-src` and `style-src` in `index.html`**

In `index.html` line ~61, find the `<meta http-equiv="Content-Security-Policy" ...>` tag.

- In `style-src`: add `https://fonts.googleapis.com`
- In `font-src`: add `https://fonts.gstatic.com`

The relevant parts of the CSP change from:
```
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
...
font-src 'self' https://cdn.jsdelivr.net data:;
```
to:
```
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;
...
font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com data:;
```

- [ ] **Step 5: Verify fonts load**

Run: `npm run dev`

Open `http://localhost:5173`. Open DevTools → Network → filter `fonts.gstatic.com`. You should see 2 font files loading (DM Sans + JetBrains Mono). The page text should look noticeably rounder/warmer than system-ui.

- [ ] **Step 6: Commit**

```bash
git add index.html src/index.css
git commit -m "design: add DM Sans + JetBrains Mono, update CSP font/style sources"
```

---

## Task 3: Fix CSP — remove `unsafe-eval`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove `'unsafe-eval'` from `script-src`**

In `index.html` line ~61, in the CSP meta tag, find `script-src` and remove `'unsafe-eval'`:

```
/* FROM */
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://cdn.jsdelivr.net https://va.vercel-scripts.com https://www.clarity.ms https://scripts.clarity.ms blob:;

/* TO */
script-src 'self' 'unsafe-inline' https://cdn.gpteng.co https://cdn.jsdelivr.net https://va.vercel-scripts.com https://www.clarity.ms https://scripts.clarity.ms blob:;
```

- [ ] **Step 2: Verify build still works**

Run: `npm run build`

Expected: Build completes without errors. No CSP violation errors in the console when serving the built output.

If `npm run build` fails due to an eval-related error in a dependency, revert this step and document it — but GSAP 3.x and CodeMirror 6 do not use eval in Vite production builds.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "security: remove unsafe-eval from CSP script-src"
```

---

## Task 4: Featured guide cards redesign

**Files:**
- Modify: `src/pages/Index.tsx`

This task replaces the `accent` gradient field on each guide card with a `color` + `command` field, and rewrites the card JSX to use bordered white cards with a monospace badge.

- [ ] **Step 1: Update the `featuredGuides` array type and data**

In `Index.tsx`, find the `featuredGuides` array (around line 126). Replace it entirely:

```tsx
const featuredGuides = [
  {
    href: gitPracticeGamePath,
    title: t("landingPages.gitPracticeGame.heroTitle"),
    description: t("landingPages.gitPracticeGame.heroDescription"),
    icon: Sparkles,
    color: "orange" as const,
    command: "git practice",
    difficulty: t("home.levelBasic", "Básico"),
  },
  {
    href: gitBranchPracticePath,
    title: t("landingPages.gitBranchPractice.heroTitle"),
    description: t("landingPages.gitBranchPractice.heroDescription"),
    icon: GitBranchIcon,
    color: "sky" as const,
    command: "git branch",
    difficulty: t("home.levelIntermediate", "Intermedio"),
  },
  {
    href: gitMergeConflictsPath,
    title: t("landingPages.gitMergeConflicts.heroTitle"),
    description: t("landingPages.gitMergeConflicts.heroDescription"),
    icon: GitMergeIcon,
    color: "amber" as const,
    command: "git merge",
    difficulty: t("home.levelIntermediate", "Intermedio"),
  },
  {
    href: valgrindMemoryLeaksPath,
    title: t("landingPages.valgrindMemoryLeaks.heroTitle"),
    description: t("landingPages.valgrindMemoryLeaks.heroDescription"),
    icon: Shield,
    color: "green" as const,
    command: "valgrind",
    difficulty: t("home.levelAdvanced", "Avanzado"),
  },
];
```

- [ ] **Step 2: Add the color-map helper above the component return**

Add this constant right before the `return (` statement in the `GitGame` component:

```tsx
const guideColorMap = {
  orange: {
    icon: "bg-[#fff4f1]",
    tag: "bg-[#fff4f1] text-[#c2410c]",
    arrow: "text-[#f05133]",
    badge: "font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded",
  },
  sky: {
    icon: "bg-sky-50",
    tag: "bg-sky-50 text-blue-700",
    arrow: "text-blue-600",
    badge: "font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded",
  },
  amber: {
    icon: "bg-amber-50",
    tag: "bg-amber-50 text-amber-700",
    arrow: "text-amber-600",
    badge: "font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded",
  },
  green: {
    icon: "bg-green-50",
    tag: "bg-green-50 text-green-700",
    arrow: "text-green-600",
    badge: "font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded",
  },
} as const;
```

- [ ] **Step 3: Find and replace the guide cards JSX**

Search for the section that renders `featuredGuides.map(...)` in `Index.tsx`. It currently renders gradient-background cards. Replace the entire map block with:

```tsx
<div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
  {featuredGuides.map((guide) => {
    const Icon = guide.icon;
    const colors = guideColorMap[guide.color];
    return (
      <Link
        key={guide.href}
        to={guide.href}
        className="home-guide-card group bg-white border border-border rounded-lg p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5"
        aria-label={guide.title}
      >
        <div className="flex items-start justify-between gap-2">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.icon}`}>
            <Icon className="w-4 h-4 text-foreground/70" aria-hidden />
          </div>
          <span className={colors.badge}>{guide.command}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground leading-snug mb-1">{guide.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{guide.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${colors.tag}`}>{guide.difficulty}</span>
          <span className={`text-sm ${colors.arrow} group-hover:translate-x-0.5 transition-transform`} aria-hidden>→</span>
        </div>
      </Link>
    );
  })}
</div>
```

- [ ] **Step 4: Verify cards render correctly**

Run: `npm run dev`

Open `http://localhost:5173`. Scroll to the guides section. You should see 4 white-bordered cards, each with:
- A tinted icon box (orange/sky/amber/green)
- A monospace badge showing the git command
- Title and description text
- A difficulty tag + arrow in the category color
- No gradients anywhere on the cards

Confirm the cards scroll-animate correctly (GSAP batch trigger on `.home-guide-card`).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "design: replace gradient guide cards with bordered white cards + command badge"
```

---

## Task 5: Hero section redesign

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Locate the header element**

In `Index.tsx` find the `<header data-home-header ...>` block (around line 262). It currently contains a centered `<h1>` and two `<p>` SEO paragraphs. Keep all text nodes and SEO links intact — only add new elements and change styling.

- [ ] **Step 2: Replace the header content**

Replace the inner content of `<header data-home-header ...>` with:

```tsx
<header data-home-header className="mb-4 sm:mb-6 relative">
  <div className="absolute right-2 top-2 flex items-center gap-2">
    <DeferUntilAfterPaint fallback={<div className="w-[88px] h-10" aria-hidden />}>
      <ThemeToggle />
      <LanguageSelector />
    </DeferUntilAfterPaint>
  </div>

  {/* Hero: two-column on md+, stacked on mobile */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center pt-2 md:pt-4">
    {/* Left: text */}
    <div>
      {/* Eyebrow — purely decorative, no SEO impact */}
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#f05133] mb-3" aria-hidden>
        <span className="w-1.5 h-1.5 rounded-full bg-[#f05133]" />
        {t('home.eyebrow', 'Aprende Git de verdad')}
      </div>

      {/* h1 — original key preserved for SEO, only className updated */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3">
        {t('general.title')}
      </h1>

      {/* SEO paragraphs — unchanged content, kept in DOM */}
      <section className="max-w-lg mb-4" aria-label={t('home.seoIntroLabel', 'App description')}>
        <p className="text-xs text-muted-foreground leading-relaxed sm:hidden">
          {t('home.seoIntroMobile', 'Learn Git by doing with visual commits and guided challenges.')}
        </p>
        <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed">
          {t('home.seoIntroShort', 'Learn Git by doing. Visualize branches and merges while running real commands. Try guided challenges or switch to the terminal anytime.')}{' '}
          <Link to={gdbPath} className="underline hover:text-primary">GDB</Link>
          {' '}{t('home.seoIntroAnd', 'and')}{' '}
          <Link to={valgrindPath} className="underline hover:text-primary">Valgrind</Link>
          {' '}{t('home.seoIntroTailShort', 'basics included.')}
        </p>
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="text-xs sm:text-sm rounded-lg bg-[#f05133] hover:bg-[#d9441f] text-white shadow-sm"
          onClick={() => window.dispatchEvent(new CustomEvent('open-challenges'))}
          aria-label={t('home.startFirstChallenge', 'Start first challenge')}
        >
          <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          {t('home.startFirstChallenge', 'Start first challenge')}
        </Button>
        {(isGdbEnabled || isValgrindEnabled) && (
          <div className="hidden sm:flex gap-2">
            {isGdbEnabled && (
              <Link to={gdbPath}>
                <Button variant="outline" size="sm" className="text-xs rounded-lg" aria-label={t('home.openGdb', 'Learn GDB debugger')}>
                  <Bug className="h-3 w-3 mr-1" />
                  {t('home.gdbShort', 'GDB')}
                </Button>
              </Link>
            )}
            {isValgrindEnabled && (
              <Link to={valgrindPath}>
                <Button variant="outline" size="sm" className="text-xs rounded-lg" aria-label={t('home.openValgrind', 'Learn Valgrind memory tools')}>
                  <Shield className="h-3 w-3 mr-1" />
                  {t('home.valgrindShort', 'Valgrind')}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="hidden sm:flex gap-6 mt-5 pt-4 border-t border-border/60">
        <div>
          <p className="text-lg font-bold tracking-tight text-foreground">6</p>
          <p className="text-[11px] text-muted-foreground">{t('home.statGuides', 'Guías interactivas')}</p>
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-foreground">ES · EN</p>
          <p className="text-[11px] text-muted-foreground">{t('home.statLanguages', 'Idiomas')}</p>
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-foreground">0</p>
          <p className="text-[11px] text-muted-foreground">{t('home.statInstalls', 'Instalaciones necesarias')}</p>
        </div>
      </div>
    </div>

    {/* Right: terminal snippet — hidden on mobile to keep LCP fast */}
    <div className="hidden md:block" aria-hidden>
      <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-4 font-mono text-[12px] leading-[2]">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-slate-500 ml-2">commitquest — playground</span>
        </div>
        <div><span className="text-slate-500">$</span> <span className="text-slate-200">git init my-project</span></div>
        <div><span className="text-green-400">✓</span> <span className="text-slate-500">Initialized empty Git repository</span></div>
        <div><span className="text-slate-500">$</span> <span className="text-slate-200">git commit -m </span><span className="text-amber-400">"feat: primer commit"</span></div>
        <div><span className="text-green-400">✓</span> <span className="text-slate-500">1 file changed — HEAD → main</span></div>
        <div className="border-t border-[#1e293b] mt-2 pt-2 flex gap-2 flex-wrap">
          <span className="bg-[#fff4f1] text-[#c2410c] text-[10px] px-2 py-0.5 rounded">main</span>
          <span className="bg-green-950 text-green-400 text-[10px] px-2 py-0.5 rounded">feature/login</span>
          <span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded">HEAD</span>
        </div>
      </div>
    </div>
  </div>
</header>
```

- [ ] **Step 3: Verify hero renders correctly**

Run: `npm run dev`

- Desktop (≥768px): two-column layout — text left, terminal snippet right
- Mobile (<768px): single column, terminal is hidden (no CLS)
- `<h1>` is present, SEO links to `/gdb` and `/valgrind` are in the DOM
- CTA button is orange, not gradient

- [ ] **Step 4: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "design: new hero with two-column layout, eyebrow, terminal snippet, stats"
```

---

## Task 6: Remove remaining decorative gradients

**Files:**
- Modify: `src/pages/Index.tsx`

Three gradient usages remain: sticky CTA, floating Info button, Sheet header.

- [ ] **Step 1: Fix sticky CTA button**

Find (around line 251):
```tsx
className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg text-xs"
```
Replace with:
```tsx
className="rounded-lg bg-[#f05133] hover:bg-[#d9441f] text-white shadow-sm text-xs"
```

- [ ] **Step 2: Fix floating Info (Sheet trigger) button**

Find (around line 347):
```tsx
className="fixed bottom-16 left-4 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2 z-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
  bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl ring-2 ring-blue-400/40 hover:scale-105 transition-transform duration-200"
```
Replace with:
```tsx
className="fixed bottom-16 left-4 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2 z-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#f05133] hover:bg-[#d9441f] text-white shadow-xl hover:scale-105 transition-transform duration-200"
```

- [ ] **Step 3: Fix Sheet header gradient**

Find (around line 355):
```tsx
<div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 sm:p-8">
```
Replace with:
```tsx
<div className="relative bg-[#0f172a] text-white p-5 sm:p-8">
```

- [ ] **Step 4: Fix secondary banner CTA**

Find (around line 462):
```tsx
className="rounded-full h-7 text-xs bg-amber-500 hover:bg-amber-600"
```
Replace with:
```tsx
className="rounded-lg h-7 text-xs bg-[#f05133] hover:bg-[#d9441f]"
```

- [ ] **Step 5: Verify no decorative gradients remain**

Run:
```bash
grep -n "from-amber\|from-sky\|from-fuchsia\|from-emerald\|from-blue\|from-indigo\|bg-gradient" src/pages/Index.tsx
```
Expected output: empty (no matches). If any remain, they are inside the guides grid or playground strip sections — review and remove.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "design: remove all decorative gradients from sticky CTA, info button, sheet header"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full build check**

```bash
npm run build
```
Expected: build completes, no TypeScript errors, no missing import warnings.

- [ ] **Step 2: Visual responsive check**

Run `npm run dev` and open DevTools device toolbar. Check at:
- 375px (iPhone SE): single column, terminal hidden, cards 1-col
- 768px (iPad): hero 2-col, cards 2-col
- 1280px (desktop): hero 2-col, cards 4-col

- [ ] **Step 3: SEO integrity check**

In the browser at `http://localhost:5173`:
- Open DevTools → Elements
- Confirm `<h1>` is present with the correct text (not empty)
- Confirm links to `/gdb` and `/valgrind` are in the DOM (not hidden)
- Confirm `<header>`, `<section>`, `<footer>` semantic tags are intact
- Confirm `<SeoHead>` meta tags are present in `<head>` (title, description, og:*)

- [ ] **Step 4: Font loading check**

DevTools → Network → filter `gstatic.com`. Confirm DM Sans and JetBrains Mono font files load (woff2). Confirm no `font-display` FOUT is visible on hard reload.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "design: UI redesign complete — git-orange tokens, DM Sans, clean cards, CSP fix"
```

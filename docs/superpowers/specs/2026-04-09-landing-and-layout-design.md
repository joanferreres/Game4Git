# Landing Page + Shared Layout Design Spec

**Date:** 2026-04-09  
**Status:** Approved  
**Depends on:** `2026-04-09-ui-redesign-design.md` (tokens, fonts, no-gradient rule already implemented)

---

## Goal

Create a proper landing page at `/` that matches the approved mockup. Move the git playground to `/playground`. Add a shared `AppNav` component used across all inner pages with a minimal nav (logo + back + badge). Apply consistent styling to all learning pages.

---

## Routes

| Before | After | Component |
|--------|-------|-----------|
| `/` | `/playground` | `Index.tsx` (playground, unchanged) |
| *(new)* | `/` | `Landing.tsx` (new landing page) |
| `/gdb` | `/gdb` | `GdbLearning.tsx` (header updated) |
| `/valgrind` | `/valgrind` | `ValgrindLearning.tsx` (header updated) |
| `/git-practice-game` | `/git-practice-game` | `GitPracticeGame.tsx` (via SeoLandingPage) |
| `/git-branch-practice` | `/git-branch-practice` | `GitBranchPractice.tsx` (via SeoLandingPage) |
| `/git-merge-conflicts` | `/git-merge-conflicts` | `GitMergeConflicts.tsx` (via SeoLandingPage) |
| `/valgrind-memory-leaks` | `/valgrind-memory-leaks` | `ValgrindMemoryLeaks.tsx` (via SeoLandingPage) |

Localization: `/playground` is added to `localizedPageDefinitions` in `App.tsx` and to `LOCALIZED_PATHS` in `localizedRoutes.ts`. All existing routes are preserved for SEO.

---

## New Component: `AppNav`

**File:** `src/components/AppNav.tsx`

Two variants via a `variant` prop:

### `variant="landing"` (used only on Landing.tsx)
```
[● commitquest]   [git init badge]  [Guías]  [Playground]   [Empezar →]
```
- Logo links to `/`
- "Guías" scrolls to `#guides` section on the landing
- "Playground" links to `/playground`
- "Empezar" CTA: `bg-orange-brand` button, scrolls to `#guides`
- Sticky, `border-b border-border bg-background/95 backdrop-blur`

### `variant="inner"` (used on all learning pages)
```
[● commitquest]                         [← Volver a guías]  [git badge]
```
- Logo links to `/`
- "← Volver a guías" links to `/` (the landing)
- Monospace badge shows the relevant command (passed via `badge` prop)
- Also renders `ThemeToggle` and `LanguageSelector` at far right
- Sticky, `border-b border-border bg-background/95 backdrop-blur`

**Props:**
```ts
interface AppNavProps {
  variant: 'landing' | 'inner';
  badge?: string;      // e.g. "git branch" — shown in inner variant
}
```

---

## New Page: `Landing.tsx`

**File:** `src/pages/Landing.tsx`

Sections in order:

### 1. AppNav (variant="landing")

### 2. Hero
- Background: `bg-[#faf9f7]`
- Two-column grid (`grid-cols-1 md:grid-cols-2`), collapses on mobile
- Left: eyebrow (`● Aprende Git de verdad`), `<h1>` (SEO title), description paragraph, two CTAs (primary orange + outline), stats row (6 guías / ES·EN / 0 instalaciones)
- Right: terminal snippet (dark, `aria-hidden`, hidden on mobile)
- `<SeoHead page="home" />` at top of component

### 3. Guide cards section (`id="guides"`)
- Section label, title, subtitle
- Grid of 6 cards: GitPracticeGame, GitBranchPractice, GitMergeConflicts, GdbLearning, ValgrindLearning, ValgrindMemoryLeaks
- Same card style as implemented in Index.tsx: white card, border, icon box, monospace badge, difficulty tag
- Cards link to their respective routes

### 4. Playground strip (dark)
- `bg-[#0f172a] rounded-2xl`
- Left: eyebrow `$ git playground --open`, title, subtitle, CTA button linking to `/playground`
- Right: terminal snippet (hidden on mobile)

### 5. FAQ
- 4 items in bordered list
- Same style as mockup

### 6. Footer
- Logo + copyright
- Links: GitHub, Privacidad

**SEO:** `<SeoHead page="home" />` — reuses existing home SEO. The playground page keeps its own SEO via its existing `<SeoHead>`.

---

## Updated: `Index.tsx` (playground)

- Add `AppNav variant="inner" badge="git playground"` at the very top (before the existing header)
- Remove the existing `<header data-home-header>` hero section — it's now on Landing.tsx
- The playground panels (`[data-home-panel]`, editor, graph, controls) become the full page content
- `data-home-header` GSAP animation target is removed since there's no hero on this page now
- Keep all other GSAP animations intact

**Note:** The `SeoHead` for this page changes to `page="playground"` (or keep `page="home"` with a canonical to `/`). Safest: keep `page="home"` with no change to avoid SEO impact.

---

## Updated: `SeoLandingPage.tsx`

The `SeoLandingPage` component is used by 4 pages (GitPracticeGame, GitBranchPractice, GitMergeConflicts, ValgrindMemoryLeaks). It currently has its own custom header with ThemeToggle, LanguageSelector, and gradient accents.

Changes:
- Remove the existing custom header markup (find the header section with `ThemeToggle` and `LanguageSelector`)
- Add `<AppNav variant="inner" badge={config.badge} />` at the top of the render
- Add `badge` field to `LandingPageConfig` type (the git command string for the badge)
- Update each page config to include its badge:
  - gitPracticeGame: `"git practice"`
  - gitBranchPractice: `"git branch"`  
  - gitMergeConflicts: `"git merge"`
  - valgrindMemoryLeaks: `"valgrind"`
- Remove `accent`, `accentSolid`, `softAccent`, `surfaceAccent` gradient-based color fields from `LandingPageConfig` (replace with `color` field matching the guide card system: `"orange" | "sky" | "amber" | "green"`)
- All gradient classes using these accent vars are replaced with solid orange-brand or category colors

---

## Updated: `GdbLearning.tsx`

- Remove custom header (the `<div>` containing `ThemeToggle`, `LanguageSelector`, back link)
- Add `<AppNav variant="inner" badge="gdb" />` at top of render (before the tabs)
- Keep all content, tabs, and functionality unchanged

---

## Updated: `ValgrindLearning.tsx`

- Remove custom header (same pattern as GdbLearning)
- Add `<AppNav variant="inner" badge="valgrind" />` at top
- Keep all content unchanged

---

## SEO Preservation

- `<SeoHead>` calls are NOT modified on any inner page
- The landing page at `/` uses `<SeoHead page="home" />` — same as current Index.tsx
- The playground at `/playground` keeps its own `<SeoHead page="home" />` with a `<link rel="canonical" href="/" />` to avoid duplicate content (or simply remove SeoHead from playground since landing is now canonical home)
- All existing route paths unchanged (only `/playground` is new)
- Internal links from learning pages back to `/` now point to the landing, which is correct

---

## Responsive

| Breakpoint | Landing hero | Guide cards | Playground strip |
|---|---|---|---|
| < 480px | 1 col, terminal hidden | 1 col | Terminal hidden |
| 480–768px | 1 col | 2 col | Terminal hidden |
| 768px+ | 2 col | 2–3 col | Full |
| 1280px+ | 2 col | 3 col | Full |

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/AppNav.tsx` | **CREATE** |
| `src/pages/Landing.tsx` | **CREATE** |
| `src/App.tsx` | **MODIFY** — add Landing at `/`, Index at `/playground` |
| `src/lib/localizedRoutes.ts` | **MODIFY** — add `/playground` path |
| `src/pages/Index.tsx` | **MODIFY** — remove hero header, add AppNav |
| `src/components/SeoLandingPage.tsx` | **MODIFY** — replace header with AppNav, remove gradient config |
| `src/pages/GdbLearning.tsx` | **MODIFY** — replace header with AppNav |
| `src/pages/ValgrindLearning.tsx` | **MODIFY** — replace header with AppNav |

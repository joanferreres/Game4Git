# UI Redesign — CommitQuest Visualizer

**Date:** 2026-04-09  
**Status:** Approved

---

## Context

The current UI was generated with heavy AI-assisted tooling and shows the typical tell-tale signs: cascading gradient cards (`from-amber-500 via-orange-500 to-rose-500`, etc.), gradient buttons, blue-indigo gradient sheets, and system-font defaults. The result feels generic and unpolished despite the high quality of the underlying educational content. The goal is to strip out decorative gradients and replace them with a professional, typographically-strong design that communicates technical credibility while remaining warm and educational. Security hardening (CSP) is included as a secondary goal.

---

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--orange` | `#f05133` | Primary accent — git brand orange |
| `--orange-hover` | `#d9441f` | Hover state for primary |
| `--orange-light` | `#fff4f1` | Tinted backgrounds, icon fills |
| `--orange-mid` | `#ffe4de` | Badges, highlights |
| `--slate` | `#0f172a` | Primary text |
| `--muted` | `#64748b` | Secondary text |
| `--border` | `#e2e8f0` | All borders |
| `--bg-warm` | `#faf9f7` | Hero / section backgrounds |
| `--bg-dark` | `#0f172a` | Dark strip, terminal blocks |

Existing git-semantic colors (add=green, delete=red, branch=orange, merge=purple) in `tailwind.config.ts` are **preserved** — they are used inside the graph visualizer, not for decoration.

Dark mode CSS variables in `index.css` are updated to use `--orange` as the primary accent (replacing blue-500/400).

### Typography
- **UI font:** `DM Sans` (Google Fonts) — weights 400, 500, 600, 700, 800
- **Code/mono font:** `JetBrains Mono` — weights 400, 500 (already loaded via CodeMirror; add to global CSS for inline `<code>` and badge elements)
- **Fallback stack:** `system-ui, sans-serif`
- Loaded via `@import` in `index.css` with `font-display: swap`

### No gradients rule
All `bg-gradient-to-*`, `from-*`, `via-*`, `to-*` classes used for decoration are removed. Gradients remain only inside the git graph node color system (committed in `tailwind.config.ts` as semantic tokens) and progress bars if any.

### Border radius
Keep existing `--radius: 0.5rem`. Cards use `rounded-lg` (8px). Terminal blocks use `rounded-xl` (12px).

---

## Components to change

### `src/pages/Index.tsx`

**Nav / Header**
- Logo: `<span class="w-2 h-2 rounded-full bg-[#f05133]" /> commitquest` — no icon, no gradient
- Remove `bg-gradient-to-r from-amber-500 to-orange-600` from the sticky CTA button → replace with `bg-[#f05133]`
- Remove `bg-gradient-to-br from-blue-600 to-indigo-600` from the floating `<Info>` Sheet trigger → replace with `bg-[#f05133]`
- Remove `bg-gradient-to-br from-blue-600 to-indigo-700` from the Sheet header → replace with `bg-[#0f172a]` (dark slate)

**Hero section**
- Add eyebrow label: small uppercase orange tag above `<h1>`
- `<h1>` uses `font-extrabold tracking-tight` with `<span class="text-[#f05133]">` for accent word
- Add terminal snippet block (dark bg, `JetBrains Mono`) as a visual aside next to/below hero text
- Stats row (6 guías / ES·EN / 0 instalaciones) below hero actions

**Featured guides grid** (`featuredGuides` array)
- Remove `accent` field (was gradient class string)
- Add `color` field: one of `'orange' | 'sky' | 'amber' | 'green'`
- Add `command` field: git command string (e.g. `"git practice"`, `"git branch"`)
- Card markup:
  - White card, `border border-border rounded-lg p-4 hover:shadow-md transition`
  - Top row: colored icon box (tinted bg per category) + monospace badge with command
  - Title + description (unchanged text)
  - Footer: difficulty tag (tinted) + `→` arrow in category color

**Dark strip** (playground CTA)
- Existing strip or add new: `bg-[#0f172a] rounded-2xl` with terminal code snippet on the right

### `src/components/ui/button.tsx`
- `default` variant: replace any gradient → `bg-[#f05133] hover:bg-[#d9441f] text-white`
- Remove `rounded-full` from the primary CTA buttons in Index.tsx (use `rounded-lg` instead)
- Outline variant: keep as-is

### `index.html`
- Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` (already present for other CDNs — verify not duplicated)
- Add `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;500&display=swap">` in `<head>` — using `<link>` not `@import` avoids render-blocking

### `src/index.css`
- Update `body` font-family to `'DM Sans', system-ui, sans-serif`
- Update `--primary` CSS variable in both light and dark to orange HSL: `hsl(14 86% 57%)` (≈ #f05133)
- Update dark mode `--primary` to `hsl(14 86% 62%)`
- Add utility classes: `.font-mono-ui` → `font-family: 'JetBrains Mono', monospace` for inline badges

### `tailwind.config.ts`
- Add `orange-brand: '#f05133'` to the `colors` extension so it's available as `bg-orange-brand`, `text-orange-brand`

### `index.html` — Security (CSP)
- Remove `'unsafe-eval'` from `script-src` directive — GSAP 3.x and CodeMirror 6 do not use `eval()` in Vite builds; the flag was added defensively but is not required
- Keep `'unsafe-inline'` in `script-src` — Vite injects critical inline scripts at build time; removing it would break the app without a nonce-based CSP setup (out of scope here)
- Keep `cdn.gpteng.co` in the CSP allow-list — `gptengineer.js` is the Lovable/GPT Engineer widget embedded intentionally; do not remove it from the CSP, but note it loads third-party JS outside your control

---

## Responsive behavior

| Breakpoint | Hero | Cards grid | Dark strip |
|---|---|---|---|
| `< 480px` | 1 col, terminal hidden | 1 col | Terminal hidden |
| `480–768px` | 1 col, terminal below text | 2 col | Terminal hidden |
| `768px+` | 2 col (text + terminal) | 2–4 col auto-fill | Full layout |

Nav collapses secondary links on `< 640px`, keeps logo + CTA.

---

## SEO — preservar sin cambios

El proyecto tiene SEO cuidadosamente optimizado. Las siguientes piezas **no se tocan**:

- `<SeoHead>` component y todos sus meta tags (title, description, og:*, twitter:*)
- Structured data (JSON-LD) inyectado en `index.html` entre `STRUCTURED_DATA_START/END`
- Semántica HTML: los `<header>`, `<section>`, `<h1>`–`<h3>`, `<footer>`, `<nav>` existentes se mantienen con los mismos tags semánticos
- Textos visibles usados como contenido SEO (intro paragraphs, headings) — solo se puede cambiar estilos, nunca eliminar nodos de texto indexables
- `<Link>` interno de React Router hacia `/gdb` y `/valgrind` en el hero — debe mantenerse visible en el DOM (no ocultado con `display:none`)
- Atributos `aria-label` y `role` existentes — no modificar
- Preconnect/dns-prefetch en `index.html` para CDNs ya presentes — no eliminar entradas existentes al añadir las de Google Fonts

## Pages NOT in scope

The internal educational pages (`GdbLearning`, `ValgrindLearning`, `GitPracticeGame`, `GitBranchPractice`, `GitMergeConflicts`, `ValgrindMemoryLeaks`) share the global CSS and button component, so they automatically inherit the font and color token changes. No per-page layout changes are needed for this iteration.

---

## Verification

1. `npm run dev` — visual check of landing on desktop and mobile (375px)
2. Confirm no `from-*` / `via-*` / `to-*` classes remain on decorative elements: `grep -r "from-amber\|from-sky\|from-fuchsia\|from-emerald\|from-blue\|from-indigo" src/pages/Index.tsx`
3. Confirm `DM Sans` loads: check Network tab for `fonts.googleapis.com`
4. Confirm primary button is orange on all variants
5. Confirm CSP in `index.html` no longer contains `'unsafe-eval'`
6. Run `npm run build` — no TypeScript errors

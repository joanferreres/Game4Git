<div align="center">

# Game4Git — The learning git game — El juego para aprender Git jugando

Aprende Git jugando con Game4Git: el único juego para practicar comandos git reales, retos y visualizar ramas y merges en español, inglés, catalán (Joc per a aprendre Git) y francés (Jeu pour apprendre Git en jouant). Practice real Git commands, solve challenges, and visualize branches in a hands-on learning git game in English, Spanish, Catalan and French!

[![Git Game Logo](public/logo.png)](https://game4git.games)

`EN · ES · CA · FR` · Dark Mode · SPA Routing · SEO-ready · Accessibility-first

`Live:` [game4git.games](https://game4git.games) · `Author:` FerVi

</div>

### Elevator pitch

Learn Git like you learn to ride a bike: balance first, speed later. Git Game turns abstract concepts into concrete moves — branching, committing, merging — while keeping your context visible at all times. Then it takes you further with GDB and Valgrind pages that translate debugging theory into action.

### Why this project

- Learn by doing: every action updates a live Git graph and editor.
- Immediate feedback: diffs, conflicts, and history are always visible.
- From Git to debugging: built-in pages guide you through GDB and Valgrind.

### Highlights

- Visual Git Graph with branches, merges, and a clear `HEAD` label centered under the active commit.
- Integrated Code Editor and Diff Viewer for quick iteration and understanding.
- Conflict Resolver UI to learn how and why merges collide — and how to fix them.
- Guided Challenges with an improved “Help/Info” experience, now full-screen and fully translatable.
- GDB Learning page: Introduction, Concepts, Commands, Best Practices, and Cheat Sheet — polished content and layout.
- Valgrind Learning page: clearer best practices and cheat sheet, correct formatting with line breaks.
- Seamless i18n across the app: English, Spanish, Catalan, French.
- Unified design language across pages (Git, GDB, Valgrind) with consistent headers, tabs, main area, and sticky footers.
- Thoughtful details: elevated but non-intrusive FABs, refined buttons for GDB/Valgrind on the homepage, and accessible color choices.

### Feature matrix

| Area | What you get |
| --- | --- |
| Git Playground | Live graph, branches, merges, explicit `HEAD`, inline diffs |
| Conflicts | Visual resolver, clear markers, safe completion flow |
| Challenges | Guided tasks with tips, hints, and a modern help panel |
| GDB Learning | Concepts, commands, best practices, cheat sheet |
| Valgrind Learning | Best practices with proper formatting and cheat sheet |
| i18n | EN / ES / CA / FR across all visible content |
| UX & UI | Cohesive design system, dark mode, keyboard-friendly |
| SEO | Canonicals, `hreflang`, sitemap, robots/header hardening |

### Architecture at a glance

- React + TypeScript, built with Vite for speed and modern DX.
- State management with Zustand; clean separation for Git state and admin toggles.
- Graph rendering with React Flow (`@xyflow/react`).
- UI with Tailwind CSS + shadcn/ui + Radix primitives; icons via Lucide.
- Internationalization with `react-i18next` (EN/ES/CA/FR).
- Client-side routing via React Router; resilient deep-linking with SPA fallback.
- SEO: dynamic `lang`, canonical, `hreflang`, sitemap, and sensible `robots`/headers.

```
┌──────────────────────────────── Git Game (SPA) ─────────────────────────────────┐
│ React + TypeScript + Vite                                                       │
│                                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                            │
│  │ Code Editor │→→│   Git Store │→→│  Git Graph   │                             │
│  └─────────────┘   └─────────────┘   └─────────────┘                            │
│         │                 │                        │                            │
│         ↓                 │                        ↓                            │
│   Diff Viewer         Conflict Resolver       History / HEAD                    │
│                                                                                 │
│   GDB Learning  |  Valgrind Learning  |  Challenges  |  Help Panel (full-screen)│
│                                                                                 │
│ i18n (react-i18next) · Tailwind + shadcn/ui + Radix · React Router · SEO utils  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Pages overview

- Git Playground: edit code, stage/commit, visualize history, and explore diffs — all live.
- GDB Learning: curated content to get productive with breakpoints, stepping, inspection, and best practices.
- Valgrind Learning: memory analysis concepts, tips, and a cheat sheet you’ll actually use.
- Admin: simple and pragmatic, focused on toggles without backend complexity.

### Design principles

- Clarity over complexity: less noise, more signal.
- Cohesive visual system: one style across all pages, including dark mode.
- Progressive learning: start simple, then explore advanced workflows.
- Accessibility and responsiveness: keyboard-friendly, mobile-ready.

### What makes it stand out

- A complete journey: from Git fundamentals to real-world debugging tools.
- Opinionated UX that teaches good habits: readable diffs, explicit `HEAD`, safe merges.
- Multilingual by default, SEO-aware, and deploy-ready.

### Roadmap (curated)

- More challenge tracks (team workflows, conflict drills, rebase flows).
- Import/export scenarios and sharable links for teaching.
- Collaborative sessions for pair practice.
- Deeper GDB/Valgrind scenarios with step-by-step labs.

### Credits

Built by Joan Ferreres Vivero (FerVi) with React, TypeScript, Vite, Zustand, React Flow, Tailwind, shadcn/ui, Radix UI, and react-i18next.

### License

© 2025 Joan Ferreres Vivero. All rights reserved.

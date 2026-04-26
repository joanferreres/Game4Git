# SEO Weekly GSC Monitoring

## Goal
Track ranking recovery on high-priority non-branded pages and iterate snippets based on CTR and position changes.

## Scope
- Property: `sc-domain:game4git.games`
- Primary pages:
  - `https://game4git.games/git-practice-game`
  - `https://game4git.games/git-branch-practice`
  - `https://game4git.games/valgrind`
  - `https://game4git.games/valgrind-memory-leaks`

## Weekly cadence
Run every Monday using two windows:
- Current: last 14 days
- Previous: previous 14 days

## KPIs to log
- Clicks
- Impressions
- CTR
- Average position
- Device split (desktop vs mobile)

## Query clusters to monitor
- Git practice:
  - `git practice game`
  - `git game online`
  - `git online practice`
- Git branching:
  - `git branch game`
  - `git branching game`
  - `learn git branching`
- Valgrind:
  - `valgrind`
  - `how to use valgrind`
  - `valgrind memory leak`

## Decision rules
- If impressions are stable and CTR drops >20%:
  - Update `seo.*.title` and `seo.*.description` for affected page language variants.
- If position drops >5 with stable impressions:
  - Improve opening paragraph and internal links to that page.
- If mobile clicks drop but mobile position improves:
  - Prioritize snippet clarity and intent matching instead of technical indexing work.

## Recovery targets (2-4 weeks)
- `git-practice-game`: +3 to +8 positions on core practice queries
- `git-branch-practice`: CTR > 0.8% on primary branch queries
- `valgrind` and `valgrind-memory-leaks`: first non-branded recurring clicks each week

## Required checks each run
1. Property overview (28d)
2. Period comparison by:
   - `query`
   - `page`
   - `device`
   - `country`
3. URL inspection for all primary pages
4. Confirm sitemap status still healthy

## Change log template
Use this template for each weekly pass:

```
Week of: YYYY-MM-DD
Winner pages:
Loser pages:
Top query gains:
Top query losses:
Snippet edits planned:
Internal linking edits planned:
Recrawl needed: yes/no
```

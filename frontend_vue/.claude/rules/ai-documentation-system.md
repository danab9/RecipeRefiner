---
description: 'How and when to create or maintain the AI-facing documentation layer for the RecipeRefiner frontend (CLAUDE.md, AGENTS.md, .claude/rules/*.md, README.md).'
appliesTo: ['**/AGENTS.md', '**/README.md', 'CLAUDE.md', '.claude/**']
---

# AI-facing repository context and documentation system

> Read this when a task involves creating, updating, reviewing, or relying on any AI-facing
> documentation file — referenced from `CLAUDE.md`. The `appliesTo` globs above are a scope hint;
> Claude Code loads this file on demand when `CLAUDE.md` points to it, not automatically.

## Goal

The `frontend_vue/` package keeps a small, high-signal documentation layer so agents and humans can
find the right files fast, avoid irrelevant searches, and keep docs in step with the code. Keep it
compact — short, current guidance beats a large stale document.

The AI-facing files here:

1. `CLAUDE.md` — working rules, code style, architecture, and the API contract for the frontend.
2. `AGENTS.md` — path-heavy navigation and task routing.
3. `.claude/rules/*.md` — path-specific rules, read on demand when `CLAUDE.md` points to them
   (the `appliesTo` glob in each file is a scope hint, not an auto-load trigger):
   - `lint-and-types.md` — for work under `src/**`.
   - `cicd-workflows.md` — for work under `.github/workflows/**`.
   - `ai-documentation-system.md` — this file.
4. `README.md` — human-facing setup notes.

> **Scope:** these files document the **Vue frontend**. The Django backend lives in the repo root
> (`../`) and, if it grows its own AI docs, they belong there — do not fold backend detail into the
> frontend guides. Note the repo root already has its own `.claude/` folder with PR-comparison
> helper scripts; that is a separate, pre-existing tool and unrelated to this rule set.

## When to update

Update the docs **in the same task** as the code change whenever:

- New views, components, routes, or store actions are added, moved, or renamed → `AGENTS.md`
  navigation table and `CLAUDE.md` architecture section.
- Build/dev/lint/typecheck commands change (including finally adding `lint`/`typecheck` scripts) →
  `CLAUDE.md` Commands + `AGENTS.md` Essential commands.
- The **API contract** with the backend changes (an endpoint, an auth/CSRF rule, a payload shape) →
  the API contract table in `CLAUDE.md`.
- The frontend framework changes (e.g. a future Vue→React migration) → effectively a rewrite of the
  stack sections in both `CLAUDE.md` and `AGENTS.md`; do it as part of that migration, not after.
- A task reveals a useful search path or gotcha future agents should know → add it to `AGENTS.md`.

## When starting work

Before broad searches, read `CLAUDE.md` and `AGENTS.md` and let them route you to the right files.
`CLAUDE.md` tells you which `.claude/rules/*.md` file to read for a given kind of work (e.g. the
lint rule before editing `src/`); read it when it applies rather than waiting to trip over a rule.

## Structure guidance

- Keep `CLAUDE.md` focused on rules, conventions, and the API contract — the "how to work here".
- Keep `AGENTS.md` short and path-heavy — the "where to look". It is not a second README.
- Keep `README.md` human-facing (setup, run, build). Do not put long agent-only search instructions
  in it — those go in `AGENTS.md`.
- Put deep, path-specific guidance in a `.claude/rules/*.md` file with an accurate `appliesTo` scope
  hint and a pointer from `CLAUDE.md`, rather than bloating `CLAUDE.md`.

## Efficiency rules for agents

- Read the AI context files before broad text search.
- Prefer exact-path or symbol search over broad grep.
- Ignore `node_modules/`, `dist/`, and `.vite/` unless the task requires them.
- When you learn something reusable (a build trap, a routing rule), record it in the smallest doc
  that covers it, and keep every doc short enough to re-read often.

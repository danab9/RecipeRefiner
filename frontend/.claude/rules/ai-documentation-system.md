# AI-facing repository context and documentation system

> Read this when a task involves creating, updating, reviewing, or relying on any AI-facing
> documentation file — referenced from `CLAUDE.md`. The `appliesTo` globs above are a scope hint;
> Claude Code loads this file on demand when `CLAUDE.md` points to it, not automatically.

## Goal

The `frontend/` package keeps a small, high-signal documentation layer so agents and humans can
find the right files fast, avoid irrelevant searches, and keep docs in step with the code. Keep it
compact — short, current guidance beats a large stale document.

The AI-facing files here:

1. `CLAUDE.md` — working rules, code style, architecture, and the API contract for the frontend.
2. `AGENTS.md` — path-heavy navigation and task routing.
3. `.claude/rules/*.md` — frontend path-specific rules, read on demand when `CLAUDE.md` points to
   them (the `appliesTo` glob in each file is a scope hint, not an auto-load trigger):
   - `lint-and-types.md` — for work under `src/**`.
   - `components.md` — for creating views, pages, or reusable components under `src/**`.
   - `ai-documentation-system.md` — this file.

   Cross-section rules that apply to the backend too live one level up in the **repo-root**
   `../.claude/rules/` (`cicd-workflows.md` for CI, `git-workflow.md` for branching/commits), not here.
4. `README.md` — human-facing setup notes.

> **Scope:** these files document the **React frontend**. The Django backend lives in the repo root
> (`../`); its essentials and repo-wide routing live in the **root `CLAUDE.md`** — do not fold
> backend detail into the frontend guides. The repo root `.claude/` is the **cross-section** layer
> (the `/compare-pr` command plus repo-wide rules: `cicd-workflows.md`, `git-workflow.md`); these
> frontend docs are its React-scoped subset, not a competing system. The previous Vue app's docs
> live in `../frontend_vue/` and are historical reference only.

## When to update

Update the docs **in the same task** as the code change whenever:

- New routes, components, api functions, query/mutation hooks, Zustand stores, or Zod schemas are
  added, moved, or renamed → `AGENTS.md` navigation table and `CLAUDE.md` architecture section.
- Build/dev/lint/typecheck/format/test commands change → `CLAUDE.md` Commands + `AGENTS.md` Essential
  commands.
- The **API contract** with the backend changes (an endpoint, an auth/CSRF rule, a payload shape) →
  the API contract table in `CLAUDE.md`.
- The state boundary shifts (something moves between TanStack Query and Zustand, a new query-key
  convention) → the State & data flow section in `CLAUDE.md`.
- A core library is added, removed, or swapped (router, styling, HTTP, state) → the stack sections
  in both `CLAUDE.md` and `AGENTS.md`, as part of that change, not after.
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
- Ignore `node_modules/`, `dist/`, `.vite/`, and generated files (`routeTree.gen.ts`) unless the
  task requires them.
- When you learn something reusable (a build trap, a query-invalidation rule), record it in the
  smallest doc that covers it, and keep every doc short enough to re-read often.

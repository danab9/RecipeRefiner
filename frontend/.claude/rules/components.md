# Component & view decisions (frontend)

> Read this before creating a new view, page, or reusable component under `frontend/src/` —
> referenced from `CLAUDE.md`. The `appliesTo` glob above is a scope hint; Claude Code loads this
> file on demand when `CLAUDE.md` points to it, not automatically.

The goal is to reach for the **lightest thing that fits**. Prefer a simple inline component over a
new route, and an inline element over a new shared abstraction, unless a criterion below is met.
Escalate deliberately, not by default.

## Modal / dialog vs. full route

**Default to a modal/dialog** (an inline component rendered in place). Only create a full route when
one of the route criteria holds.

Use a **simple modal/dialog** when:
- The interaction is short and the user should stay in place (confirm-delete, quick login/signup,
  a small form, a detail preview).
- It does **not** need its own URL and is not something a user would bookmark or share.
- Closing it returns the user exactly where they were.

Use a **full route** (`src/routes/` + the TanStack Router tree) when **any** of these holds:
- The content is deep-linkable or shareable (someone should be able to paste the URL).
- It is a primary destination in the app (a top-level nav target).
- It needs real browser back/forward / history behavior.
- It is large or complex enough that living inside a dialog would be awkward.

> RecipeRefiner today: `/`, `/login`, `/history` are routes. A delete confirmation, or a login
> prompt triggered from elsewhere, is a **modal** — do not add a route for it.

### Modal implementation notes (plain Tailwind, no component library)
- Build one small reusable `Modal`/`Dialog` component and reuse it; do not hand-roll a new overlay
  per feature.
- Accessibility is on you (there is no component library): `role="dialog"` + `aria-modal="true"`,
  focus the dialog on open and restore focus on close, trap focus while open, and close on `Esc`
  and backdrop click. A native `<dialog>` element is a reasonable base — use it before reinventing
  overlay/focus logic.
- Keep modal open/close state local to the component that owns it. Only lift it into a Zustand store
  if the modal is opened from unrelated parts of the tree (cross-component UI coordination) — and
  even then, it is UI state, never server data.

## When to extract a shared component

Extract a reusable component (into `src/components/`) when:
- The same markup + behavior appears (or clearly will appear) in **two or more** places.
- A piece of a view has its own cohesive responsibility and local state (e.g. `RecipeCard`,
  `LoginForm`) and pulling it out makes the parent readable.

Do **not** extract when:
- It is used once and abstracting it only adds indirection. Inline it; extract later when the second
  use actually appears.
- The "shared" version would need a pile of props/flags to cover divergent cases — that is two
  components wearing a trenchcoat. Keep them separate.

## Where a new piece of UI goes

- **Route-level page** → `src/routes/` (and register it in the router tree). Keep pages thin: compose
  components and call hooks; push real logic into hooks/components.
- **Reusable component** → `src/components/`.
- **A form** → React Hook Form + a Zod schema (`src/schemas/`); submit hands off to the matching
  TanStack Query mutation hook. See `CLAUDE.md` → Forms.
- **Anything touching the server** → a `src/api/` function + a `src/hooks/` query/mutation hook.
  Components never call `axios` directly.

## Cost / model routing (optional)

For **bulk, well-specified** component scaffolding (e.g. "build these five cards from this spec"),
prefer delegating to the `component-builder` subagent (Sonnet) rather than the main Opus session —
see `.claude/agents/component-builder.md`. Reserve the main session for architecture, the
api/hooks/state layer, routing decisions, and cross-cutting changes. Give the subagent a precise
spec (props, states, Tailwind/layout intent, which shared components to reuse) so it doesn't invent
patterns; review its output against this file and `.claude/rules/lint-and-types.md`.

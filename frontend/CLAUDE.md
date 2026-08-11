# Claude Code Instructions: RecipeRefiner (frontend)

**RecipeRefiner** is a web app that turns a cluttered recipe URL into a clean, ad-free recipe.
A user submits a URL, the backend scrapes it, and the frontend shows the title, ingredients, and
instructions. Logged-in users get their last 20 recipes saved as history.

This file governs the **React frontend** in `frontend/`. The Django REST backend is a separate
concern and is treated here as an **external API** the frontend consumes over `/api` (see
[API contract](#api-contract)). Backend code lives one directory up (`../reciperefiner/`, `../input/`)
and is out of scope for this guide.

> **Status:** this frontend replaces the previous Vue 3 app (`../frontend_vue/`). This document is
> the **source of truth** for the React rewrite. Where it describes files that do not exist yet,
> treat the layout and conventions here as the target to build toward, and keep this file in step
> with the code as it lands.

## Input and Context
- Before executing given instructions, ask only the clarifying questions that are truly required to avoid doing the wrong work.
- Request access to any necessary files or information when it is not already available.
- Confirm understanding of the task before starting implementation when requirements are ambiguous, risky, or broad.
- Prefer discovering available repository context from local files before broad searches.
- Load and follow repository-local AI context files before making changes, especially:
  - `CLAUDE.md` (this file)
  - `AGENTS.md`
  - `.claude/rules/*.md` (path-specific rules — see [AI-facing documentation](#ai-facing-repository-context-and-documentation))
  - `README.md`

## Architecture Overview

### Tech Stack
React 19 (function components, `.tsx`) + TypeScript + Vite (`@vitejs/plugin-react`), with **Tailwind
CSS v4** for styling (utility classes; no component library — components are hand-rolled),
**TanStack Query** for all server state, **TanStack Router** for type-safe routing, **Zustand** for
client/UI state, and **axios** for HTTP. Forms use **React Hook Form** with **Zod** schema
validation (via `@hookform/resolvers`). Tests run on **Vitest** + **React Testing Library**. Icons
via `lucide-react`. See `package.json` for exact versions.

> **Why this split matters:** TanStack Query owns everything that comes from the backend (recipes,
> history, the current user). Zustand owns only client-side/UI state that is *not* server data.
> Don't put server data in Zustand or hand-roll fetching in components — see
> [State & data flow](#state--data-flow).

### Where things live
```
frontend/
  index.html                 → Vite entry HTML (mounts #root)
  vite.config.ts             → Vite config; @vitejs/plugin-react + @tailwindcss/vite,
                               base "/static/" for prod build, "@" alias → ./src
  .env.development           → VITE_API_URL for local dev
  eslint.config.mjs          → ESLint flat config
  tsconfig*.json             → TS project references (app + node)
  src/
    main.tsx                 → App bootstrap: QueryClientProvider + RouterProvider; mounts #root
    App.tsx                  → Root component / layout shell
    index.css                → Tailwind entry (`@import "tailwindcss";`) + global styles
    router/                  → TanStack Router route tree (SPA history routing)
    routes/ (or pages/)      → Route-level pages: Home, History, Login
    lib/
      axios.ts               → axios instance: withCredentials + X-CSRFToken interceptor
      queryClient.ts         → QueryClient configuration
    api/                     → Typed API functions (one per endpoint); the ONLY place axios is called
    hooks/                   → TanStack Query hooks wrapping the api/ functions (useMe, useHistory, …)
    stores/                  → Zustand stores (client/UI state only)
    components/              → MainNav, RecipeCard, LoginForm, SignUpForm, …
    schemas/                 → Zod schemas (form/payload validation), colocated with types where they belong
    types/                   → Shared TypeScript types (Recipe, LoginPayload, RegisterPayload)
    test/                    → Test setup (setupTests.ts) and shared test utilities/render helpers
```

Test files live next to the code they cover as `*.test.ts` / `*.test.tsx`.

### State & data flow
- **Server state → TanStack Query.** Every backend read/write goes through a typed function in
  `src/api/` wrapped by a query/mutation hook in `src/hooks/`. Components call the hooks; they
  **never** call `axios` directly. Recipe scrape, history, delete, login/register/logout, and the
  current user all live here.
- **Auth is a server-derived query.** `useMe()` wraps `GET /api/me/`; logged-out = 401, so the query
  resolves to `null`. The query's `isPending` status is the React equivalent of the old Vue
  `authResolved` flag — use it to distinguish "not known yet" from "not logged in" when gating
  auth-dependent UI. Nothing about the session is persisted client-side; the **Django session cookie
  is the source of truth**. On login/logout, invalidate the `['me']` (and `['history']`) queries so
  the UI re-derives from the server.
- **Client/UI state → Zustand.** Ephemeral, client-only state that is not server data (e.g. the URL
  input draft, transient UI flags, cross-component UI coordination) lives in a small store under
  `src/stores/`. **Do not duplicate server data in Zustand** — if it comes from the API it belongs in
  the TanStack Query cache.

### API contract
The frontend talks to the Django REST API. These rules are unchanged from the Vue app and must be
followed for any new call:

- **Base URL:** `import.meta.env.VITE_API_URL || "/api"`. In dev, `.env.development` points it at
  `http://localhost:8000/api`; in production the build is served same-origin by Django so `/api`
  is correct.
- **Credentials:** the axios instance sets `withCredentials: true` (default + per request). The
  session cookie authenticates the user.
- **CSRF:** an axios request interceptor reads the `csrftoken` cookie and sends it as the
  `X-CSRFToken` header on **every** request. Django sets that cookie when the SPA is first served
  (`ensure_csrf_cookie`).

Endpoints (all under the API base):

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| `POST` | `/` | Scrape a recipe from `{ url }`; returns `{ recipe }` | optional (saves history if logged in) |
| `POST` | `/register/` | Create account `{ username, password, email? }`; auto-logs in | no |
| `POST` | `/login/` | `{ username, password }` | no |
| `POST` | `/logout/` | End session | yes |
| `GET`  | `/me/` | Current user `{ user_id, username }` or 401 | cookie |
| `GET`  | `/history/` | `{ recipes: Recipe[] }` (max 20) | yes |
| `DELETE` | `/delete/:id` | Remove a saved recipe | yes |

The `Recipe` type (`{ id, title, ingredients: string[], instructions: string }`) is defined once in
`src/types/`; reuse it, don't redefine it.

## Developer Workflows

### Commands
```bash
npm run dev        # Vite dev server (http://localhost:5173) — needs the Django API running for auth/recipes
npm run build      # tsc -b (type-check) && vite build → dist/
npm run preview    # Serve the production build locally
npm run lint       # eslint .
npm run typecheck  # tsc -b --noEmit
npm run format     # prettier --write .
npm run test       # vitest run (CI/one-shot)
npm run test:watch # vitest (watch mode)
```

- **Type checking is `tsc`** (via TS project references), run standalone by `npm run typecheck` and
  as the first step of `npm run build`. Lint and format are wired to their own scripts. When a change
  is under `src/`, follow `.claude/rules/lint-and-types.md`.
- Running the full app end to end requires the Django backend (`python manage.py runserver` in the
  repo root, with the root `.env`). The frontend alone cannot log in or fetch recipes.

## Codebase Patterns

### React conventions
> Creating a new view, page, or reusable component? Read `.claude/rules/components.md` first — it
> covers modal-vs-route, when to extract a shared component, and where new UI belongs. Default to
> the lightest thing that fits (a modal over a route, inline over a new abstraction).

- Use **typed function components** in `.tsx`. Type props with an explicit `Props` interface/type;
  do not fall back to plain JS or untyped props.
- Keep components focused: presentation and local UI state in the component; anything that touches
  the server goes through a TanStack Query hook (`src/hooks/`), and shared client state goes through
  a Zustand store (`src/stores/`).
- Use the `@` alias (`@/hooks/useMe`, `@/components/RecipeCard`) for `src`-rooted imports, per
  `vite.config.ts` and `tsconfig`.

### Styling (Tailwind)
- Style with **Tailwind utility classes** directly in the markup. There is no component library —
  build reusable UI by extracting a React component, not by inventing a global CSS class layer.
- Tailwind v4 is configured via `@import "tailwindcss";` in `src/index.css` and the
  `@tailwindcss/vite` plugin — there is no `tailwind.config.js`/PostCSS chain to maintain unless a
  custom theme requires one.
- Keep truly global styles minimal and in `src/index.css`. Prefer utilities over bespoke CSS.
- Icons come from `lucide-react`; import the specific icon component you need.
- **The app must be responsive and mobile-usable.** Design mobile-first — base utilities target
  small screens, then layer breakpoint variants (`sm:`, `md:`, `lg:`) up to larger viewports. Every
  new view or component has to stay usable on a phone: no horizontal overflow, tap targets large
  enough to hit, readable text without zooming, and content that reflows (stack on narrow, spread on
  wide) rather than being cut off. Verify affected screens at a narrow width, not just desktop.

### Adding an API call
1. Add a typed function in `src/api/` (this is the **only** place `axios` is imported/called).
2. It automatically gets `withCredentials` + the `X-CSRFToken` header from the shared axios instance
   in `src/lib/axios.ts` — do not build a second axios instance (see [API contract](#api-contract)).
3. Wrap it in a TanStack Query hook in `src/hooks/`: `useQuery` for reads, `useMutation` for writes.
   Invalidate the affected query keys on success (e.g. a delete invalidates `['history']`).
4. Type the request payload and the response shape; reuse existing types (`Recipe`, `LoginPayload`,
   `RegisterPayload`) from `src/types/` where they apply.
5. Handle the failure path explicitly (network error, 401, 4xx) and surface user-facing feedback.

### Routing
Routes are defined with **TanStack Router** (real SPA history, no hash) under `src/router/` /
`src/routes/`. Because history-mode routing is used, every non-API path is served the SPA
`index.html` by Django's catch-all route — keep new client routes out of the `api/`, `admin/`, and
`static/` namespaces. Prefer TanStack Router's type-safe `Link`/navigation over hand-built anchors.

### Forms (React Hook Form + Zod)
- Build forms with **React Hook Form**; validate with a **Zod** schema wired through
  `zodResolver` (`@hookform/resolvers/zod`). Do not hand-roll `useState`-per-field forms or ad-hoc
  validation.
- Define the Zod schema once and **derive the TypeScript type from it** (`z.infer<typeof schema>`)
  rather than maintaining a separate hand-written type. Where a schema validates an API payload,
  keep it aligned with the shared types in `src/types/` (`LoginPayload`, `RegisterPayload`).
- Validate on submit (or on blur) and surface field-level errors from RHF's `formState.errors`.
  On submit, hand off to the relevant TanStack Query mutation hook — the form validates input, the
  hook owns the request.

## Scope Discipline
- Implement only what is requested.
- Do not refactor unrelated areas.
- Do not change public contracts (the API request/response shapes, hook/store signatures) unless explicitly required.
- Keep pull request and commit diffs focused and easy to review.
- If a useful improvement is out of scope, mention it as a follow-up instead of implementing it silently.

## Code Quality
- Use meaningful names. Avoid one-letter variable names except for conventional short scopes like loop indices.
- Avoid duplicated logic; extract shared behavior into reusable units (an api function, a query hook,
  a Zustand selector, a shared component). If a helper already exists, use it instead of creating a new one.
- Validate external inputs early (a URL before submitting, form fields before a request).
- Handle nulls, missing values, failures, and error paths explicitly (`isPending`/`isError` from Query).
- Keep error messages actionable without exposing secrets or internals.
- Add dependencies only when necessary; prefer built-in React/Tailwind/browser capabilities first.

## Configuration and Security
- Fail fast when required configuration is missing.
- Do not hardcode secrets, credentials, tokens, or environment-specific values. Frontend config
  comes from `import.meta.env.VITE_*` (see `.env.development`); never commit real secrets.
- Never log the CSRF token, session details, or user credentials.
- Use placeholders in documentation examples, such as `<TOKEN>`, `<USERNAME>`, `<ENVIRONMENT>`.

## Documentation and Comments
- Use TSDoc for exported/shared functions, api functions, query hooks, and stores when it adds clarity.
- Add inline comments only for non-obvious behavior (the CSRF interceptor and the `useMe` /
  `isPending` auth gating are good examples of comment-worthy nuance).
- Keep comments accurate and synchronized with the code.

## AI-facing Repository Context and Documentation
Keep the small AI-facing doc layer accurate as the frontend evolves: `CLAUDE.md` (this file),
`AGENTS.md`, `README.md`, and the path-specific rules under `.claude/rules/`. When a task involves
**creating, updating, or relying on** any of these, read `.claude/rules/ai-documentation-system.md` first.

Path-specific rules — read the relevant one when its scope applies:
- **Editing anything under `src/`** → read `.claude/rules/lint-and-types.md` first.
- **Creating a new view, page, or reusable component** → read `.claude/rules/components.md` first
  (modal vs. route, when to extract a shared component, where new UI goes).
- **Creating or editing GitHub Actions workflows** (`.github/workflows/`) → read
  `.claude/rules/cicd-workflows.md` first.
- **Touching the AI-facing docs themselves** → read `.claude/rules/ai-documentation-system.md` first.

## Validation and Testing
- Before committing, run `npm run typecheck`, `npm run lint`, and `npm run test` (or `npm run build`,
  which type-checks and proves the bundle builds). Do not increase the lint/type problem count or
  leave tests red. When the change is under `src/`, follow `.claude/rules/lint-and-types.md`.
- **Tests run on Vitest + React Testing Library.** Test files live next to the code as
  `*.test.ts`/`*.test.tsx`; shared setup lives in `src/test/`. Add or update tests when you add
  non-trivial logic (query/mutation hooks, form/Zod validation, data transforms, store logic).
  Test behavior through the component/hook surface (RTL: query by role/label, assert on what the
  user sees), not implementation details. Mock the network at the axios/`api/` boundary.
- Report the verification commands you ran and their outcomes.
- If blocked, report the exact blocker and the next required action.

## Behavior Rules

### The Principle of Least Change
Make ONLY the exact changes requested. No additional refactors, cleanups, or "improvements" unless explicitly asked.

### Verify Before Acting
If requirements are ambiguous, ask for clarification. Never guess architectural decisions.

### Check Existing Patterns First
Before adding new abstractions:
1. Look at how `src/api/` + `src/hooks/` already do API/auth work.
2. Check whether a similar component exists in `src/components/`.
3. Follow the conventions in sibling files (typed function components, `@` imports, Tailwind usage).

### Code Style
- **camelCase**: variables, functions, hooks (`useX`), Zustand actions.
- **PascalCase**: components, types, interfaces.
- **Meaningful names**: avoid abbreviations (`btn` → `button`, `idx` → `index`).
- **No `console.log`** in committed code; only `console.error` in a catch block when genuinely useful.

## Commit Messages

```
<type>(<scope>): <short summary in imperative mood>

<optional body — explain the why, not the what>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible behavior |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `refactor` | Code change that is not a fix or feature |
| `chore` | Build scripts, CI, dependency updates, maintenance |
| `style` | Formatting or style-only changes with no logic change |
| `perf` | Performance improvement |
| `build` | Build system or dependency changes |
| `ci` | CI/CD workflow changes |

**Examples:**
```
feat(history): add delete confirmation to RecipeCard

fix(auth): invalidate the me query on logout

chore: bump @tanstack/react-query to latest minor
```

- No empty or meaningless messages such as `fix`, `changes`, or `wip` as the full message.
- Keep commits focused around one logical concern.

## Git Workflow: Non-Negotiable Rules
- **Never commit or make code changes directly on `main`.** Automated CI/CD workflows that trigger
  on `main` pushes are the only processes permitted to run against `main` directly.
- Always create a new branch from `main` before touching files, unless the user explicitly instructs otherwise.
- If you realize mid-task that you are on `main`, stop immediately, create a new branch, and continue there.
- Branch names follow `<type>/<short-description>`, e.g. `feat/recipe-print-view`, `fix/csrf-header`,
  `docs/frontend-guide`, `chore/update-dependencies`.

## Planning Workflow
Use this section for `/plan` mode, explicit planning requests, and large implementation tasks.

- **Branching:** state the branch name and the `git checkout -b <branch>` command up front, before
  the work items. Confirm the current branch first; if you are on `main`, getting onto the new
  branch is the first, blocking step.
- **Scope boundaries:** split large work into self-contained streams (api/hooks, stores, components/routes,
  routing, styling, tests) and give each stream full context.
- **Commit strategy:** one logical concern per commit; each commit should leave the app buildable.
- **Testing/verification:** every plan includes a verification phase — at minimum `npm run build`
  (type-check + build), `npm run lint`, and `npm run test`, plus manual checks of the affected
  screens against the running backend.
- **Documentation:** update `README.md`, `AGENTS.md`, and this file when setup, commands,
  structure, or the API contract change.

## Output Expectations for Agent Responses
Final responses should include:
1. What changed, in brief.
2. Files created or modified.
3. Verification commands run and their results.
4. Documentation updates made.
5. Risks or assumptions, if applicable.
6. Next-step handoff notes, if applicable.

# Claude Code Instructions: RecipeRefiner (frontend)

**RecipeRefiner** is a web app that turns a cluttered recipe URL into a clean, ad-free recipe.
A user submits a URL, the backend scrapes it, and the frontend shows the title, ingredients, and
instructions. Logged-in users get their last 20 recipes saved as history.

This file governs the **Vue 3 frontend** in `frontend_vue/`. The Django REST backend is a separate
concern and is treated here as an **external API** the frontend consumes over `/api` (see
[API contract](#api-contract)). Backend code lives one directory up (`../reciperefiner/`, `../input/`)
and is out of scope for this guide.

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
Vue 3 (`<script setup>` SFCs) + TypeScript + Vite, with Vuetify 3 (Material Design components +
`@mdi/font` icons), Pinia (state), vue-router (routing), and axios (HTTP). See `package.json` for
exact versions.

### Where things live
```
frontend_vue/
  index.html                 → Vite entry HTML (mounts #app)
  vite.config.ts             → Vite config; base "/static/" for prod build, "@" alias → ./src
  .env.development           → VITE_API_URL for local dev
  src/
    main.ts                  → App bootstrap: registers Vuetify, Pinia, router; mounts App.vue
    App.vue                  → Root component / layout shell
    router/index.ts          → vue-router routes (createWebHistory SPA)
    store/store.ts           → Single Pinia store: ALL API calls + auth/session/recipe state
    plugins/axios.ts         → axios instance/config
    views/                   → Route-level pages: Home.vue, History.vue, LoginView.vue
    components/               → MainNav, MainElement, RecipeCard, LoginCard, SignUpCard
    style/global.css         → Global styles
    types/                   → Ambient TypeScript declarations
```

### State & data flow
- **Pinia store (`src/store/store.ts`) is the single source of truth** for auth and recipe data,
  and it owns **every** call to the backend. Components dispatch store actions; they do not call
  `axios` directly.
- Auth state (`userId`, `userName`, `authResolved`) is **re-derived from the server on load** via
  `checkUser()` → `GET /api/me/`. Nothing about the session is persisted client-side; the Django
  session cookie is the source of truth. `authResolved` distinguishes "not logged in" from
  "not known yet" — use it to gate UI that depends on auth.
- Recipe history (`oldRecipes`) is fetched on demand via `getUserHistory()`.

### API contract
The store talks to the Django REST API. Key rules, all already established in `store.ts` — follow
them for any new call:

- **Base URL:** `import.meta.env.VITE_API_URL || "/api"`. In dev, `.env.development` points it at
  `http://localhost:8000/api`; in production the build is served same-origin by Django so `/api`
  is correct.
- **Credentials:** `axios.defaults.withCredentials = true`, and pass `withCredentials: true` on
  each request. The session cookie authenticates the user.
- **CSRF:** read the `csrftoken` cookie (`getCsrfTokenFromCookie()`) and send it as the
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

The `Recipe` type (`{ id, title, ingredients: string[], instructions: string }`) is defined in
`store.ts`; reuse it, don't redefine it.

## Developer Workflows

### Commands
```bash
npm run dev       # Vite dev server (http://localhost:5173) — needs the Django API running for auth/recipes
npm run build     # vue-tsc -b (type-check) && vite build → dist/
npm run preview   # Serve the production build locally
```

- **There is no standalone `typecheck` or `lint` npm script.** Type checking runs as part of
  `npm run build` (`vue-tsc -b`). `eslint` and `eslint.config.mjs` are present as dependencies but
  are **not** wired to a script yet. Until they are, run type checking with `npm run build` (or
  `npx vue-tsc -b --noEmit`) and lint with `npx eslint .` if needed. Adding proper `lint` and
  `typecheck` scripts is a worthwhile follow-up — see [Validation](#validation-and-testing).
- Running the full app end to end requires the Django backend (`python manage.py runserver` in the
  repo root, with the root `.env`). The frontend alone cannot log in or fetch recipes.

## Codebase Patterns

### Vue conventions
- Use `<script setup lang="ts">` single-file components — match the existing files.
- Keep components focused: presentation and local UI state in the component; anything that touches
  the server or shared app state goes through the Pinia store.
- Use the `@` alias (`@/store/store`, `@/components/RecipeCard.vue`) for `src`-rooted imports, per
  `vite.config.ts`.

### Vuetify & styling
- Prefer Vuetify components and its layout system over hand-rolled markup where one fits.
- Icons come from `@mdi/font` (Material Design Icons), registered in `main.ts`.
- Global styles live in `src/style/global.css`; component-scoped styles use `<style scoped>`.

### Adding an API call
1. Add an action to the Pinia store (never call axios from a component).
2. Include `withCredentials: true` and the `X-CSRFToken` header (see [API contract](#api-contract)).
3. Type the request payload and the response shape; reuse existing types (`Recipe`,
   `LoginPayload`, `RegisterPayload`) where they apply.
4. Handle the failure path explicitly (network error, 401, 4xx) and surface user-facing feedback.

### Routing
Routes are declared in `src/router/index.ts` using `createWebHistory` (real SPA history, no hash).
Because history mode is used, every non-API path is served the SPA `index.html` by Django's
catch-all route — keep new client routes out of the `api/`, `admin/`, and `static/` namespaces.

## Scope Discipline
- Implement only what is requested.
- Do not refactor unrelated areas.
- Do not change public contracts (the API request/response shapes, store action signatures) unless explicitly required.
- Keep pull request and commit diffs focused and easy to review.
- If a useful improvement is out of scope, mention it as a follow-up instead of implementing it silently.

## Code Quality
- Use meaningful names. Avoid one-letter variable names except for conventional short scopes like loop indices.
- Avoid duplicated logic; extract shared behavior into reusable units (a store action, a composable, a shared component). If a helper already exists, use it instead of creating a new one.
- Validate external inputs early (a URL before submitting, form fields before a request).
- Handle nulls, missing values, failures, and error paths explicitly.
- Keep error messages actionable without exposing secrets or internals.
- Add dependencies only when necessary; prefer built-in Vue/Vuetify/browser capabilities first.

## Configuration and Security
- Fail fast when required configuration is missing.
- Do not hardcode secrets, credentials, tokens, or environment-specific values. Frontend config
  comes from `import.meta.env.VITE_*` (see `.env.development`); never commit real secrets.
- Never log the CSRF token, session details, or user credentials.
- Use placeholders in documentation examples, such as `<TOKEN>`, `<USERNAME>`, `<ENVIRONMENT>`.

## Documentation and Comments
- Use TSDoc for exported/shared functions and store actions when it adds clarity.
- Add inline comments only for non-obvious behavior (the CSRF handling and `authResolved` gating are
  good examples of comment-worthy nuance already in the code).
- Keep comments accurate and synchronized with the code.

## AI-facing Repository Context and Documentation
Keep the small AI-facing doc layer accurate as the frontend evolves: `CLAUDE.md` (this file),
`AGENTS.md`, `README.md`, and the path-specific rules under `.claude/rules/`. When a task involves
**creating, updating, or relying on** any of these, read `.claude/rules/ai-documentation-system.md` first.

Path-specific rules — read the relevant one when its scope applies:
- **Editing anything under `src/`** → read `.claude/rules/lint-and-types.md` first.
- **Creating or editing GitHub Actions workflows** (`.github/workflows/`) → read
  `.claude/rules/cicd-workflows.md` first.
- **Touching the AI-facing docs themselves** → read `.claude/rules/ai-documentation-system.md` first.

## Validation and Testing
- Before committing, run `npm run build` — it type-checks with `vue-tsc` and proves the bundle
  builds. If `eslint` is configured, run it too (`npx eslint .`). When the change is under `src/`,
  follow `.claude/rules/lint-and-types.md`.
- There is no frontend test framework wired up yet. If you add non-trivial logic (store actions,
  URL/form validation, data transforms), propose adding a test runner (e.g. Vitest) rather than
  shipping it untested — but do not scope-creep an unrelated task into a testing-infra change.
- **Recommended follow-up:** add `"typecheck": "vue-tsc -b --noEmit"` and `"lint": "eslint ."`
  scripts to `package.json` so validation is a single documented command.
- Report the verification commands you ran and their outcomes.
- If blocked, report the exact blocker and the next required action.

## Behavior Rules

### The Principle of Least Change
Make ONLY the exact changes requested. No additional refactors, cleanups, or "improvements" unless explicitly asked.

### Verify Before Acting
If requirements are ambiguous, ask for clarification. Never guess architectural decisions.

### Check Existing Patterns First
Before adding new abstractions:
1. Look at how `src/store/store.ts` already does API/auth work.
2. Check whether a similar component exists in `src/components/`.
3. Follow the conventions in sibling files (SFC style, `@` imports, Vuetify usage).

### Code Style
- **camelCase**: variables, functions, store actions, composables.
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

fix(auth): send X-CSRFToken on logout request

chore: bump vuetify to latest minor
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
- **Scope boundaries:** split large work into self-contained streams (store/API, components/views,
  routing, styling, tests) and give each stream full context.
- **Commit strategy:** one logical concern per commit; each commit should leave the app buildable.
- **Testing/verification:** every plan includes a verification phase — at minimum `npm run build`,
  plus manual checks of the affected screens against the running backend.
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

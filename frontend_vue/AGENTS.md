# RecipeRefiner Frontend — AGENTS.md

AI agent and contributor navigation guide for the **Vue 3 frontend** in `frontend_vue/`.
Read this before making changes. For working rules, code style, and the API contract see `CLAUDE.md`.

> **Scope:** this guide covers the frontend only. The Django REST backend (`../reciperefiner/`,
> `../input/`) is an external API from the frontend's perspective — see the API contract in
> `CLAUDE.md`.

## Repository at a glance

| Item | Value |
|------|-------|
| **App** | RecipeRefiner — submit a recipe URL, get a clean ad-free recipe; history for logged-in users |
| **This package** | Vue 3 SPA frontend (`frontend_vue/`) |
| **Stack** | Vue 3 (`<script setup>`), TypeScript, Vite, Vuetify 3, Pinia, vue-router, axios |
| **Package manager** | npm |
| **Default branch** | `main` |
| **Dev port** | 5173 (Vite default) |
| **Backend** | Django 5.2 + DRF, consumed over `/api` (run separately) |

## Essential commands

```bash
npm run dev       # Vite dev server on http://localhost:5173 (needs the Django API running)
npm run build     # vue-tsc -b (type-check) && vite build → dist/
npm run preview   # Serve the production build locally
```

> There is **no** dedicated `lint` / `typecheck` script yet. Type checking happens inside
> `npm run build`. `eslint` + `eslint.config.mjs` exist but aren't wired to a script — run
> `npx eslint .` if you need it. Adding both scripts is a recommended follow-up.

To exercise the app end to end you also need the backend running from the repo root:
`python manage.py runserver` (with the root `.env`). `npm run dev` alone cannot authenticate or
fetch recipes.

## Fast navigation

| Path | Purpose |
|------|---------|
| `src/main.ts` | App bootstrap — registers Vuetify, Pinia, router; mounts `App.vue` |
| `src/App.vue` | Root component / layout shell |
| `src/router/index.ts` | vue-router routes (`createWebHistory` SPA): `/`, `/login`, `/history` |
| `src/store/store.ts` | **Single Pinia store** — all API calls, auth/session state, recipe + history state |
| `src/plugins/axios.ts` | axios instance/config |
| `src/views/Home.vue` | Recipe URL submission + result |
| `src/views/History.vue` | Saved recipe history |
| `src/views/LoginView.vue` | Login / signup |
| `src/components/MainNav.vue` | Top navigation |
| `src/components/MainElement.vue` | Primary content element |
| `src/components/RecipeCard.vue` | Renders a single recipe |
| `src/components/LoginCard.vue`, `SignUpCard.vue` | Auth forms |
| `src/style/global.css` | Global styles |
| `src/types/` | Ambient TypeScript declarations |
| `vite.config.ts` | Vite config: `base: "/static/"` for prod build, `@` → `./src` |
| `.env.development` | `VITE_API_URL` for local dev |
| `index.html` | Vite entry HTML (mounts `#app`) |

## Start here by task

- **Auth / session / CSRF:** `src/store/store.ts` (`checkUser`, `loginFunc`, `registerFunc`,
  `signOutFunc`) — the store owns all of it.
- **Fetch or save a recipe:** `getRecipe`, `getUserHistory`, `deleteRecipe` in the store; UI in
  `views/Home.vue` and `views/History.vue`.
- **A new page/route:** add it in `src/router/index.ts`, create the view under `src/views/`.
- **A new API call:** add a store action (never call axios from a component) — see the API contract
  in `CLAUDE.md`.
- **Styling / layout:** Vuetify components + `src/style/global.css`; `<style scoped>` per component.

## Architecture rules (enforced)

- **All backend communication goes through the Pinia store.** Components dispatch store actions;
  they do not import or call `axios` directly.
- **Every request sends credentials + CSRF.** `withCredentials: true` and the `X-CSRFToken` header
  (read from the `csrftoken` cookie). The Django session cookie is the source of truth for auth;
  the store re-derives user state from `GET /api/me/` on load and never persists it client-side.
- **Never commit or push directly to `main`.** Work on a feature branch. Automated CI/CD on `main`
  is the only exception.
- **Use the `@` alias** for `src`-rooted imports (`@/store/store`), per `vite.config.ts`.
- **`<script setup lang="ts">` SFCs** — match the existing component style.
- **Reuse existing types** (`Recipe`, `LoginPayload`, `RegisterPayload` in `store.ts`); don't redefine them.

## Generated / low-value paths (ignore unless the task needs them)

- `node_modules/`
- `dist/` (build output)
- `.vite/` (Vite cache)

## Docs index

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Working rules, code style, architecture, and the full API contract |
| `README.md` | Vue + Vite template setup notes |
| `.claude/rules/ai-documentation-system.md` | When/how to maintain the AI-facing doc layer |
| `.claude/rules/cicd-workflows.md` | When/how to create CI/deploy/release workflows |
| `.claude/rules/lint-and-types.md` | Lint & TypeScript discipline for this frontend |

## Investigation playbooks

- **UI bug:** inspect the view/component, then the store action it calls, then the network request
  shape against the API contract in `CLAUDE.md`.
- **Auth issue:** check `store.ts` (`checkUser`/`authResolved`), that `withCredentials` and
  `X-CSRFToken` are set, and that the backend is running and CORS/CSRF origins in the root `.env`
  match your dev origin.
- **Build issue:** check `vite.config.ts`, `tsconfig*.json`, and `vue-tsc` output from `npm run build`.

## Notes for agents

- Keep this guide short and path-heavy. Update it when entry points, commands, routes, or the API
  contract change.
- Do not reintroduce backend/infra topics here — this is the frontend guide. Backend lives in the
  repo root and is documented (lightly) there.

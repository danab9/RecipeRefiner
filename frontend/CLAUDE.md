# CLAUDE.md — frontend

Guidance for the Vue SPA in `frontend/`. This is additive to the repo-root `CLAUDE.md`; read that first for the one-origin serving model and the backend/API surface.

## Stack

Vue 3 (`<script setup>` SFCs) + Vuetify 3 + Pinia + vue-router, TypeScript, built with Vite. Bootstrapped in `src/main.ts` (registers Vuetify with all components/directives, the router, and Pinia).

## Commands

From `frontend/` (if `npm` is missing in a fresh terminal: `source ~/.nvm/nvm.sh && nvm use node`):

```bash
npm run dev      # Vite dev server (host)
npm run build    # vue-tsc type-check THEN vite build -> frontend/dist
npm run preview  # serve the built dist locally
```

`build` runs `vue-tsc -b` first, so a type error fails the build. There is no test runner or lint script wired up yet (eslint is installed but unscripted).

## How it's served (why the Vite base flips)

`vite.config.ts` sets `base` to `/static/` for `build` and `/` for `dev`. In production Django serves the built `frontend/dist/index.html` and WhiteNoise serves assets under `/static/`, so the built base must match. The dev server serves from `/`. Don't hardcode asset paths that assume one or the other.

## Auth & API calls — the important part

Auth is Django **session cookie + CSRF**, not tokens. The contract every request must honor:

- Cookies must be sent: `src/store/store.ts` sets `axios.defaults.withCredentials = true` globally, and each action also passes `withCredentials: true` explicitly.
- Mutating requests need an `X-CSRFToken` header read from the `csrftoken` cookie — see `getCsrfTokenFromCookie()` in `store.ts`. Loading the SPA is what sets that cookie (Django wraps the page in `ensure_csrf_cookie`), so a cold call before the page loads has no token.
- API base URL is `import.meta.env.VITE_API_URL || "/api"`. Production is same-origin (`/api`); local dev points at the backend via `VITE_API_URL` in `frontend/.env.development` (gitignored — create it locally).

**Known wart:** `src/plugins/axios.ts` exports a configured `apiClient` that nothing uses (its `withCredentials` is even commented out); `store.ts` uses the bare `axios` default and re-specifies CSRF/credentials headers in every action. If you consolidate, route everything through one configured instance rather than repeating headers — but verify credentials + CSRF still flow before deleting the per-call headers.

## State

One Pinia store (`src/store/store.ts`). The **session cookie is the source of truth for auth** — nothing auth-related is persisted client-side. `checkUser()` (`GET /api/me/`) runs on app load to re-derive user state; `authResolved` flips true once it settles so components can distinguish "not logged in" from "not known yet". Don't reintroduce localStorage for auth.

## Structure

- `src/views/` — routed pages: `Home`, `LoginView`, `History`.
- `src/components/` — `MainNav`, `MainElement`, `RecipeCard`, `LoginCard`, `SignUpCard`.
- `src/router/index.ts` — `createWebHistory` (HTML5 mode; the backend catch-all makes deep links work). Routes have **no auth guards** today — protection is server-side; guard here if you add sensitive client-only routes.
- `src/types/` — shared TS types (recipe/payload shapes also live in `store.ts`).
- `src/plugins/`, `src/style/`.

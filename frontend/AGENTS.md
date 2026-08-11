# RecipeRefiner Frontend — AGENTS.md

AI agent and contributor navigation guide for the **React frontend** in `frontend/`.
Read this before making changes. For working rules, code style, and the API contract see `CLAUDE.md`.

> **Scope:** this guide covers the frontend only. The Django REST backend (`../reciperefiner/`,
> `../input/`) is an external API from the frontend's perspective — see the API contract in
> `CLAUDE.md`. This app replaces the previous Vue 3 frontend in `../frontend_vue/`.

## Repository at a glance

| Item | Value |
|------|-------|
| **App** | RecipeRefiner — submit a recipe URL, get a clean ad-free recipe; history for logged-in users |
| **This package** | React SPA frontend (`frontend/`) |
| **Stack** | React 19 + TypeScript + Vite, Tailwind CSS v4, TanStack Query, TanStack Router, Zustand, axios, React Hook Form + Zod, lucide-react |
| **Testing** | Vitest + React Testing Library |
| **Package manager** | npm |
| **Default branch** | `main` |
| **Dev port** | 5173 (Vite default) |
| **Backend** | Django 5.2 + DRF, consumed over `/api` (run separately) |

## Essential commands

```bash
npm run dev        # Vite dev server on http://localhost:5173 (needs the Django API running)
npm run build      # tsc -b (type-check) && vite build → dist/
npm run preview    # Serve the production build locally
npm run lint       # eslint .
npm run typecheck  # tsc -b --noEmit
npm run format     # prettier --write .
npm run test       # vitest run (one-shot)
npm run test:watch # vitest (watch mode)
```

To exercise the app end to end you also need the backend running from the repo root:
`python manage.py runserver` (with the root `.env`). `npm run dev` alone cannot authenticate or
fetch recipes.

## Fast navigation

| Path | Purpose |
|------|---------|
| `src/main.tsx` | App bootstrap — `QueryClientProvider` + `RouterProvider`; mounts `#root` |
| `src/App.tsx` | Root component / layout shell |
| `src/router/` | TanStack Router route tree (SPA history): `/`, `/login`, `/history` |
| `src/routes/` (or `pages/`) | Route-level pages: Home, History, Login |
| `src/lib/axios.ts` | **The** axios instance — `withCredentials` + `X-CSRFToken` interceptor |
| `src/lib/queryClient.ts` | `QueryClient` configuration |
| `src/api/` | Typed API functions, one per endpoint — the only place axios is called |
| `src/hooks/` | TanStack Query hooks wrapping `api/` (`useMe`, `useHistory`, `useScrapeRecipe`, …) |
| `src/stores/` | Zustand stores — **client/UI state only** |
| `src/components/` | `MainNav`, `RecipeCard`, `LoginForm`, `SignUpForm`, … |
| `src/schemas/` | Zod schemas for form/payload validation (`z.infer` the types from these) |
| `src/types/` | Shared TypeScript types (`Recipe`, `LoginPayload`, `RegisterPayload`) |
| `src/test/` | Vitest setup (`setupTests.ts`) + shared RTL render helpers |
| `*.test.ts` / `*.test.tsx` | Tests, colocated next to the code they cover |
| `src/index.css` | Tailwind entry (`@import "tailwindcss";`) + minimal global styles |
| `vite.config.ts` | Vite config: react + `@tailwindcss/vite`, `base: "/static/"` for prod, `@` → `./src` |
| `.env.development` | `VITE_API_URL` for local dev |
| `index.html` | Vite entry HTML (mounts `#root`) |

## Start here by task

- **Auth / session / CSRF:** `src/hooks/useMe` (wraps `GET /api/me/`) and the login/register/logout
  mutation hooks; the CSRF/credentials interceptor lives in `src/lib/axios.ts`.
- **Fetch or save a recipe:** the query/mutation hooks in `src/hooks/` (recipe scrape, history,
  delete), calling the functions in `src/api/`; UI in the Home and History routes.
- **A new page/route:** add it to the TanStack Router tree in `src/router/`, create the route
  component under `src/routes/` (or `pages/`).
- **A new API call:** add a typed function in `src/api/`, then a TanStack Query hook in `src/hooks/`
  (never call axios from a component) — see the API contract in `CLAUDE.md`.
- **Client/UI state:** add it to a Zustand store in `src/stores/` — but only if it is *not* server data.
- **A form:** React Hook Form + a Zod schema in `src/schemas/` (`zodResolver`); derive the type via
  `z.infer`. Submit hands off to the matching TanStack Query mutation hook.
- **Styling / layout:** Tailwind utility classes in the component; minimal globals in `src/index.css`.
  Build **mobile-first and responsive** — see `CLAUDE.md` → Styling and `.claude/rules/components.md`.
- **A test:** colocate a `*.test.tsx` next to the code; Vitest + RTL, setup in `src/test/`.

## Architecture rules (enforced)

- **All backend communication goes through `src/api/` + TanStack Query hooks.** Components call
  hooks; they never import or call `axios` directly, and there is exactly **one** axios instance.
- **Server state lives in TanStack Query; client/UI state lives in Zustand.** Never duplicate
  server data in Zustand.
- **Auth is server-derived.** `useMe` re-derives the user from `GET /api/me/`; the Django session
  cookie is the source of truth and nothing is persisted client-side. `isPending` gates
  "not known yet" vs "not logged in". Invalidate `['me']`/`['history']` on login/logout.
- **Every request sends credentials + CSRF.** `withCredentials: true` and the `X-CSRFToken` header
  (read from the `csrftoken` cookie) — configured once in `src/lib/axios.ts`.
- **Never commit or push directly to `main`.** Work on a feature branch. Automated CI/CD on `main`
  is the only exception.
- **Use the `@` alias** for `src`-rooted imports (`@/hooks/useMe`), per `vite.config.ts`.
- **Typed function components** in `.tsx` — explicit prop types; no plain JS.
- **Responsive & mobile-usable UI is required.** Build mobile-first (base utilities small-screen,
  then `sm:`/`md:`/`lg:` variants); no horizontal overflow and usable tap targets on a phone.
- **Reuse shared types** (`Recipe`, `LoginPayload`, `RegisterPayload` in `src/types/`); don't redefine them.

## Generated / low-value paths (ignore unless the task needs them)

- `node_modules/`
- `dist/` (build output)
- `.vite/` (Vite cache)
- `routeTree.gen.ts` (generated by TanStack Router, if the file-based plugin is used — do not hand-edit)

## Docs index

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Working rules, code style, architecture, and the full API contract |
| `README.md` | React + Vite setup notes |
| `.claude/rules/ai-documentation-system.md` | When/how to maintain the AI-facing doc layer |
| `.claude/rules/cicd-workflows.md` | When/how to create CI/deploy/release workflows |
| `.claude/rules/components.md` | Modal-vs-route, when to extract a shared component, where new UI goes |
| `.claude/rules/lint-and-types.md` | Lint & TypeScript discipline for this frontend |

## Investigation playbooks

- **UI bug:** inspect the route/component, then the query/mutation hook it calls, then the `api/`
  function and the network request shape against the API contract in `CLAUDE.md`.
- **Auth issue:** check `useMe` and its `isPending`/`null` handling, that `withCredentials` and
  `X-CSRFToken` are set in `src/lib/axios.ts`, and that the backend is running and
  CORS/CSRF origins in the root `.env` match your dev origin.
- **Stale data after a mutation:** check that the mutation invalidates the right query keys
  (`['me']`, `['history']`).
- **Build issue:** check `vite.config.ts`, `tsconfig*.json`, and `tsc` output from `npm run build`.

## Notes for agents

- Keep this guide short and path-heavy. Update it when entry points, commands, routes, or the API
  contract change.
- Do not reintroduce backend/infra topics here — this is the frontend guide. Backend lives in the
  repo root and is documented (lightly) there.
- The old Vue app in `../frontend_vue/` is a reference for behavior/UX only — do not copy Vue/Pinia
  patterns into this React codebase.

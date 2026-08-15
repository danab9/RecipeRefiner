# RecipeRefiner — Frontend

The **React** frontend for RecipeRefiner: paste a cluttered recipe URL and get a clean, ad-free
recipe (title, ingredients, instructions). Logged-in users get their last 20 recipes saved as
history.

Built with React 19 + TypeScript + Vite, Tailwind CSS v4, TanStack Query (server state) and Router
(routing), Zustand (UI state), axios, React Hook Form + Zod (forms), and Vitest + React Testing
Library. It talks to the Django REST backend over `/api`.

> Working rules, architecture, and the full API contract live in `CLAUDE.md`. Navigation and task
> routing live in `AGENTS.md`.

## Prerequisites

- Node 22+ and npm.
- The Django backend running for anything beyond static UI — auth and recipe scraping go through it.
  From the repo root: `python manage.py runserver` (with the root `.env`).

## Setup

```bash
npm install
```

`.env.development` sets `VITE_API_URL=http://localhost:8000/api` for local dev. In production the
build is served same-origin by Django, where `/api` is correct.

## Commands

```bash
npm run dev        # Vite dev server → http://localhost:5555
npm run build      # tsc -b (type-check) && vite build → dist/
npm run preview    # serve the production build locally
npm run lint       # eslint .
npm run typecheck  # tsc -b --noEmit
npm run format     # prettier --write .
npm run test       # vitest run (one-shot)
npm run test:watch # vitest (watch mode)
```

Run `npm run dev` alongside the backend; the frontend alone cannot authenticate or fetch recipes.

## Theming

The app ships a light and dark theme with a toggle in the nav (persisted to `localStorage`,
defaulting to the OS preference). Colors are driven by semantic design tokens in `src/index.css`
consumed as Tailwind utilities — see `CLAUDE.md` → Styling.

## Production build

`npm run build` type-checks and emits `dist/`. `vite.config.ts` sets `base: "/static/"` for the
build because Django/WhiteNoise serves the assets under `/static/`. The repo-root `Dockerfile`
builds the frontend, collects static files, and serves everything through gunicorn.

## Project layout

See `AGENTS.md` for the full path map. In short: `src/api` (typed endpoint functions, the only place
axios is called) → `src/hooks` (TanStack Query wrappers) → `src/routes` + `src/components`
(UI); `src/lib/axios.ts` owns credentials + CSRF; `src/stores` holds UI-only state.

> The previous Vue 3 app lives in `../frontend_vue/` and is kept as historical/UX reference only.

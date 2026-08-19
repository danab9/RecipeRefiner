# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

It is the **repo-wide entry point**: it routes you to the right section and holds the cross-cutting
backend and operational guidance. Frontend depth lives in `frontend/CLAUDE.md`.

## Orientation

- If present, read `HANDOVER.md` first for live working state and a `▶ RESUME HERE` block that git history won't show; `PROJECT.md` holds the durable whole-project picture. Both are gitignored (as is `docs/`), so they may be absent in a fresh clone or for a new contributor — don't assume they exist.
- When guiding someone through commands, label which terminal each runs in (**host** shell vs **container** shell) and whether it blocks — local dev spans both.

## What this is

Submit a recipe URL, get back a clean version (title, ingredients, instructions) without ads or clutter. Registered users get a history of their last 20 recipes. Django + DRF backend, React 19 + TypeScript SPA, served from one origin. Extraction today is the `recipe-scrapers` library only — no LLM in the app yet.

- Prod: https://reciperefiner.onrender.com  ·  Dev: https://reciperefiner-1.onrender.com

## Repo layout — two sections, one Docker image

```
RecipeRefiner/
  input/            → Django app: models, views, serializers, services (scraper, history), tests
  reciperefiner/    → Django project (settings, urls, wsgi/asgi)
  manage.py         → Django entry point
  requirements.txt  → backend deps
  frontend/         → React 19 + TypeScript + Vite SPA (its own CLAUDE.md/AGENTS.md)
  Dockerfile        → multi-stage: builds the frontend, collects static, runs gunicorn + WhiteNoise
```

The frontend build is served by Django under `/static/`; the two ship as **one image**. There is no
separate frontend deploy target.

## Where to go

- **Working in `frontend/`?** Read `frontend/CLAUDE.md` (and `frontend/AGENTS.md`) — the source of
  truth for the React app, including its commands, state model, and styling rules. Do not fold
  backend detail into those frontend docs.
- **Branching / commits (any section)?** Read [`.claude/rules/git-workflow.md`](.claude/rules/git-workflow.md).
- **GitHub Actions / CI (frontend + backend)?** Read [`.claude/rules/cicd-workflows.md`](.claude/rules/cicd-workflows.md).
- **Producing a PR summary?** Use the `/compare-pr` command (`.claude/commands/compare-pr.md`); it
  diffs the whole repo and fills `.claude/templates/pr_template.md`.

## Commands

Local dev is **Docker Compose only** — no host virtualenv, no Django on host Python.

```bash
# host — start, or restart after ANY .env change (.env is read at container CREATION, not start)
docker compose up -d --force-recreate

# host — open a shell in the container
docker compose exec web bash

# host — run the full test suite against SQLite (never the shared Neon DB)
docker compose exec -e DATABASE_URL=sqlite:///db.sqlite3 web python manage.py test

# host — run a single test
docker compose exec -e DATABASE_URL=sqlite:///db.sqlite3 web python manage.py test input.tests.<ClassName>.<test_method>

# container — migrations, shell
python manage.py migrate
python manage.py shell -c "from django.db import connection; print(connection.vendor)"
```

Frontend commands (`npm run dev` / `build` / `lint` / `typecheck` / `test`) are documented in
`frontend/CLAUDE.md`. If `npm` is missing in a fresh terminal: `source ~/.nvm/nvm.sh && nvm use node`.

## Architecture

**One origin.** No separate frontend server in production. Vite builds the SPA into `frontend/dist`; Django serves `index.html` via a catch-all `re_path` in `reciperefiner/urls.py` (excluding `api/`, `admin/`, `static/`), and WhiteNoise serves built assets under `/static/`. That is why `frontend/vite.config.ts` sets `base: "/static/"` for builds only.

**Auth is Django session cookies + CSRF, not tokens.** DRF is configured with `SessionAuthentication` only (`settings.py` `REST_FRAMEWORK`). Consequences:
- Every frontend request needs `withCredentials: true` and an `X-CSRFToken` header — centralised in `frontend/src/lib/axios.ts`.
- The SPA route is wrapped in `ensure_csrf_cookie`, so loading the page sets the `csrftoken` cookie the frontend reads.
- `CSRF_TRUSTED_ORIGINS` must name the deployed hostname or every authenticated POST 403s.
- The frontend never trusts client storage for auth; the session cookie is the source of truth and `GET /api/me/` resolves auth state.

**Backend layout** — `input/` is the only Django app:
- `views.py` — all 7 endpoints, function-based (`@api_view`).
- `services/recipe_processor.py` — `scrape_recipe()`, wraps `recipe-scrapers`.
- `services/history_service.py` — `save_to_history()`, enforces the 20-recipe cap (count, delete oldest, `get_or_create`). Re-submitting an existing URL updates the row and bumps its timestamp.
- `models.py` — `RecipeHistory` (`input_recipehistory`): `user` FK, `url`, `date_time` (auto_now_add), `title`, `ingredients` (JSONField, list of strings), `instructions`. `unique_together = (user, url)`, `ordering = ["-date_time"]`.
- `tests.py` — auth + history coverage. **No coverage on `recipe_processor.py` or `get_url`.**

## API

All endpoints live under `/api/` (defined in `input/urls.py`). **This table is the single source of
truth for the contract** — `frontend/CLAUDE.md` links here rather than restating it.

| Method | Path | Auth | Request → Response |
|---|---|---|---|
| POST | `/api/` | none | `{url}` → `{recipe}`; saves to history if logged in |
| POST | `/api/register/` | none | `{username, password, email?}` → `{user_id, username}`, 201; auto-logs in |
| POST | `/api/login/` | none | `{username, password}` → `{user_id, username}`; 401 on bad credentials |
| POST | `/api/logout/` | required | → `{message}` |
| GET | `/api/me/` | none | → `{user_id, username}`, or 401 if no session; resolves auth state on load |
| GET | `/api/history/` | required | → `{recipes: Recipe[]}`, newest first, max 20 |
| DELETE | `/api/delete/<recipe_id>` | required | → `{message}`, 204; scoped to `request.user` |

`Recipe` is `{id, title, ingredients: string[], instructions}` — typed once in `frontend/src/types/`.

## Working in the backend

Conventions the existing endpoints follow — match them when adding or editing views (`input/views.py`):

- **Function-based views only**, each decorated with `@api_view(["METHOD"])`, returning DRF `Response(..., status=status.HTTP_*)`. No class-based views, no viewsets.
- **Auth is per-view, opt-in.** Protected endpoints add `@permission_classes([IsAuthenticated])`; unprotected ones (`register`, `login`, `get_url`, `me`) simply omit it. `me` is the exception — it checks `request.user.is_authenticated` by hand and returns 401 so the frontend can probe auth state without a hard error.
- **Input is validated by hand in the view**, not via serializers — see the explicit `URLValidator` and per-field `if not username` checks. Serializers are used for **output only** (`RecipeHistorySerializer`). Keep that split unless you're deliberately changing it.
- **Business logic lives in `services/`, views stay thin.** Scraping → `scrape_recipe()`, persistence/cap → `save_to_history()`. Put new logic in a service, not the view.
- **Every user-owned query is scoped by `user=request.user`** (`delete_recipe`, `get_user_history`). This is the ownership guard — never look a `RecipeHistory` row up by `id` alone.
- **Adding an endpoint** = write the view here, register the path in `input/urls.py` (under `/api/`), update the API table above, and add a test to `input/tests.py`. If it touches models, generate a migration — but read "Before changing anything" first; migrations are not free here.

If backend guidance grows past this section, add a `.claude/rules/backend-*.md` and point to it from
here rather than expanding this file.

## Environment & deploy

Backend vars read in `reciperefiner/settings.py`: `SECRET_KEY`, `DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL` (Neon Postgres; omit for SQLite), `ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`, `CSRF_TRUSTED_ORIGINS`. Frontend: `VITE_API_URL` (`frontend/.env.development`); unset → `/api`. There is no `.env.example`. Never hardcode secrets.

Two-stage Dockerfile: node builds the SPA, python runtime copies `dist/` in and runs `collectstatic`. Container start runs `manage.py migrate` then gunicorn. Deploys are Render-driven: `develop` auto-deploys to dev, `main` to prod. Branching and commit conventions live in [`.claude/rules/git-workflow.md`](.claude/rules/git-workflow.md); work is tracked on GitHub Project board #1.

## Before changing anything

This is a public repo backing a live deployment, so operational and security specifics live in the gitignored `HANDOVER.md` / `PROJECT.md`, not here. Check those first. A few structural footguns worth knowing up front:

- **Environments are not isolated at the database layer.** Schema changes need care — read the environments/DB section of `PROJECT.md` before creating a migration.
- **`DEBUG` handling in `settings.py` is subtle** — the env-var parsing does not do what it looks like it does. Confirm the effective value before relying on it.
- **`scrape_recipe`'s failure path is type-inconsistent** — on an unsupported site it can put a non-list into the `ingredients` JSONField that every other path treats as a list.
- **No CI.** `.github/` does not exist; the test suite can rot undetected. Run both suites manually before merging (`manage.py test` in the container, `npm run test` in `frontend/`).

## Local gotchas

- `.env` is read at container **creation** — a plain `restart` won't reload it; use `--force-recreate`.
- Passing empty `-e DATABASE_URL=` breaks Django; pass an explicit `sqlite:///db.sqlite3`.
- `frontend/dist` isn't built locally and the `.:/app` volume mount shadows the image's built `dist/`, so `localhost:8000/` returns `TemplateDoesNotExist`. Hit `/api/...` directly, or run the Vite dev server separately.

## The `.claude/` split

- **Root `.claude/`** = cross-section: the `/compare-pr` command, the PR template, and rules that
  apply to backend *and* frontend (`git-workflow.md`, `cicd-workflows.md`), plus repo-wide settings.
- **`frontend/.claude/`** = React-only: the frontend tool permissions, the `component-builder`
  agent, and the frontend `rules/` (lint-and-types, components, ai-documentation-system).

Keep a file at whichever level it is actually useful: something that only makes sense for the
React app belongs under `frontend/`, not here.

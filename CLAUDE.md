# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Orientation

- If present, read `HANDOVER.md` first for live working state and a `▶ RESUME HERE` block that git history won't show; `PROJECT.md` holds the durable whole-project picture. Both are gitignored (as is `docs/`), so they may be absent in a fresh clone or for a new contributor — don't assume they exist.
- When guiding someone through commands, label which terminal each runs in (**host** shell vs **container** shell) and whether it blocks — local dev spans both.

## What this is

Submit a recipe URL, get back a clean version (title, ingredients, instructions) without ads or clutter. Registered users get a history of their last 20 recipes. Django + DRF backend, Vue 3 + Vuetify SPA, served from one origin. Extraction today is the `recipe-scrapers` library only — no LLM in the app yet.

- Prod: https://reciperefiner.onrender.com  ·  Dev: https://reciperefiner-1.onrender.com

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

Frontend (from `frontend/`; if `npm` is missing in a fresh terminal, `source ~/.nvm/nvm.sh && nvm use node`):

```bash
npm run dev      # Vite dev server
npm run build    # vue-tsc type-check + vite build -> frontend/dist
```

## Architecture

**One origin.** No separate frontend server in production. Vite builds the SPA into `frontend/dist`; Django serves `index.html` via a catch-all `re_path` in `reciperefiner/urls.py` (excluding `api/`, `admin/`, `static/`), and WhiteNoise serves built assets under `/static/`. That is why `vite.config.ts` sets `base: "/static/"` for builds only.

**Auth is Django session cookies + CSRF, not tokens.** DRF is configured with `SessionAuthentication` only (`settings.py` `REST_FRAMEWORK`). Consequences:
- Every frontend request needs `withCredentials: true` and an `X-CSRFToken` header — see `frontend/src/store/store.ts`, which repeats these headers by hand in each action.
- The SPA route is wrapped in `ensure_csrf_cookie`, so loading the page sets the `csrftoken` cookie the frontend reads.
- `CSRF_TRUSTED_ORIGINS` must name the deployed hostname or every authenticated POST 403s.
- The frontend never trusts localStorage for auth; `checkUser()` calls `GET /api/me/` on load.

**Backend layout** — `input/` is the only Django app:
- `views.py` — all 7 endpoints, function-based (`@api_view`).
- `services/recipe_processor.py` — `scrape_recipe()`, wraps `recipe-scrapers`.
- `services/history_service.py` — `save_to_history()`, enforces the 20-recipe cap (count, delete oldest, `get_or_create`). Re-submitting an existing URL updates the row and bumps its timestamp.
- `models.py` — `RecipeHistory` (`input_recipehistory`): `user` FK, `url`, `date_time` (auto_now_add), `title`, `ingredients` (JSONField, list of strings), `instructions`. `unique_together = (user, url)`, `ordering = ["-date_time"]`.
- `tests.py` — auth + history coverage. **No coverage on `recipe_processor.py` or `get_url`.**

## API (all under `/api/`, defined in `input/urls.py`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/` | none | `{"url": ...}` → scraped recipe; saves to history if logged in |
| POST | `/api/register/` | none | username + password, email optional; auto-logs in |
| POST | `/api/login/` | none | |
| POST | `/api/logout/` | required | |
| GET | `/api/me/` | none | 401 if no session; resolves auth state on load |
| GET | `/api/history/` | required | newest first |
| DELETE | `/api/delete/<recipe_id>` | required | scoped to `request.user` |

## Environment & deploy

Backend vars read in `reciperefiner/settings.py`: `SECRET_KEY`, `DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL` (Neon; omit for SQLite), `ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`, `CSRF_TRUSTED_ORIGINS`. Frontend: `VITE_API_URL` (`frontend/.env.development`); unset → `/api`. There is no `.env.example`.

Two-stage Dockerfile: node builds the SPA, python runtime copies `dist/` in and runs `collectstatic`. Container start runs `manage.py migrate` then gunicorn. Branch flow: feature branch → PR into `develop` (auto-deploys to dev) → merge `develop` → `main` promotes to prod. Branch naming: `<issue#>-<b|f>_<slug>`. Work tracked on GitHub Project board #1.

## Critical hazards — read before changing anything

1. **Local, dev, and prod share one Neon database, and `migrate` runs on every container start.** Deploying a branch with a new migration to dev **migrates production**. This blocks all schema work until a separate Neon dev branch exists.
2. **`DEBUG` is effectively always True in production** — `settings.py` uses `bool(os.environ.get("DEBUG", 0))` and `bool("0")` is `True`. Leaks stack traces on public URLs.
3. **A live OpenAI key sits in plaintext at `api_key.txt`** (gitignored, never committed, but live — needs revoking).
4. **`scrape_recipe` failure path is type-inconsistent** — sets `ingredients = ''` (str) into a JSONField every other path treats as a list.
5. **No CI.** `.github/` does not exist; the suite has silently rotted before.

## Local gotchas

- `.env` is read at container **creation** — a plain `restart` won't reload it; use `--force-recreate`.
- Passing empty `-e DATABASE_URL=` breaks Django; pass an explicit `sqlite:///db.sqlite3`.
- `frontend/dist` isn't built locally and the `.:/app` volume mount shadows the image's built `dist/`, so `localhost:8000/` returns `TemplateDoesNotExist`. Hit `/api/...` directly, or run the Vite dev server separately.

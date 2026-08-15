# Claude Code Instructions: RecipeRefiner (repo root)

**RecipeRefiner** turns a cluttered recipe URL into a clean, ad-free recipe. A user submits a URL,
the Django backend scrapes it, and the React frontend renders the title, ingredients, and
instructions. Logged-in users get their last 20 recipes saved as history.

This file is the **repo-wide entry point**. It routes you to the right section and holds only
cross-cutting guidance — it is deliberately short, not a full backend guide.

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

The frontend build is served by Django under `/static/`; the two ship as **one image**. There is
no separate frontend deploy target.

## Where to go

- **Working in `frontend/`?** Read `frontend/CLAUDE.md` (and `frontend/AGENTS.md`) — the source of
  truth for the React app. Do not fold backend detail into those frontend docs.
- **Branching / commits (any section)?** Read [`.claude/rules/git-workflow.md`](.claude/rules/git-workflow.md).
- **GitHub Actions / CI (frontend + backend)?** Read [`.claude/rules/cicd-workflows.md`](.claude/rules/cicd-workflows.md).
- **Producing a PR summary?** Use the `/compare-pr` command (`.claude/commands/compare-pr.md`); it
  diffs the whole repo and fills `.claude/templates/pr_template.md`.

## Backend essentials (Django)

- **Stack:** Django 5.2 + Django REST Framework, Python 3.11. The recipe scrape + history logic
  lives in `input/services/`; the REST API is under `/api/` (contract documented in
  `frontend/CLAUDE.md`).
- **Run / migrate:** `python manage.py runserver` (needs the root `.env`); apply schema changes with
  `python manage.py migrate`. Migrations live in `input/migrations/`.
- **Test:** `python manage.py test` — the suite is in `input/tests.py`.
- **Config:** never hardcode secrets. Runtime config comes from the root `.env`; known keys:
  `SECRET_KEY`, `DEBUG`, `DJANGO_ALLOWED_HOSTS`, `ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`,
  `CSRF_TRUSTED_ORIGINS`, plus a database URL in production.

If backend-specific guidance grows beyond these essentials, add a `.claude/rules/backend-*.md`
and point to it from here rather than expanding this file.

## The `.claude/` split

- **Root `.claude/`** = cross-section: the `/compare-pr` command, the PR template, and rules that
  apply to backend *and* frontend (`git-workflow.md`, `cicd-workflows.md`), plus repo-wide settings.
- **`frontend/.claude/`** = React-only: the frontend tool permissions, the `component-builder`
  agent, and the frontend `rules/` (lint-and-types, components, ai-documentation-system).

Keep a file at whichever level it is actually useful: something that only makes sense for the
React app belongs under `frontend/`, not here.

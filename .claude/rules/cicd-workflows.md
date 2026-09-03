# CI/CD and release workflows

> Repo-wide rule — read this when a task involves creating, updating, or reviewing GitHub Actions
> workflows. It covers **both** the React frontend and the Django backend CI, so it lives at the
> repo root and is referenced from the root `CLAUDE.md` (and `frontend/CLAUDE.md`). Claude Code
> loads it on demand when a `CLAUDE.md` points to it, not automatically.

**Current state:** the repository has **no `.github/workflows/` yet.** Create one only when the task
calls for it. Keep any workflow synchronized with the repo the same way you keep `README.md` and
`AGENTS.md` synchronized.

## Project shape that workflows must respect

RecipeRefiner is a **Django backend + React frontend** in one repo, shipped as a single Docker image
(see the repo-root `Dockerfile`):

- **Frontend** (`frontend/`, this package): `npm ci` → `npm run build` (`tsc -b && vite build`)
  → `dist/`. Type checking happens inside the build; lint is a separate `npm run lint` step and
  tests run via `npm run test` (Vitest + React Testing Library).
- **Backend** (repo root): Django 5.2 + DRF. Tests via `python manage.py test`; the test suite lives
  in `input/tests.py`.
- **Deploy:** the multi-stage `Dockerfile` builds the frontend, collects static files, and runs
  `gunicorn` behind WhiteNoise. Production is container-based (Render, Neon Postgres). Do **not**
  invent a separate frontend-only deploy target — the built frontend is served by Django under
  `/static/`.

> **Directory note:** the frontend now lives in `frontend/` (React). The previous Vue app was in
> `frontend_vue/`, and older `Dockerfile`/CI references may point at either. **Confirm which
> directory the `Dockerfile` copies from before wiring a workflow to it** — don't hardcode a path
> that doesn't match the current tree.

## When to create workflows

- **CI** (`.github/workflows/ci.yml`): on push and PR to `main` — lint, test, and build the frontend
  and run the Django tests. Create when the repo warrants automated checks.
- **Deploy** (`.github/workflows/deploy.yml`): only if a deployment target needs to be driven from
  GitHub (Render can also deploy on its own from a connected repo — check before adding one).
- **Release** (`.github/workflows/release.yml`): only if the repo adopts a maintained `CHANGELOG.md`
  and versioned releases (it does not today).

Before creating any workflow:
- Detect the stack from manifests (`package.json`, `requirements.txt`, `Dockerfile`) rather than
  assuming versions. Frontend Node comes from the `Dockerfile` build stage; backend Python is 3.11.
- Use `ubuntu-latest` unless a reason says otherwise.
- Reuse the real commands (`npm run build`, `npm run lint`, `npm run test`, `python manage.py test`)
  — don't invent new ones.
- **Never hardcode secrets, hosts, or deployment paths.** Use `secrets`, `env`, or workflow inputs,
  and document required secret names in `README.md` / `AGENTS.md`. Known runtime secrets from
  `.env`: `SECRET_KEY`, `DEBUG`, `DJANGO_ALLOWED_HOSTS`, `ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`,
  `CSRF_TRUSTED_ORIGINS`, plus a database URL in production.

## When to update workflows

Update an existing workflow when any of these change: Node/Python version, build/test/lint commands,
frontend directory name, project layout, deployment target, or the default branch.

If a code change makes a workflow stale (wrong path or command), fix the workflow in the same task.

## Generic CI template

Replace every `<placeholder>` and drop steps that don't apply. Confirm the `working-directory` and
`cache-dependency-path` match the real frontend directory.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run test           # vitest run
      - run: npm run build          # tsc type-check + vite build

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python manage.py test
        env:
          SECRET_KEY: test-only-not-a-real-secret
          DEBUG: '1'
```

## Generic deploy template

Deploy only on `main` (or manual dispatch). Keep environment-specific values in secrets/inputs.
Prefer building the existing `Dockerfile` over re-implementing the build in YAML.

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Build the repo-root Dockerfile (frontend + backend in one image),
      # then push/deploy to the configured target using repository secrets.
      - name: Build image
        run: docker build -t reciperefiner:${{ github.sha }} .
      # - name: Deploy
      #   run: <deploy-command using ${{ secrets.* }}>
```

## Workflow validation

- After creating or editing a workflow, validate YAML syntax and confirm step names, paths, and
  commands match the current repo (especially the frontend directory name).
- Keep secret names documented in `README.md` / `AGENTS.md`; never commit secret values.
- Keep the canonical build/test/lint commands in `AGENTS.md` and `CLAUDE.md` in sync with the workflow.

# RecipeRefiner — local setup

Get the app running on your machine. Follow the steps in order.

> **Where things live.** Everything you need for setup is in this `onboarding/` folder:
> this guide, `env.example` (the settings template) and `generate-secret-key.md`.
> The file you actually create — `.env` — goes in the **project root**, one level up.
> Commands below run from the **project root** unless a step says otherwise.
Two things run: the **backend** (Django, in Docker, port 8000) and the **frontend**
(Vite, on your machine, port 5555).

Terminal commands below say **host** — that means your normal Mac terminal, in the
project folder, unless stated otherwise.

---

## Step 0 — Install Docker Desktop

Docker runs the backend for you. You never install Python or Django yourself.

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
   Pick the build for your Mac chip (Apple Silicon vs Intel — "About This Mac" tells you).
2. Open the downloaded `.dmg` and drag **Docker** into **Applications**.
3. Open Docker from Applications. Accept the terms. Skip the sign-in — you don't need an account.
4. Wait for the whale icon in the top menu bar to stop animating. Steady whale = ready.

Check it worked — **host**:

```bash
docker --version
```

You should see a version number. If you see `Cannot connect to the Docker daemon`,
Docker Desktop isn't running yet — open it and wait.

**Leave Docker Desktop running whenever you work on this project.**

---

## Step 1 — Get the code

**host**:

```bash
git clone https://github.com/danab9/RecipeRefiner.git
cd RecipeRefiner
git checkout develop
```

If you already have the repo, just:

```bash
cd RecipeRefiner
git checkout develop
git pull
```

Everything from here runs from inside the `RecipeRefiner` folder.

---

## Step 2 — Create your `.env`

`.env` holds your local settings. It is **not** in git, so you create your own.

**host**, from the project root:

```bash
cp onboarding/env.example .env
```

That creates `.env` in the project root. It must be there, not inside `onboarding/` —
Docker reads it from the root.

Now open `.env` in your editor. Two lines are empty and marked `TODO`. The next two
steps fill them in.

---

## Step 3 — Generate your `SECRET_KEY`

This is a random string Django uses to sign login cookies. Yours is yours alone —
do not copy anyone else's, and do not use the one from Render.

(Same steps, on their own, in `onboarding/generate-secret-key.md`.)

**host**:

```bash
python3 -c "import secrets,string; print(''.join(secrets.choice(string.ascii_letters+string.digits+'!@#\$%^&*(-_=+)') for _ in range(50)))"
```

Copy the whole line it prints into `.env`:

```
SECRET_KEY=<paste here>
```

No quotes, no spaces around the `=`.

---

## Step 4 — Get your database URL

The database is hosted on **Neon**. It has *branches* — copies of the database.
Production lives on the `main` branch. **You must never point your laptop at `main`.**
Local test users and half-broken migrations would land in the real app.

Ask Dana to invite you to the Neon project, then:

1. Log in at https://console.neon.tech and open the **RecipeRefiner** project.
2. Go to **Branches** → **New branch**.
3. Parent branch: `main`. Name it `dev-<yourname>`.
4. If there's an **expiration / auto-delete** option, turn it **off** — otherwise your
   branch disappears after a day.
5. Create it. Open your new branch → **Connect** → copy the connection string.

Paste it into `.env`:

```
DATABASE_URL=postgresql://...
```

Sanity check: the `ep-...` part of your string must be **different** from production's.
If they match, you copied the wrong branch.

That string contains a password. Don't paste it into chat, Slack, or a commit.

---

## Step 5 — Start the backend

**host**:

```bash
docker compose up -d --force-recreate
```

First run takes a few minutes (it downloads and builds). Later runs take seconds.
It returns you to the prompt when done — it does **not** block your terminal.

You may see a warning about `version` being obsolete. Ignore it, it's harmless.

`--force-recreate` matters: Docker only reads `.env` when it **creates** the
container. If you edit `.env` later, you must run this exact command again — a plain
restart keeps the old values.

---

## Step 6 — Check it worked

**host** — confirm you're on your own database, not production:

```bash
docker compose exec web python manage.py shell -c "from django.db import connection; print(connection.settings_dict['HOST'])"
```

It should print your `ep-...` host from step 4. If it prints a different one, your
`.env` edit didn't take — redo step 5.

**host** — confirm the API responds:

```bash
curl -i http://localhost:8000/api/me/
```

`HTTP/1.1 401 Unauthorized` is the **correct** answer — it means Django is running and
correctly says "nobody is logged in".

> Heads-up: opening `http://localhost:8000/` in a browser shows `TemplateDoesNotExist`.
> That is expected locally and not a bug — the built frontend isn't there in dev.
> Use the Vite server (step 7) for the UI.

---

## Step 7 — Start the frontend

**host**, in a second terminal:

```bash
cd RecipeRefiner/frontend
npm install
npm run dev
```

If `npm` isn't found:

```bash
source ~/.nvm/nvm.sh && nvm use node
```

`npm run dev` **blocks** — it keeps running and prints a URL. Leave that terminal open.
Open the URL it shows (http://localhost:5555) in your browser.

Stop it with `Ctrl+C`.

---

## Everyday use

| What | Command (**host**) | Blocks? |
|---|---|---|
| Start backend | `docker compose up -d` | no |
| Stop backend | `docker compose down` | no |
| Backend logs | `docker compose logs -f web` | yes — `Ctrl+C` to exit |
| Shell inside container | `docker compose exec web bash` | yes — `exit` to leave |
| Run backend tests | `docker compose exec -e DATABASE_URL=sqlite:///db.sqlite3 web python manage.py test` | yes |
| Run frontend tests | `npm run test` (in `frontend/`) | yes |
| After editing `.env` | `docker compose up -d --force-recreate` | no |

Backend tests deliberately use a throwaway SQLite file, never Neon. Keep the
`-e DATABASE_URL=...` part.

---

## Rules

1. **Never point `.env` at the `main` Neon branch.** That's production data.
2. **Never commit `.env`**, and never paste its contents anywhere. `onboarding/env.example`
   *is* committed, so it must never hold a real value — placeholders only.
3. Your `SECRET_KEY` and `DATABASE_URL` are yours — nobody else needs them.
4. Branch from `develop`, open PRs into `develop`. Never commit to `main` or `develop`
   directly. See `.claude/rules/git-workflow.md`.

---

## When something breaks

**`Cannot connect to the Docker daemon`**
Docker Desktop isn't running. Open it, wait for the steady whale, retry.

**Backend changes don't show up**
Code is live-mounted, so most edits apply instantly. If not: `docker compose restart web`.

**`.env` changes don't show up**
`docker compose up -d --force-recreate`. A plain restart won't do it.

**Port 8000 or 5555 already in use**
Something else is using it. `docker compose down`, or quit the other program.

**Login/POST fails with 403**
Usually a CSRF origin mismatch. Check `CSRF_TRUSTED_ORIGINS` in `.env` lists the port
Vite actually printed.

**Anything database-shaped and scary**
Stop and ask before running it. Check which branch you're on first (step 6).

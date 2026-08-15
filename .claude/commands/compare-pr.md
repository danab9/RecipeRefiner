---
description: Compare the current branch to main and produce a PR-ready summary
---

Compare the current git branch against `main` and produce a reviewer-ready PR
summary. Do the whole thing yourself — do not ask the user to run scripts or
paste output.

## Steps

1. Fetch and gather the diff data by running these commands (adjust `origin/main`
   to `main` if there is no remote):

   ```bash
   git fetch origin
   git rev-parse --abbrev-ref HEAD
   git diff --name-status origin/main...HEAD
   git log --oneline origin/main..HEAD
   git diff --stat origin/main...HEAD
   ```

2. Inspect the actual diff for the important files (`git diff origin/main...HEAD -- <file>`)
   as needed so the summary reflects real changes, not just filenames.

3. Produce the following as plain text, in this order:

   - **PR Title** — a 5–8 word summary.
   - **PR Lead** — one concise, reviewer-focused paragraph (3–5 sentences) on
     what changed and why.
   - **File summary** — a bulleted list, one line per major file or grouped area
     (frontend / backend / migrations / tests / docs).
   - **Commits** — the `git log --oneline` output verbatim in a code block.
   - **PR Body** — fill in the template below with detected files/commits and
     sensible defaults.

## Constraints

- Group files into areas (frontend/backend/migrations/tests/docs) when helpful.
- If migrations exist, call them out and include `python manage.py migrate` steps.
- If more than 30 files changed, produce a short-mode summary (top-level areas
  only) and note where the full list lives.
- `$ARGUMENTS` — if the user passed a base branch or ref, compare against that
  instead of `main`.

## PR Body template

```
Title: [Short summary — 5–8 words]

Summary:
One-paragraph (3–5 sentences) summarizing the change and intent.

Files changed:
- {{FILE_COUNT}} files changed (major files below):
- {{MAJOR_FILES}}

Commits:
```
{{COMMITS}}
```

Areas touched:
- Frontend: ...
- Backend: ...
- DB/migrations: ...
- Tests: ...
- Docs: ...

Migrations:
- {{MIGRATION_FILES_OR_NONE}}

How to test locally:
```bash
git fetch origin
git checkout <branch>
cd frontend && npm install && npm run dev
python -m venv .venv && .\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Notes / Risks:
- ...

Checklist:
- [ ] Tests added/updated
- [ ] Docs updated
- [ ] Migration applied and rollback considered
- [ ] CI passes
```

Output only the requested content — no extra commentary.

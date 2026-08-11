Title: [Short summary — 5–8 words]

Summary:

One-paragraph (3–5 sentences) summarizing the change and intent.

Files changed:

- `{{FILE_COUNT}}` files changed (list major files below):
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
# repo root
git fetch origin
git checkout <branch>
# frontend
cd frontend
npm install
npm run dev
# backend
python -m venv .venv
.\.venv\Scripts\activate
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

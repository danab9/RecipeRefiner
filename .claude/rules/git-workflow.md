# Git workflow, branching & commit conventions (repo-wide)

> Cross-section rule — applies to the **Django backend** (repo root) and the **React frontend**
> (`frontend/`) alike. Referenced from the root `CLAUDE.md` and from `frontend/CLAUDE.md`.

## Branching: non-negotiable rules

- **Never commit or make code changes directly on `main`.** Automated CI/CD workflows that trigger
  on `main` pushes are the only processes permitted to run against `main` directly.
- Always create a new branch from `main` before touching files, unless the user explicitly instructs otherwise.
- If you realize mid-task that you are on `main`, stop immediately, create a new branch, and continue there.
- Branch names follow `<type>/<short-description>`, e.g. `feat/recipe-print-view`, `fix/csrf-header`,
  `docs/frontend-guide`, `chore/update-dependencies`.

## Commit messages

```
<type>(<scope>): <short summary in imperative mood>

<optional body — explain the why, not the what>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible behavior |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `refactor` | Code change that is not a fix or feature |
| `chore` | Build scripts, CI, dependency updates, maintenance |
| `style` | Formatting or style-only changes with no logic change |
| `perf` | Performance improvement |
| `build` | Build system or dependency changes |
| `ci` | CI/CD workflow changes |

`<scope>` names the area touched — frontend scopes like `history`, `auth`, `recipe`; backend
scopes like `api`, `models`, `scraper`, `migrations`.

**Examples:**
```
feat(history): add delete confirmation to RecipeCard

fix(auth): invalidate the me query on logout

fix(api): return 404 instead of 500 for an unknown recipe id

chore: bump @tanstack/react-query to latest minor
```

- No empty or meaningless messages such as `fix`, `changes`, or `wip` as the full message.
- Keep commits focused around one logical concern; each commit should leave its section buildable.

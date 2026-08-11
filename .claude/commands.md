# Quick git commands

Fetch latest remote refs:

```bash
git fetch origin
```

Show current branch:

```bash
git rev-parse --abbrev-ref HEAD
```

Files changed vs `origin/main` (name + status):

```bash
git diff --name-status origin/main...HEAD
```

Commits on this branch not in `origin/main`:

```bash
git log --oneline origin/main..HEAD
```

Diffstat summary:

```bash
git diff --stat origin/main...HEAD
```

Save changed files and commits for assistant consumption:

```bash
git diff --name-only origin/main...HEAD > .claude/changed_files.txt
git log --oneline origin/main..HEAD > .claude/commits.txt
git diff --stat origin/main...HEAD > .claude/diffstat.txt
```

# Compare Branch to `main` and Summarize Changes

Purpose: Provide step-by-step commands and a concise template for comparing the current branch (remote) against `main`, summarizing changes, and producing a PR-ready text summary.

## How to produce the summary (manual or assistant workflow)

# install deps if needed

# frontend example

# Compare Branch to `main` — index

This file is a short index for the `.claude/` helpers. Detailed commands, templates,
and the assistant prompt live in the subfiles below.

Files:

- `commands.md` — quick git commands to run and how to save artifacts.
- `prompts/assistant_prompt.md` — the exact assistant prompt to use when asking for a PR summary.
- `templates/pr_template.md` — PR body template that the assistant will fill.
- `scripts/` — `compare.sh` and `compare.ps1` to generate `.claude/changed_files.txt`, `.claude/commits.txt`, and `.claude/diffstat.txt`.

Suggested flow:

1. Run `.claude/scripts/compare.sh` (or `.claude/scripts/compare.ps1` on Windows).
2. Open `.claude/changed_files.txt` and `.claude/commits.txt`.
3. Paste those artifacts into your assistant using `prompts/assistant_prompt.md` to generate a PR body.

For full details see [README](README.md).

```

```

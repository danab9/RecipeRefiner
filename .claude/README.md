# .claude helpers

This folder contains small helpers to compare the current branch to `main`, generate concise summaries, and produce PR-ready text that can be pasted into GitHub.

Structure

- `commands.md` — quick git commands to run locally.
- `compare_and_summarize.md` — short intent + pointer to templates and scripts.
- `prompts/assistant_prompt.md` — exact assistant prompt to feed Claude or another LLM to generate a PR body.
- `templates/pr_template.md` — PR body template with placeholders.
- `scripts/compare.sh` and `scripts/compare.ps1` — scripts to run the git commands and save artifact files (`changed_files.txt`, `commits.txt`, `diffstat.txt`).

Usage

1. Run the appropriate script in your repo root (bash or PowerShell).
2. Open the generated `changed_files.txt` and `commits.txt`.
3. Use `prompts/assistant_prompt.md` and paste those outputs into the assistant to generate a PR body.

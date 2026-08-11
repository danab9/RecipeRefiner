Assistant prompt — paste this into Claude or your assistant and include the contents of `.claude/changed_files.txt` and `.claude/commits.txt` when asked.

---

You are given two artifacts extracted from a git repository:

1. `changed_files.txt` — newline-separated list of changed files between `origin/main` and the current branch.
2. `commits.txt` — `git log --oneline origin/main..HEAD` output.

Produce the following outputs as plain text, in this exact order:

1. PR Title: a 5–8 word summary.

2. PR Lead: a one-paragraph (3–5 sentence) summary explaining what changed and why.

3. File summary: a short bulleted list (one-liner per major file or grouped area) explaining the role of each change.

4. Commits: include the `commits.txt` contents verbatim under a code block.

5. PR Body: Fill the `.claude/templates/pr_template.md` using the detected files/commits and sensible defaults for placeholders.

Constraints:

- Keep the PR Lead concise and reviewer-focused.
- Group files into areas (frontend/backend/migrations/tests/docs) when helpful.
- If migrations exist, highlight them and provide `manage.py migrate` steps.
- If many files changed (>30), produce a short-mode summary (top-level only) and note where to find the full lists.

Output only the requested content (no commentary or extra notes).

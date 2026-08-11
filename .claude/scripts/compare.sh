#!/usr/bin/env bash
set -euo pipefail

# Usage: run from repository root
# Produces artifacts in .claude/

mkdir -p .claude

echo "Fetching origin..."
git fetch origin

BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $BRANCH"

echo "Saving changed_files.txt..."
git diff --name-only origin/main...HEAD > .claude/changed_files.txt

echo "Saving commits.txt..."
git log --oneline origin/main..HEAD > .claude/commits.txt

echo "Saving diffstat.txt..."
git diff --stat origin/main...HEAD > .claude/diffstat.txt

echo "Artifacts written to .claude/changed_files.txt, commits.txt, diffstat.txt"

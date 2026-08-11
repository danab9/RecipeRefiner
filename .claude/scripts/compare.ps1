# PowerShell equivalent: run from repository root
Param()

New-Item -ItemType Directory -Path .claude -Force | Out-Null
Write-Host 'Fetching origin...'
git fetch origin

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Current branch: $branch"

Write-Host 'Saving changed_files.txt...'
git diff --name-only origin/main...HEAD | Out-File -Encoding utf8 .claude\changed_files.txt

Write-Host 'Saving commits.txt...'
git log --oneline origin/main..HEAD | Out-File -Encoding utf8 .claude\commits.txt

Write-Host 'Saving diffstat.txt...'
git diff --stat origin/main...HEAD | Out-File -Encoding utf8 .claude\diffstat.txt

Write-Host 'Artifacts written to .claude/changed_files.txt, commits.txt, diffstat.txt'

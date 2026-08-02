---
name: git-commit
description: Commit repository changes with the required Windows Git executable and branch-prefixed commit-message convention. Use whenever Codex is asked to stage or commit changes in this repository.
---

# Git Commit

## Git executable

Always invoke Git from this absolute path in PowerShell:

```powershell
$gitExe = "C:\Program Files\Git\cmd\git.exe"
& $gitExe <arguments>
```

If Git reports dubious repository ownership, pass the resolved repository root with `-c "safe.directory=<absolute-repository-root>"` for that invocation. Do not modify the user's global Git configuration.

## Commit workflow

1. Inspect `status -sb`, the unstaged diff, and the staged diff.
2. Stage only files that belong to the requested task.
3. Run relevant validation and `diff --check` before committing.
4. Read the current branch immediately before creating the commit:

```powershell
$branchName = & $gitExe branch --show-current
```

5. Stop and ask for direction when `$branchName` is empty because the repository is in detached HEAD state.
6. Always prefix the commit subject with the exact current branch name:

```text
<branch-name>: <commit message>
```

For example, on branch `feature/sql`:

```text
feature/sql: implement category management CRUD
```

Create the commit with:

```powershell
& $gitExe commit -m "${branchName}: $commitMessage"
```

Ensure the branch prefix appears exactly once. Apply the same convention when amending a commit message.

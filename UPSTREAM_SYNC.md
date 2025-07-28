# Upstream Sync Workflow

This repository is forked from https://github.com/vercel/v0-platform-api-demo

## Quick Sync Commands

### Method 1: Merge (Recommended)
```bash
git sync-upstream
```
This fetches changes from upstream and merges them into your main branch.

### Method 2: Rebase (Cleaner history)
```bash
git sync-upstream-rebase
```
This fetches changes from upstream and rebases your main branch on top.

## Manual Sync Process

If you prefer to sync manually:

```bash
# 1. Fetch the latest changes from upstream
git fetch upstream

# 2. Checkout your main branch
git checkout main

# 3. Merge upstream changes
git merge upstream/main

# 4. Push to your fork
git push origin main
```

## Handling Conflicts

If you encounter merge conflicts:

1. Fix the conflicts in your editor
2. Stage the resolved files: `git add .`
3. Complete the merge: `git commit`
4. Push to your fork: `git push origin main`

## Checking for Updates

To see what changes are available upstream without merging:
```bash
git fetch upstream
git log main..upstream/main --oneline
```

## Best Practices

- Sync regularly to avoid large conflicts
- Keep your main branch clean (make changes in feature branches)
- Always sync before starting new work
- Consider using rebase for a cleaner history if you haven't pushed your changes yet
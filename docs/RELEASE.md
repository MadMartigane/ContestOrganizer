# Release Workflow

## Overview

The release process is now decoupled from deployment. Use the `pnpm run release` command to bump versions, create git commits/tags, and push to remote.

## Commands

### Release a new version

```bash
# Patch release (0.0.1 -> 0.0.2)
pnpm run release patch

# Minor release (0.1.0 -> 0.2.0)
pnpm run release minor

# Major release (1.0.0 -> 2.0.0)
pnpm run release major
```

### Dry-run (test without git operations)

```bash
# Test the release process without committing or pushing
pnpm run release:dry-run patch
```

This will:
- Bump the version in package.json
- Generate status-data files
- Skip all git operations

### With environment context

```bash
# Release for pre-production (adds -preprod suffix)
VERSION_CONTEXT=preprod pnpm run release minor

# Release for production (adds -prod suffix)
VERSION_CONTEXT=prod pnpm run release patch
```

## Workflow

1. **Release first**: Run `pnpm run release <patch|minor|major>`
   - Bumps version in package.json
   - Generates status-data.json and status-data.d.ts
   - Creates git commit: `release: vX.Y.Z (type)`
   - Creates git tag: `vX.Y.Z`
   - Pushes commit and tag to origin

2. **Deploy after**: Run deployment commands
   ```bash
   pnpm run deploy:preprod   # Deploy to pre-production
   pnpm run deploy:prod      # Deploy to production
   ```

The deployment script uses the version already set by the release command.

## Environment Variables

- `VERSION_CONTEXT`: Controls the version suffix
  - `manual` or unset: adds `-dev` suffix
  - `preprod`: adds `-preprod` suffix
  - `prod`: adds `-prod` suffix

## Git Operations

The release command performs the following git operations:

1. `git add package.json src/generated/status-data.json src/generated/status-data.d.ts`
2. `git commit -m "release: vX.Y.Z (type)"`
3. `git tag vX.Y.Z`
4. `git push origin <branch> --tags`

## Rollback Procedures

### Release completed but push failed

```bash
git reset --hard HEAD~1
git tag -d vX.Y.Z
```

### Release pushed but need to revert

```bash
git revert HEAD
pnpm run release <correct-type>
```

## Troubleshooting

### Dirty working tree

If you have uncommitted changes, the release will fail. Either:
- Commit your changes first
- Stash them: `git stash`
- Use dry-run to test: `pnpm run release:dry-run patch`

### Protected branch

If push fails due to branch protection:
1. Use `--skip-push` flag: `pnpm run release patch --skip-push`
2. Push manually after reviewing

## Examples

### Typical patch release flow

```bash
# Make your changes
# ... edit files ...

# Commit your changes
git add .
git commit -m "feat: my feature"

# Release
git push origin main
pnpm run release patch

# Deploy
pnpm run deploy:prod
```

### Pre-production release

```bash
VERSION_CONTEXT=preprod pnpm run release minor
pnpm run deploy:preprod
```

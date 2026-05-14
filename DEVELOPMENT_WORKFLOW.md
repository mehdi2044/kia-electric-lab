# Kia Electric Lab Development Workflow

This document defines the long-term Git and delivery workflow for Kia Electric Lab.

## Branch Strategy

### `main`

Purpose:

- Stable release branch.
- Only verified baselines and release-ready code belong here.
- Tags are created from this branch unless Vi approves otherwise.

Rules:

- No risky direct development.
- Merge from `develop` after tests/build/docs are complete.
- Keep history understandable.

### `develop`

Purpose:

- Active integration branch.
- All normal feature work returns here before release.

Rules:

- Branch new work from `develop`.
- Merge completed `feature/*` branches back into `develop`.
- Keep `develop` buildable.

### `feature/*`

Purpose:

- Isolated product and engineering features.

Examples:

```text
feature/circuit-deletion
feature/wire-path-routing
feature/cost-profile-editor
```

Rules:

- Start from `develop`.
- Keep scope narrow.
- Include tests and documentation updates.
- Merge back into `develop` after review/verification.

### `experimental/*`

Purpose:

- Risky ideas, uncertain architecture, prototypes, AI tutor experiments, or simulator research.

Examples:

```text
experimental/graph-topology-engine
experimental/ai-tutor-context
experimental/multiplayer-state-sync
```

Rules:

- Do not merge into `main` directly.
- Promote into a `feature/*` branch only after architecture approval.
- Document what was learned, even if discarded.

## Standard Development Flow

1. Start from `develop`.
2. Create a focused branch:

```bash
git checkout develop
git checkout -b feature/descriptive-name
```

3. Implement the change.
4. Update tests.
5. Update `project-docs/`.
6. Run verification:

```bash
npm test
npm run build
```

7. Commit with a descriptive message.
8. Merge into `develop`.
9. For stable release, merge `develop` into `main`.
10. Tag the release from `main`.

## Release Flow

Use this flow for stable releases:

```bash
git checkout develop
npm test
npm run build
git checkout main
git merge --no-ff develop
git tag -a vX.Y-name -m "release: describe release"
```

For Phase 1, the baseline tag is:

```text
v0.1-phase1-baseline
```

## Recovery Strategy

### Recover Current Work

Check state:

```bash
git status
```

Review changed files:

```bash
git diff
```

Save unfinished work without committing:

```bash
git stash push -m "work in progress: short description"
```

Restore saved work:

```bash
git stash pop
```

### Recover A Deleted Or Broken File

Inspect history:

```bash
git log -- path/to/file
```

Restore from current branch HEAD:

```bash
git restore path/to/file
```

Restore from a specific commit:

```bash
git restore --source <commit> path/to/file
```

### Recover A Release Baseline

List tags:

```bash
git tag
```

Inspect Phase 1 baseline:

```bash
git show v0.1-phase1-baseline
```

Create a recovery branch from Phase 1:

```bash
git checkout -b recovery/phase1 v0.1-phase1-baseline
```

## Rollback Strategy

### Revert A Bad Commit Safely

Preferred rollback for shared branches:

```bash
git revert <commit>
```

Reason:

- Creates a new commit that reverses the change.
- Preserves history.
- Safer for `main` and `develop`.

### Reset Only For Local Unshared Work

Avoid destructive resets on shared branches. Only use reset for local, unshared work when Vi approves the recovery plan.

### Roll Back To Phase 1 Baseline

Create a branch from the baseline tag:

```bash
git checkout -b recovery/from-phase1 v0.1-phase1-baseline
```

Then compare against current work:

```bash
git diff recovery/from-phase1..develop
```

## Documentation Requirements

Every implementation task must append a report to `project-docs/PHASE_REPORTS.md`.

Architecture changes must update `project-docs/ARCHITECTURE.md`.

Electrical rule changes must update `project-docs/ELECTRICAL_RULES.md`.

Cost model changes must update `project-docs/COST_ENGINE_RULES.md`.

Known issues must be added to `project-docs/KNOWN_ISSUES.md`.

## Future Scaling Strategy

As the project grows, the workflow should evolve toward:

- Pull request reviews for all merges into `develop`.
- Release checklist for merges into `main`.
- CI running `npm test` and `npm run build`.
- Architecture Decision Records for major choices.
- Versioned simulator project schema.
- Automated report generation for releases.
- Protected `main` branch.
- Separate packages if simulator engines need reuse by Tauri, tests, or AI tutor services.


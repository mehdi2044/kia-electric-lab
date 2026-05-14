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

## Snapshot Review Policy

Visual snapshots are project evidence, not disposable test output.

Snapshots may be updated only when:

- the UI change is intentional
- the affected surface was manually inspected
- the phase report explains why the visual baseline changed
- Mehdi or Vi accepts the changed behavior or layout

Do not update snapshots only to make a failing test pass. First inspect the visual diff and decide whether the changed pixels represent an intended product change or a regression.

Normal visual verification:

```bash
npm run test:e2e
```

Intentional snapshot update:

```bash
npm run test:e2e:update
```

Headed debugging when visual behavior is unclear:

```bash
npm run test:e2e:headed
```

After updating snapshots:

1. Inspect changed images in the relevant `*-snapshots/` folder.
2. Inspect Playwright failure artifacts if the update came after a failed run.
3. Run `npm run test:e2e` again without update mode.
4. Mention the changed visual surfaces in `project-docs/PHASE_REPORTS.md`.

Avoid accidental snapshot churn:

- keep deterministic seeded fixtures
- avoid dynamic timestamps in screenshots
- do not rename Playwright projects unless snapshot file churn is intentional
- keep desktop and mobile snapshots in separate projects
- keep visual coverage targeted to high-risk UI surfaces

## CI Readiness Plan

Recommended CI command sequence:

```bash
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Recommended CI cache strategy:

- cache the npm package cache
- cache Playwright browser binaries when supported by the CI provider
- keep `node_modules` out of version control and prefer `npm ci` for clean installs

Recommended CI artifacts:

- `test-results/`
- `playwright-report/`

Playwright CI behavior:

- retry count is `2` only under `CI`
- trace is captured on first retry
- screenshots are captured only on failure
- video is retained only on failure
- tests run against the dedicated strict server on `127.0.0.1:5174`

Desktop and mobile projects are currently Chromium-only. Firefox, WebKit, and additional mobile viewports should be enabled after CI runtime stability and artifact review are proven.

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

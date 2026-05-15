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

Current Phase 18 release baseline tag:

```text
v0.18-phase18-github-baseline
```

## GitHub Remote Setup

No Git remote should be guessed. If this local repository has no `origin`, Mehdi should first create a GitHub repository named:

```text
kia-electric-lab
```

Then use the real repository URL provided by GitHub.

HTTPS pattern:

```bash
git remote add origin https://github.com/<owner>/kia-electric-lab.git
git push -u origin develop
git push origin main
git push origin --tags
```

SSH pattern:

```bash
git remote add origin git@github.com:<owner>/kia-electric-lab.git
git push -u origin develop
git push origin main
git push origin --tags
```

After remote setup:

1. Confirm CI starts on GitHub Actions.
2. Review uploaded artifacts if the first run fails.
3. Add the real CI badge to `README.md`.
4. Configure branch protection for `develop`.

## Feature Branch And Pull Request Flow

Create feature work from `develop`:

```bash
git checkout develop
git pull --ff-only origin develop
git checkout -b feature/short-feature-name
```

Before opening a pull request:

```bash
npm run verify:ci
```

Push the feature branch:

```bash
git push -u origin feature/short-feature-name
```

Open a pull request targeting:

```text
develop
```

Merge policy:

- CI must pass before merge.
- Phase documentation must be updated.
- Electrical logic changes must include unit tests.
- Browser-facing UX changes should include Playwright coverage when practical.
- Visual snapshot changes require Mehdi or Vi review.
- Merge to `develop` with a clear merge message.

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

The root GitHub Actions workflow lives at:

```text
.github/workflows/ci.yml
```

It runs on:

- pushes to `develop`
- pull requests targeting `develop`
- manual `workflow_dispatch`

CI command sequence:

```bash
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Current CI runner:

```text
windows-latest
```

Reason: the committed visual baselines are Chromium/Windows snapshots. Moving to Linux should be handled as an intentional visual baseline migration.

Local CI-style simulation:

```bash
npm run verify:ci
```

Use `npm ci` manually first when you need to reproduce a completely clean CI install. The local `verify:ci` script intentionally avoids reinstalling dependencies so everyday verification stays fast.

CI cache strategy:

- cache the npm package cache through `actions/setup-node`
- install Playwright Chromium in each run with `npx playwright install --with-deps chromium`
- defer Playwright browser binary caching until CI runtime behavior is proven stable
- keep `node_modules` out of version control and prefer `npm ci` for clean installs

CI artifacts:

- `test-results/`
- `playwright-report/`
- `dist/` on failure when available

Playwright CI behavior:

- retry count is `2` only under `CI`
- trace is captured on first retry
- screenshots are captured only on failure
- video is retained only on failure
- tests run against the dedicated strict server on `127.0.0.1:5174`

Snapshot enforcement:

- CI must run `npm run test:e2e`, not `npm run test:e2e:update`.
- CI must fail when committed screenshots do not match rendered output.
- Snapshot updates are local/manual only and require Mehdi or Vi review.
- The current desktop visual tolerance allows small rasterization drift but should still catch meaningful layout changes.

Branch strategy enforcement:

- `feature/*` branches hold isolated implementation work.
- `develop` is the active integration branch.
- Pull requests into `develop` should merge only after CI passes.
- `main` remains the stable release branch.
- If CI fails, inspect uploaded artifacts before retrying or updating snapshots.

Desktop and mobile projects are currently Chromium-only. Firefox, WebKit, and additional mobile viewports should be enabled after CI runtime stability and artifact review are proven.

## Phase 19 Branch Protection Policy

### Automation Status

Branch protection could not be configured automatically from the local environment.

Checked:

- GitHub CLI: not installed.
- `GITHUB_TOKEN`: not available.
- `GH_TOKEN`: not available.
- unauthenticated GitHub branch-protection API: returned `401 Unauthorized`.

Therefore Mehdi must configure protection manually in the GitHub UI, or provide an authenticated GitHub token with repository administration permission for a future automation step.

### Manual GitHub UI Steps For Mehdi

Open:

```text
https://github.com/mehdi2044/kia-electric-lab/settings/branches
```

Then:

1. Select **Add branch ruleset** or **Add rule**.
2. Target branch:

```text
develop
```

3. Enable **Require a pull request before merging**.
4. Enable **Require status checks to pass before merging**.
5. Enable **Require branches to be up to date before merging** if available.
6. Select required status check:

```text
Unit, build, and browser verification
```

or, if GitHub shows the workflow-level check:

```text
Kia Electric Lab CI
```

7. Enable **Block force pushes**.
8. Enable **Block deletions**.
9. Save the rule.

Recommended optional settings:

- require at least one approval before merging
- require conversation resolution before merging
- restrict direct pushes to maintainers only

### Feature Branch Policy

- New work starts from `develop`.
- Branch names should use:
  - `feature/*` for normal implementation
  - `fix/*` for narrow bug fixes
  - `docs/*` for documentation-only changes
  - `experimental/*` for risky prototypes
- Feature branches should be pushed to GitHub and merged through pull requests.
- Long-running feature branches should regularly rebase or merge from `develop` after CI passes.

### Pull Request Policy

Pull requests into `develop` must include:

- clear summary of completed work
- changed files or modules
- testing performed
- documentation updates
- risk notes
- screenshot/snapshot explanation if visual baselines changed

Before merge:

- GitHub Actions CI must pass.
- Required status check must be green.
- The branch should be up to date with `develop`.
- Snapshot changes must be explicitly reviewed by Mehdi or Vi.
- Electrical logic changes must include or update tests.
- Architecture changes must be documented in `project-docs/ARCHITECTURE.md`.

### Snapshot Update Approval Rule

Snapshots may be updated only when:

- the UI change is intentional
- the affected screenshot is manually inspected
- the phase report explains why the snapshot changed
- Mehdi or Vi approves the visual change

CI must never run:

```bash
npm run test:e2e:update
```

CI must only run:

```bash
npm run test:e2e
```

### Release Tagging Rule

Release tags are created from `main` after `develop` has passed CI and has been intentionally merged into `main`.

Tag format:

```text
v<major>.<minor>-<phase-or-release-name>
```

Current release baseline:

```text
v0.18-phase18-github-baseline
```

Release checklist:

1. `develop` CI is green.
2. `DEVELOPMENT_WORKFLOW.md`, `README.md`, and release notes are current.
3. Merge `develop` into `main`.
4. Create an annotated tag from `main`.
5. Push `main` and tags.
6. Confirm GitHub Actions and release artifacts if applicable.

### Main Vs Develop Strategy

- `develop` is active integration and must be protected.
- `main` is stable release history.
- Feature work does not target `main` directly.
- Emergency release fixes should branch from `main`, then be merged back into `develop`.
- Tags should point to stable `main` commits, not feature branches.

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

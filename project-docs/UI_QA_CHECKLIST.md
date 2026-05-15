# Kia Electric Lab - UI QA Checklist

## 2026-05-14 21:43 Europe/Istanbul - Phase 11 Manual Visual QA Baseline

This checklist exists because Phase 11 intentionally avoided adding Playwright as a new dependency before the project has a dedicated browser-test strategy. It provides a repeatable manual QA path for Mehdi, Vi, or the next engineer.

### Scope

- Persian RTL layout
- Lesson sandbox controls
- Apply preview modal
- Apply result summary
- Diagnostics panel navigation
- Example import/export integrity messages
- Keyboard accessibility for the apply modal

### Required Local Setup

1. Run `npm run dev`.
2. Open `http://localhost:5173/`.
3. Keep DevTools console visible during QA.
4. Use a clean or backed-up localStorage state when testing destructive flows.

### Smoke Checks

- App loads without console errors.
- Page direction is RTL.
- Header disclaimer is visible.
- Lesson panel lazy-loads and appears before the floor plan.
- Diagnostics panel lazy-loads in the right column.

### Lesson Panel Checks

- Start lesson 1.
- Verify sandbox status message appears.
- Verify wire drawing mode is active.
- Verify lesson step guidance is visible in Persian.
- Verify saved examples section is visible even when empty.

### Apply Preview Modal Checks

- Click `پیش‌نمایش اعمال`.
- Verify the modal shows:
  - selected apply mode explanation
  - circuit count
  - component count
  - wire count
  - risk list
  - diagnostics count
- Verify initial keyboard focus is on `انصراف`.
- Press `Tab`; focus should move to `تایید و اعمال`.
- Press `Shift+Tab`; focus should return to `انصراف`.
- Press `Escape`; modal should close.
- Reopen modal, click backdrop; modal should close without applying.
- Reopen modal, focus `تایید و اعمال`, press `Enter`; apply should execute.

### Apply Result Screen Checks

- After append/replace/save-example, verify a Persian result summary appears.
- Verify affected counts are shown.
- Verify diagnostics count is shown.
- Click `باز کردن پنل عیب‌یابی`.
- Verify page scrolls to diagnostics panel.

### Example Integrity Checks

- Save sandbox as example.
- Export example JSON.
- Import the same example.
- Verify success message mentions checksum validity.
- Edit exported JSON manually and import again.
- Verify corrupted/checksum warning appears in Persian.

### Append Layout Checks

- Place a lesson component near an existing component.
- Append lesson result.
- Verify appended components are offset from the original area.
- Verify wire route points move with the components.
- If a crowded layout is created, verify layout warning appears after apply.

### Pass Criteria

- No app crash.
- No silent overwrite of main project.
- Apply requires explicit confirmation.
- Cancel/backdrop/Escape do not mutate the main project.
- Diagnostics remain reachable after apply.
- Persian messages are understandable for a teenager.

### Known Manual QA Limitation

This checklist is not a replacement for automated browser tests. A future phase should add Playwright or an equivalent browser-level harness once the team agrees to add the dependency and maintain selectors for stable UI tests.

## 2026-05-14 22:00 Europe/Istanbul - Phase 12 Automated QA Update

Playwright is now installed and the first browser smoke tests are available.

### Automated Commands

Run unit tests:

```text
npm test
```

Run browser smoke tests:

```text
npm run test:e2e
```

Open Playwright UI mode:

```text
npm run test:e2e:ui
```

### Automated Coverage Added

- App loads.
- Lesson panel is visible.
- Project data panel is visible.
- Diagnostics panel is visible.
- Audit viewer is visible.
- Sandbox lesson can start.
- Apply modal opens.
- Apply modal cancel closes without applying.
- Example list is reachable after starting a lesson.

### Stable Selector Policy

The following `data-testid` values are now test contract:

- `lesson-panel`
- `start-lesson-button`
- `open-apply-modal-button`
- `apply-modal`
- `apply-modal-cancel`
- `apply-modal-confirm`
- `project-data-panel`
- `diagnostics-panel`
- `audit-viewer`
- `example-list`

Do not rename these without updating Playwright tests and documenting the reason.

### Manual QA Still Needed

Manual visual checks are still useful for:

- Persian text clarity
- spacing and responsive layout
- dark mode polish
- keyboard feel beyond smoke coverage
- educational tone of warnings

### Next QA Expansion

- Add keyboard tests for Escape, Tab, Shift+Tab, and Enter behavior.
- Add confirmed append test that verifies audit entry creation.
- Add import-corrupted-example test.
- Add screenshot comparison only after visual layout stabilizes.

## 2026-05-14 22:11 Europe/Istanbul - Phase 13 Automated QA Expansion

### Automated Coverage Added

Phase 13 expands Playwright coverage beyond smoke tests.

Covered:

- Escape closes apply modal.
- Tab cycles inside modal.
- Initial focus starts on cancel.
- Backdrop click cancels safely.
- Enter does not create append audit unless confirm is focused.
- Confirm append applies changes.
- Append creates an audit record.
- Apply result summary appears.
- Valid example envelope imports.
- Corrupted checksum example imports with warning metadata.
- Import action creates audit record.

### Current Command

```text
npm run test:e2e
```

Current expected result:

```text
6 passed
```

### Selector Additions

- `apply-result-summary`
- `example-import-input`
- `example-import-message`
- `data-warning` on example import message
- `data-action` on audit entries
- `lesson-confirmation-modal`
- `project-data-confirmation-modal`
- `delete-wire-modal`

### Manual QA Still Recommended

Manually verify:

- modal wording remains friendly and clear in Persian
- warning/danger colors are not visually overwhelming
- reset/restore/delete confirmations feel safe but not exhausting
- dark mode modal contrast
- mobile layout for modal content

### Next Automated QA Expansion

- Backup restore fixture and test.
- Explicit wire fixture and delete-wire confirmation test.
- Replace-mode confirmation and audit test.
- Example rename/notes modal tests after prompts are removed.

## 2026-05-15 00:57 Europe/Istanbul - Phase 14 Automated QA Expansion

### Automated Coverage Added

The Playwright suite now uses direct fixture seeding and covers:

- replace mode apply
- restore backup modal confirm
- delete wire modal confirm
- reset project modal cancel/confirm
- reset sandbox modal confirm
- exit sandbox modal confirm
- saved example delete modal
- saved example rename modal
- saved example notes modal
- corrupted project import warning
- corrupted storage recovery UI

### Fixture Utilities

Fixture helpers live in:

```text
tests/e2e/helpers/fixtures.ts
```

Available fixture setup:

- clean default project
- active sandbox
- saved example
- backup record
- explicit wire
- corrupted storage
- diagnostics issue project

### Playwright Server Policy

E2E tests now run against:

```text
http://127.0.0.1:5174
```

The server uses `--strictPort` and does not reuse an existing server. This prevents stale app chunks from the user-facing `5173` server from affecting test results.

### Current Expected Result

```text
npm run test:e2e
14 passed
```

### Manual QA Still Recommended

- Check edit modal copy in Persian.
- Check textarea height on mobile.
- Check backup restore wording.
- Check corrupted storage recovery copy.
- Check visual contrast of warning/danger modal variants.

## 2026-05-15 01:13 Europe/Istanbul - Phase 15 Visual Regression Baseline

### Automated Coverage Added

The browser test suite now includes download/export and screenshot coverage.

Download tests:

- Audit JSON export
- Saved example JSON envelope export

Visual baselines:

- Apply preview modal RTL layout
- Diagnostics panel
- Lesson panel
- Audit viewer
- Floor plan with routed wire

### Snapshot Command

Update snapshots only when an intentional UI change is made:

```text
npm run test:e2e -- --update-snapshots
```

Then verify normally:

```text
npm run test:e2e
```

### Screenshot Stability Rules

- Use fixed viewport.
- Use deterministic fixture data.
- Avoid dynamic timestamps in the captured region.
- Prefer seeded localStorage over long UI setup.
- Keep screenshot assertions on high-value UI surfaces only.
- Use small pixel tolerance for font anti-aliasing.

### Current Expected Result

```text
npm run test:e2e
21 passed
```

### Cross-Browser Plan

Before enabling Firefox/WebKit/mobile:

- configure CI browser caching
- decide per-browser snapshot storage policy
- define mobile viewport sizes
- run trial snapshots locally and inspect noise
- avoid making all browsers required until stability is proven

## 2026-05-15 01:37 Europe/Istanbul - Phase 16 Mobile Visual Baselines And Snapshot Governance

### Automated Coverage Added

The Playwright suite now includes a dedicated mobile visual project.

Mobile visual baselines:

- Lesson panel
- Apply preview modal
- Diagnostics panel
- Audit viewer
- Floor plan with routed wire

Mobile project:

```text
chromium-mobile
```

Viewport:

```text
390x844
```

Snapshot folder:

```text
tests/e2e/phase16-mobile-visual.mobile.spec.ts-snapshots/
```

### Current Expected Result

```text
npm run test:e2e
26 passed
```

### Snapshot Review Checklist

Before accepting updated screenshots:

- confirm the UI change was intentional
- compare the changed snapshot against the previous baseline
- check both desktop and mobile affected surfaces
- verify Persian RTL direction and alignment
- verify warning colors remain clear but not alarming
- verify text is not clipped on mobile
- verify routed wires remain visible on the floor plan
- run `npm run test:e2e` after any snapshot update

### Snapshot Commands

Normal verification:

```text
npm run test:e2e
```

Update approved snapshots:

```text
npm run test:e2e:update
```

Debug visually in a real browser:

```text
npm run test:e2e:headed
```

Run full local confidence suite:

```text
npm run test:all
```

### CI Readiness Checklist

Future CI should run:

- `npm ci`
- `npm test`
- `npm run build`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

CI should upload:

- `test-results/`
- `playwright-report/`

CI should cache:

- npm cache
- Playwright browser cache

### Manual QA Still Recommended

- Open the app on a real narrow browser viewport and check scroll ergonomics.
- Verify the apply modal cancel button receives initial focus.
- Verify mobile floor-plan scrolling still feels understandable for a teenager.
- Check dark mode mobile contrast for diagnostics and audit panels.
- Review whether mobile screenshots should become release-blocking after CI is selected.

## 2026-05-15 12:48 Europe/Istanbul - Phase 17 CI Artifact Review Checklist

### CI Visual Snapshot Rule

CI must never update snapshots.

Allowed in CI:

```text
npm run test:e2e
```

Not allowed in CI:

```text
npm run test:e2e:update
```

If CI fails because of a screenshot mismatch, treat it as a review event:

- inspect the Playwright report artifact
- inspect `test-results/`
- decide whether the difference is an intentional UI change
- update snapshots locally only after Mehdi or Vi approval
- rerun `npm run test:e2e` before committing updated snapshots

Current CI visual baseline platform:

```text
windows-latest with Chromium
```

Reason:

- existing desktop and mobile snapshots were created as Chromium/Windows baselines
- Linux visual baselines should be introduced only through a reviewed migration

### GitHub Actions Artifacts

The CI workflow uploads:

- `playwright-report/`
- `test-results/`
- `dist/` on failure when available

Review artifacts when:

- a Playwright test fails
- a visual snapshot differs
- a build passes locally but fails in CI
- mobile and desktop screenshots disagree with expected RTL layout

### Branch QA Rule

Before merging into `develop`:

- CI should pass.
- Snapshot diffs should be reviewed.
- Phase report should mention any changed visual surfaces.
- Known issues should be updated if CI exposes environment-specific behavior.

## 2026-05-15 19:04 Europe/Istanbul - Phase 20 Live Flow UI QA

### Automated Coverage Added

- Switch toggle changes lamp visual state.
- Breaker toggle disables powered lamp.
- Unsafe explicit wire shows warning state.
- Lesson sandbox flow still opens and cancels safely.
- Desktop and mobile floor-plan visual baselines updated for live state rendering.

### Manual QA Checklist

- Toggle a one-way switch and confirm the lamp changes between `خاموش` and `روشن`.
- Toggle a breaker and confirm downstream loads turn off.
- Toggle an appliance and confirm active/inactive state feels understandable.
- Inspect a short-circuit wire and confirm the warning is visible.
- Check that current pulse animation does not distract from terminal selection.
- Verify dark mode contrast for live badges.
- Verify mobile floor-plan baseline still shows routed wire clearly.

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

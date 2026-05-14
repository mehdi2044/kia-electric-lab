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

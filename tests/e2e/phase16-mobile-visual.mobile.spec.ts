import { expect, test } from '@playwright/test';
import { buildAuditEntryFixture, buildProjectFixture, seedExplicitWire, seedProject } from './helpers/fixtures';

async function screenshotViewportAt(page: import('@playwright/test').Page, testId: string, name: string) {
  const target = page.getByTestId(testId);
  await expect(target).toBeVisible();
  await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await expect(page).toHaveScreenshot(name, { maxDiffPixels: 120 });
}

test.beforeEach(async ({ page }) => {
  await seedProject(page);
});

test.describe('mobile visual regression baseline', () => {
  test('lesson panel mobile baseline', async ({ page }) => {
    await screenshotViewportAt(page, 'lesson-panel', 'mobile-lesson-panel-rtl.png');
  });

  test('apply preview modal mobile baseline', async ({ page }) => {
    await page.getByTestId('start-lesson-button').dispatchEvent('click');
    await page.getByTestId('open-apply-modal-button').dispatchEvent('click');
    await screenshotViewportAt(page, 'apply-modal', 'mobile-apply-preview-modal-rtl.png');
  });

  test('diagnostics panel mobile baseline', async ({ page }) => {
    const baseProject = buildProjectFixture();
    await seedProject(page, buildProjectFixture({
      circuits: [{ ...baseProject.circuits[0], componentIds: ['missing-component'] }]
    }));
    await screenshotViewportAt(page, 'diagnostics-panel', 'mobile-diagnostics-panel-rtl.png');
  });

  test('audit viewer mobile baseline', async ({ page }) => {
    await seedProject(page, buildProjectFixture({ applyAuditLog: [buildAuditEntryFixture()] }));
    await screenshotViewportAt(page, 'audit-viewer', 'mobile-audit-viewer-rtl.png');
  });

  test('floor plan routed wire mobile baseline', async ({ page }) => {
    await seedExplicitWire(page);
    await screenshotViewportAt(page, 'floor-plan', 'mobile-floor-plan-routed-wire.png');
  });
});

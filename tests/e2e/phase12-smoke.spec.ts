import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
});

test('app loads core panels', async ({ page }) => {
  await expect(page.getByTestId('lesson-panel')).toBeVisible();
  await expect(page.getByTestId('project-data-panel')).toBeVisible();
  await expect(page.getByTestId('diagnostics-panel')).toBeVisible();
  await expect(page.getByTestId('audit-viewer')).toBeVisible();
});

test('lesson sandbox apply modal can be opened and cancelled safely', async ({ page }) => {
  await page.getByTestId('start-lesson-button').click();
  await page.getByTestId('open-apply-modal-button').click();
  await expect(page.getByTestId('apply-modal')).toBeVisible();
  await page.getByTestId('apply-modal-cancel').click();
  await expect(page.getByTestId('apply-modal')).toBeHidden();
  await expect(page.getByTestId('audit-viewer')).toContainText('هنوز رویدادی');
});

test('diagnostics, project data, audit viewer, and example list are reachable after starting lesson', async ({ page }) => {
  await page.getByTestId('start-lesson-button').click();
  await expect(page.getByTestId('example-list')).toBeVisible();
  await expect(page.getByTestId('project-data-panel')).toBeVisible();
  await expect(page.getByTestId('diagnostics-panel')).toBeVisible();
  await expect(page.getByTestId('audit-viewer')).toBeVisible();
});

import { expect, test } from '@playwright/test';

function canonicalize(value: unknown): string {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).filter((key) => record[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(',')}}`;
}

function checksum(value: unknown): string {
  const canonical = canonicalize(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function lessonExampleEnvelope(tampered = false) {
  const example = {
    id: `e2e-example-${tampered ? 'bad' : 'valid'}`,
    lessonId: 'lesson-1-one-way-lamp',
    title: 'E2E example',
    createdAt: '2026-05-14T19:00:00.000Z',
    projectSnapshot: {
      schemaVersion: 7,
      appVersion: '0.1.0',
      createdAt: '2026-05-14T19:00:00.000Z',
      updatedAt: '2026-05-14T19:00:00.000Z',
      voltage: 220,
      mainBreakerAmp: 25,
      rooms: [],
      components: [],
      circuits: [],
      wires: []
    }
  };
  return JSON.stringify({
    format: 'kia-electric-lab-lesson-example',
    exportedAt: '2026-05-14T19:00:00.000Z',
    checksumAlgorithm: 'fnv1a32-canonical-json',
    checksum: tampered ? '00000000' : checksum(example),
    example
  });
}

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

test('apply modal keyboard and backdrop behavior is safe', async ({ page }) => {
  await page.getByTestId('start-lesson-button').click();
  await page.getByTestId('open-apply-modal-button').click();
  await expect(page.getByTestId('apply-modal-cancel')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByTestId('apply-modal-confirm')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('apply-modal-cancel')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('apply-modal')).toBeHidden();
  await expect(page.locator('[data-testid="audit-entry"][data-action="append"]')).toHaveCount(0);

  await page.getByTestId('open-apply-modal-button').click();
  await page.getByTestId('apply-modal').click({ position: { x: 5, y: 5 } });
  await expect(page.getByTestId('apply-modal')).toBeHidden();
  await expect(page.locator('[data-testid="audit-entry"][data-action="append"]')).toHaveCount(0);

  await page.getByTestId('open-apply-modal-button').click();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('apply-modal')).toBeHidden();
  await expect(page.locator('[data-testid="audit-entry"][data-action="append"]')).toHaveCount(0);
});

test('confirm append applies changes, creates audit, and shows result summary', async ({ page }) => {
  await page.getByTestId('start-lesson-button').click();
  await page.getByTestId('open-apply-modal-button').click();
  await page.getByTestId('apply-modal-confirm').focus();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('apply-result-summary')).toBeVisible();
  await expect(page.locator('[data-testid="audit-entry"][data-action="append"]')).toHaveCount(1);
});

test('valid and corrupted example imports create audit records with warning status', async ({ page }) => {
  await page.getByTestId('start-lesson-button').click();

  await page.getByTestId('example-import-input').setInputFiles({
    name: 'valid-example.json',
    mimeType: 'application/json',
    buffer: Buffer.from(lessonExampleEnvelope(false))
  });
  await expect(page.locator('[data-testid="audit-entry"][data-action="import-example"]')).toHaveCount(1);
  await expect(page.getByTestId('example-import-message')).toBeVisible();

  await page.getByTestId('example-import-input').setInputFiles({
    name: 'corrupted-example.json',
    mimeType: 'application/json',
    buffer: Buffer.from(lessonExampleEnvelope(true))
  });
  await expect(page.locator('[data-testid="audit-entry"][data-action="import-example"]')).toHaveCount(2);
  await expect(page.getByTestId('example-import-message')).toHaveAttribute('data-warning', 'true');
});

test('diagnostics, project data, audit viewer, and example list are reachable after starting lesson', async ({ page }) => {
  await page.getByTestId('start-lesson-button').click();
  await expect(page.getByTestId('example-list')).toBeVisible();
  await expect(page.getByTestId('project-data-panel')).toBeVisible();
  await expect(page.getByTestId('diagnostics-panel')).toBeVisible();
  await expect(page.getByTestId('audit-viewer')).toBeVisible();
});

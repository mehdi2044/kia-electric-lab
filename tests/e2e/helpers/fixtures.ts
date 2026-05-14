import type { Page } from '@playwright/test';

const PROJECT_STORAGE_KEY = 'kia-electric-lab-project';
const BACKUP_STORAGE_KEY = 'kia-electric-lab-project-backups';
const MIGRATION_ERROR_STORAGE_KEY = 'kia-electric-lab-project-migration-error';

const now = '2026-05-15T00:00:00.000Z';

export function defaultProject() {
  return {
    schemaVersion: 7,
    appVersion: '0.8-phase8-lesson-sandbox',
    createdAt: now,
    updatedAt: now,
    voltage: 220,
    mainBreakerAmp: 25,
    pixelsPerMeter: 24,
    rooms: [
      { id: 'panel', nameFa: 'تابلو برق', type: 'panel', x: 20, y: 20, width: 120, height: 90 },
      { id: 'living', nameFa: 'پذیرایی', type: 'living', x: 150, y: 20, width: 360, height: 210 },
      { id: 'kitchen', nameFa: 'آشپزخانه', type: 'kitchen', x: 520, y: 20, width: 250, height: 210 }
    ],
    components: [
      { id: 'main-panel', type: 'main-panel', labelFa: 'تابلو اصلی', roomId: 'panel', x: 58, y: 55 },
      { id: 'outlet-living', type: 'outlet', labelFa: 'پریز پذیرایی', roomId: 'living', x: 445, y: 180, applianceId: 'tv', costPointType: 'outlet' }
    ],
    circuits: [
      {
        id: 'c-living-outlet',
        nameFa: 'پریز پذیرایی',
        roomIds: ['living'],
        componentIds: ['outlet-living'],
        applianceIds: ['tv'],
        wireSizeMm2: 2.5,
        breakerAmp: 16,
        lengthMeters: 22,
        kind: 'outlet'
      }
    ],
    wires: [],
    panelboard: {
      mainBreakerAmp: 25,
      breakers: [{ id: 'slot-1', labelFa: 'فیوز ۱', amp: 16, circuitId: 'c-living-outlet' }]
    },
    lessonProgress: { completedLessonIds: [], attemptsByLesson: {}, lastActiveLessonId: 'lesson-1-one-way-lamp' },
    useExplicitWiresOnly: false
  };
}

export function projectWithExplicitWire() {
  const project = defaultProject();
  project.wires = [
    {
      id: 'wire-e2e',
      circuitId: 'c-living-outlet',
      from: { componentId: 'main-panel', terminalId: 'phase-bus' },
      to: { componentId: 'outlet-living', terminalId: 'phase' },
      lengthMeters: 2,
      wireSizeMm2: 2.5,
      kind: 'phase',
      routePoints: [{ x: 58, y: 55 }, { x: 445, y: 180 }]
    }
  ];
  return project;
}

export function projectWithDiagnosticsIssues() {
  const project = defaultProject();
  project.circuits[0].componentIds = ['missing-component'];
  project.panelboard!.breakers[0].circuitId = 'missing-circuit';
  return project;
}

export function lessonProject() {
  return {
    ...defaultProject(),
    components: [
      { id: 'main-panel', type: 'main-panel', labelFa: 'تابلو اصلی', roomId: 'panel', x: 58, y: 55 },
      { id: 'sandbox-outlet-1', type: 'outlet', labelFa: 'پریز تمرین', roomId: 'living', x: 420, y: 175, circuitId: 'sandbox-lesson-3-standard-outlet', costPointType: 'outlet' }
    ],
    circuits: [
      {
        id: 'sandbox-lesson-3-standard-outlet',
        nameFa: 'تمرین پریز استاندارد',
        roomIds: ['living'],
        componentIds: ['sandbox-outlet-1'],
        applianceIds: [],
        wireSizeMm2: 2.5,
        breakerAmp: 16,
        lengthMeters: 10,
        kind: 'outlet'
      }
    ],
    wires: [],
    useExplicitWiresOnly: true
  };
}

export function savedExample() {
  return {
    id: 'example-e2e',
    lessonId: 'lesson-1-one-way-lamp',
    title: 'نمونه تست',
    projectSnapshot: lessonProject(),
    createdAt: now,
    notes: 'یادداشت اولیه'
  };
}

export function activeSandboxState() {
  const mainProject = defaultProject();
  const sandboxProject = lessonProject();
  return {
    activeLessonId: 'lesson-3-standard-outlet',
    mainProject,
    sandboxProject,
    sandboxProgress: mainProject.lessonProgress,
    attemptsCount: 0,
    startedAt: now,
    savedExamples: [savedExample()]
  };
}

function persistedState(project = defaultProject(), extra: Record<string, unknown> = {}) {
  return {
    state: {
      project,
      selectedCircuitId: project.circuits[0]?.id ?? '',
      wireDraft: { wireSizeMm2: 2.5, lengthMeters: 8 },
      darkMode: false,
      ...extra
    },
    version: 7
  };
}

export async function seedProject(page: Page, project = defaultProject()) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROJECT_STORAGE_KEY, value: persistedState(project) });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export async function seedExplicitWire(page: Page) {
  const project = projectWithExplicitWire();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROJECT_STORAGE_KEY, value: persistedState(project, { selectedWireId: 'wire-e2e' }) });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export async function seedActiveSandbox(page: Page) {
  const sandbox = activeSandboxState();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROJECT_STORAGE_KEY, value: persistedState(sandbox.sandboxProject, { lessonSandbox: sandbox, selectedCircuitId: sandbox.sandboxProject.circuits[0].id }) });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export async function seedBackup(page: Page) {
  const project = defaultProject();
  const backup = {
    id: 'backup-e2e',
    createdAt: now,
    reasonFa: 'پشتیبان تست',
    raw: JSON.stringify({ state: { project: projectWithDiagnosticsIssues() }, version: 7 }),
    schemaVersion: 7
  };
  await seedProject(page, project);
  await page.evaluate(({ key, backupValue }) => {
    localStorage.setItem(key, JSON.stringify([backupValue]));
  }, { key: BACKUP_STORAGE_KEY, backupValue: backup });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export async function seedCorruptedStorage(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, migrationKey }) => {
    localStorage.clear();
    localStorage.setItem(key, '{bad json');
    localStorage.setItem(migrationKey, '{bad json');
  }, { key: PROJECT_STORAGE_KEY, migrationKey: MIGRATION_ERROR_STORAGE_KEY });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export function corruptedProjectJson() {
  return '{not valid project json';
}

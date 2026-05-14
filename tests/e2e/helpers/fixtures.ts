import type { Page } from '@playwright/test';
import type {
  Circuit,
  ElectricalComponent,
  ElectricalProject,
  ElectricalWire,
  ApplyAuditEntry,
  LessonExample,
  LessonSandboxState,
  Panelboard,
  Room
} from '../../../src/types/electrical';

const PROJECT_STORAGE_KEY = 'kia-electric-lab-project';
const BACKUP_STORAGE_KEY = 'kia-electric-lab-project-backups';
const MIGRATION_ERROR_STORAGE_KEY = 'kia-electric-lab-project-migration-error';

export const FIXTURE_NOW = '2026-05-15T00:00:00.000Z';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function merge<T extends Record<string, unknown>>(base: T, override?: Partial<T>): T {
  return { ...base, ...(override ?? {}) };
}

export function buildRoomFixture(overrides: Partial<Room> = {}): Room {
  return merge<Room>({
    id: 'living',
    nameFa: 'پذیرایی',
    type: 'living',
    x: 150,
    y: 20,
    width: 360,
    height: 210
  }, overrides);
}

export function buildComponentFixture(overrides: Partial<ElectricalComponent> = {}): ElectricalComponent {
  return merge<ElectricalComponent>({
    id: 'outlet-living',
    type: 'outlet',
    labelFa: 'پریز پذیرایی',
    roomId: 'living',
    x: 445,
    y: 180,
    applianceId: 'tv',
    costPointType: 'outlet'
  }, overrides);
}

export function buildCircuitFixture(overrides: Partial<Circuit> = {}): Circuit {
  return merge<Circuit>({
    id: 'c-living-outlet',
    nameFa: 'پریز پذیرایی',
    roomIds: ['living'],
    componentIds: ['outlet-living'],
    applianceIds: ['tv'],
    wireSizeMm2: 2.5,
    breakerAmp: 16,
    lengthMeters: 22,
    kind: 'outlet'
  }, overrides);
}

export function buildWireFixture(overrides: Partial<ElectricalWire> = {}): ElectricalWire {
  return merge<ElectricalWire>({
    id: 'wire-e2e',
    circuitId: 'c-living-outlet',
    from: { componentId: 'main-panel', terminalId: 'phase-bus' },
    to: { componentId: 'outlet-living', terminalId: 'phase' },
    lengthMeters: 2,
    wireSizeMm2: 2.5,
    kind: 'phase',
    routePoints: [{ x: 58, y: 55 }, { x: 445, y: 180 }]
  }, overrides);
}

export function buildPanelboardFixture(overrides: Partial<Panelboard> = {}): Panelboard {
  return merge<Panelboard>({
    mainBreakerAmp: 25,
    breakers: [{ id: 'slot-1', labelFa: 'فیوز ۱', amp: 16, circuitId: 'c-living-outlet' }]
  }, overrides);
}

export function buildProjectFixture(overrides: DeepPartial<ElectricalProject> = {}): ElectricalProject {
  const project: ElectricalProject = {
    schemaVersion: 7,
    appVersion: '0.8-phase8-lesson-sandbox',
    createdAt: FIXTURE_NOW,
    updatedAt: FIXTURE_NOW,
    voltage: 220,
    mainBreakerAmp: 25,
    pixelsPerMeter: 24,
    rooms: [
      buildRoomFixture({ id: 'panel', nameFa: 'تابلو برق', type: 'panel', x: 20, y: 20, width: 120, height: 90 }),
      buildRoomFixture(),
      buildRoomFixture({ id: 'kitchen', nameFa: 'آشپزخانه', type: 'kitchen', x: 520, y: 20, width: 250, height: 210 })
    ],
    components: [
      buildComponentFixture({ id: 'main-panel', type: 'main-panel', labelFa: 'تابلو اصلی', roomId: 'panel', x: 58, y: 55, applianceId: undefined, costPointType: undefined }),
      buildComponentFixture()
    ],
    circuits: [buildCircuitFixture()],
    wires: [],
    panelboard: buildPanelboardFixture(),
    lessonProgress: { completedLessonIds: [], attemptsByLesson: {}, lastActiveLessonId: 'lesson-1-one-way-lamp' },
    useExplicitWiresOnly: false
  };
  return {
    ...project,
    ...overrides,
    panelboard: overrides.panelboard ? { ...project.panelboard, ...overrides.panelboard } as Panelboard : project.panelboard,
    lessonProgress: overrides.lessonProgress ? { ...project.lessonProgress, ...overrides.lessonProgress } as ElectricalProject['lessonProgress'] : project.lessonProgress
  };
}

export function buildDiagnosticsFixture(): ElectricalProject {
  const project = buildProjectFixture();
  project.circuits = [buildCircuitFixture({ componentIds: ['missing-component'] })];
  project.panelboard = buildPanelboardFixture({ breakers: [{ id: 'slot-1', labelFa: 'فیوز ناسازگار', amp: 16, circuitId: 'missing-circuit' }] });
  return project;
}

export function buildProjectWithExplicitWireFixture(): ElectricalProject {
  return buildProjectFixture({ wires: [buildWireFixture()] });
}

export function buildLessonProjectFixture(): ElectricalProject {
  return buildProjectFixture({
    components: [
      buildComponentFixture({ id: 'main-panel', type: 'main-panel', labelFa: 'تابلو اصلی', roomId: 'panel', x: 58, y: 55, applianceId: undefined, costPointType: undefined }),
      buildComponentFixture({ id: 'sandbox-outlet-1', labelFa: 'پریز تمرین', x: 420, y: 175, circuitId: 'sandbox-lesson-3-standard-outlet', applianceId: undefined })
    ],
    circuits: [buildCircuitFixture({ id: 'sandbox-lesson-3-standard-outlet', nameFa: 'تمرین پریز استاندارد', componentIds: ['sandbox-outlet-1'], applianceIds: [], lengthMeters: 10 })],
    wires: [],
    useExplicitWiresOnly: true
  });
}

export function buildExampleFixture(overrides: Partial<LessonExample> = {}): LessonExample {
  return merge<LessonExample>({
    id: 'example-e2e',
    lessonId: 'lesson-1-one-way-lamp',
    title: 'نمونه تست',
    projectSnapshot: buildLessonProjectFixture(),
    createdAt: FIXTURE_NOW,
    notes: 'یادداشت اولیه'
  }, overrides);
}

export function buildSandboxFixture(overrides: Partial<LessonSandboxState> = {}): LessonSandboxState {
  const mainProject = buildProjectFixture();
  const sandboxProject = buildLessonProjectFixture();
  return merge<LessonSandboxState>({
    activeLessonId: 'lesson-3-standard-outlet',
    mainProject,
    sandboxProject,
    sandboxProgress: mainProject.lessonProgress!,
    attemptsCount: 0,
    startedAt: FIXTURE_NOW,
    savedExamples: [buildExampleFixture()]
  }, overrides);
}

export function buildBackupFixture(overrides: Partial<{ id: string; createdAt: string; reasonFa: string; raw: string; schemaVersion?: number }> = {}) {
  return merge({
    id: 'backup-e2e',
    createdAt: FIXTURE_NOW,
    reasonFa: 'پشتیبان تست',
    raw: JSON.stringify({ state: { project: buildDiagnosticsFixture() }, version: 7 }),
    schemaVersion: 7
  }, overrides);
}

export function buildAuditEntryFixture(overrides: Partial<ApplyAuditEntry> = {}): ApplyAuditEntry {
  return merge<ApplyAuditEntry>({
    id: 'audit-e2e',
    action: 'append',
    timestamp: FIXTURE_NOW,
    lessonId: 'lesson-3-standard-outlet',
    lessonTitle: 'تمرین پریز استاندارد',
    affectedCounts: { circuits: 1, components: 1, wires: 1 },
    diagnosticsCount: 0,
    userNotes: 'رویداد تست',
    warningsFa: []
  }, overrides);
}

function persistedState(project: ElectricalProject = buildProjectFixture(), extra: Record<string, unknown> = {}) {
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

export async function seedProject(page: Page, project = buildProjectFixture()) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROJECT_STORAGE_KEY, value: persistedState(project) });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export async function seedExplicitWire(page: Page) {
  const project = buildProjectWithExplicitWireFixture();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROJECT_STORAGE_KEY, value: persistedState(project, { selectedWireId: 'wire-e2e' }) });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export async function seedActiveSandbox(page: Page) {
  const sandbox = buildSandboxFixture();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROJECT_STORAGE_KEY, value: persistedState(sandbox.sandboxProject, { lessonSandbox: sandbox, selectedCircuitId: sandbox.sandboxProject.circuits[0].id }) });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

export async function seedBackup(page: Page) {
  await seedProject(page, buildProjectFixture());
  await page.evaluate(({ key, backupValue }) => {
    localStorage.setItem(key, JSON.stringify([backupValue]));
  }, { key: BACKUP_STORAGE_KEY, backupValue: buildBackupFixture() });
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

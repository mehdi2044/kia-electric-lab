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
    schemaVersion: 8,
    appVersion: '0.18-phase18-github-baseline',
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
    useExplicitWiresOnly: false,
    switchStates: {},
    breakerStates: {},
    loadStates: {}
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

export function buildLiveSwitchProjectFixture(overrides: DeepPartial<ElectricalProject> = {}): ElectricalProject {
  return buildProjectFixture({
    rooms: [
      buildRoomFixture({ id: 'panel', nameFa: 'تابلو برق', type: 'panel', x: 20, y: 20, width: 120, height: 90 }),
      buildRoomFixture({ id: 'living', nameFa: 'پذیرایی', type: 'living', x: 150, y: 20, width: 360, height: 210 })
    ],
    components: [
      buildComponentFixture({ id: 'main-panel', type: 'main-panel', labelFa: 'تابلو اصلی', roomId: 'panel', x: 58, y: 55, applianceId: undefined, costPointType: undefined }),
      buildComponentFixture({ id: 'switch-live', type: 'one-way-switch', labelFa: 'کلید تست', roomId: 'living', x: 245, y: 145, circuitId: 'c-live', applianceId: undefined, costPointType: 'switch' }),
      buildComponentFixture({ id: 'lamp-live', type: 'lamp', labelFa: 'لامپ تست', roomId: 'living', x: 380, y: 145, circuitId: 'c-live', applianceId: 'led-lamp', costPointType: 'lamp' })
    ],
    circuits: [buildCircuitFixture({ id: 'c-live', nameFa: 'مدار تست زنده', componentIds: ['switch-live', 'lamp-live'], applianceIds: ['led-lamp'], wireSizeMm2: 1.5, breakerAmp: 10, kind: 'lighting' })],
    wires: [
      buildWireFixture({ id: 'live-panel-breaker', circuitId: 'c-live', from: { componentId: 'main-panel', terminalId: 'phase-source' }, to: { componentId: 'breaker:c-live', terminalId: 'line-in' }, kind: 'phase', routePoints: [{ x: 82, y: 75 }, { x: 84, y: 145 }] }),
      buildWireFixture({ id: 'live-breaker-switch', circuitId: 'c-live', from: { componentId: 'breaker:c-live', terminalId: 'load-out' }, to: { componentId: 'switch-live', terminalId: 'line-in' }, kind: 'phase', routePoints: [{ x: 84, y: 145 }, { x: 245, y: 145 }] }),
      buildWireFixture({ id: 'live-switch-lamp', circuitId: 'c-live', from: { componentId: 'switch-live', terminalId: 'line-out' }, to: { componentId: 'lamp-live', terminalId: 'phase' }, kind: 'switched-phase', routePoints: [{ x: 245, y: 145 }, { x: 380, y: 145 }] }),
      buildWireFixture({ id: 'live-lamp-neutral', circuitId: 'c-live', from: { componentId: 'lamp-live', terminalId: 'neutral' }, to: { componentId: 'main-panel', terminalId: 'neutral-source' }, kind: 'neutral', routePoints: [{ x: 380, y: 165 }, { x: 82, y: 95 }] })
    ],
    panelboard: buildPanelboardFixture({ breakers: [{ id: 'slot-1', labelFa: 'فیوز تست', amp: 10, circuitId: 'c-live' }] }),
    useExplicitWiresOnly: true,
    switchStates: {},
    breakerStates: {},
    loadStates: {},
    ...overrides
  });
}

export function buildUnsafeWireProjectFixture(): ElectricalProject {
  return buildProjectFixture({
    wires: [
      buildWireFixture({
        id: 'unsafe-short-wire',
        circuitId: 'c-living-outlet',
        from: { componentId: 'main-panel', terminalId: 'phase-source' },
        to: { componentId: 'main-panel', terminalId: 'neutral-source' },
        kind: 'phase',
        routePoints: [{ x: 72, y: 62 }, { x: 112, y: 92 }]
      })
    ],
    useExplicitWiresOnly: true
  });
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
    raw: JSON.stringify({ state: { project: buildDiagnosticsFixture() }, version: 8 }),
    schemaVersion: 8
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
    version: 8
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

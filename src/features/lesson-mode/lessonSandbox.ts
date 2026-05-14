import { defaultProject, rooms } from '../../data/apartment';
import { CURRENT_APP_VERSION, CURRENT_SCHEMA_VERSION, createProjectTimestamp } from '../../migrations/projectMigration';
import type {
  Circuit,
  ElectricalComponent,
  ElectricalProject,
  ElectricalTerminalRef,
  ApplyAuditAction,
  ApplyAuditEntry,
  LessonHighlight,
  LessonExample,
  LessonSandboxApplyMode,
  LessonProgress,
  LessonSandboxState,
  LessonScore,
  Panelboard
} from '../../types/electrical';
import { diagnoseProject, type DiagnosticReport } from '../../diagnostics/diagnosticsEngine';
import { generateTopologyWarnings } from '../validation-engine/validationEngine';
import { createEmptyLessonProgress } from './lessonProgress';
import { getLessonById, getStepGuidance } from './lessonEngine';
import { isLessonExampleExportEnvelope, validateLessonExampleExportEnvelope } from '../../migrations/exportIntegrity';

interface LessonTemplate {
  lessonId: string;
  focusRoomId: string;
  circuit: Circuit;
  components: ElectricalComponent[];
  panelboard: Panelboard;
}

const panelComponent: ElectricalComponent = {
  id: 'main-panel',
  type: 'main-panel',
  labelFa: 'تابلو اصلی',
  roomId: 'panel',
  x: 58,
  y: 55
};

function baseCircuit(lessonId: string, patch: Partial<Circuit>): Circuit {
  return {
    id: `sandbox-${lessonId}`,
    nameFa: 'مدار تمرین',
    roomIds: ['living'],
    componentIds: [],
    applianceIds: [],
    wireSizeMm2: 2.5,
    breakerAmp: 16,
    lengthMeters: 10,
    kind: 'outlet',
    ...patch
  };
}

function component(id: string, type: ElectricalComponent['type'], labelFa: string, roomId: string, x: number, y: number, applianceId?: string): ElectricalComponent {
  return {
    id,
    type,
    labelFa,
    roomId,
    x,
    y,
    applianceId,
    circuitId: '',
    costPointType: type === 'lamp' ? 'lamp' : type.includes('switch') ? 'switch' : type === 'junction-box' ? 'junction' : 'outlet'
  };
}

function templatePanel(circuit: Circuit): Panelboard {
  return {
    mainBreakerAmp: 25,
    breakers: [{ id: 'sandbox-slot-1', labelFa: 'فیوز تمرین', amp: circuit.breakerAmp, circuitId: circuit.id }]
  };
}

function finalizeTemplate(template: LessonTemplate): LessonTemplate {
  const components = template.components.map((item) => ({ ...item, circuitId: template.circuit.id }));
  return {
    ...template,
    components: [panelComponent, ...components],
    circuit: {
      ...template.circuit,
      componentIds: components.map((item) => item.id),
      applianceIds: components.map((item) => item.applianceId).filter((id): id is string => Boolean(id))
    }
  };
}

export function getLessonTemplate(lessonId: string): LessonTemplate {
  const livingLamp = component('sandbox-lamp-1', 'lamp', 'چراغ تمرین', 'living', 310, 120, 'led-lamp');
  const secondLamp = component('sandbox-lamp-2', 'lamp', 'چراغ دوم', 'living', 385, 120, 'led-lamp');
  const oneWay = component('sandbox-switch-1', 'one-way-switch', 'کلید تک‌پل تمرین', 'living', 230, 170);
  const twoGang = component('sandbox-switch-2g', 'two-gang-switch', 'کلید دوپل تمرین', 'living', 230, 170);
  const outlet = component('sandbox-outlet-1', 'outlet', 'پریز تمرین', 'living', 420, 175);
  const fridge = component('sandbox-fridge', 'appliance', 'یخچال تمرین', 'kitchen', 620, 75, 'fridge');
  const oven = component('sandbox-oven', 'appliance', 'فر تمرین', 'kitchen', 700, 155, 'oven');
  const dishwasher = component('sandbox-dishwasher', 'appliance', 'ماشین ظرف‌شویی تمرین', 'kitchen', 590, 165, 'dishwasher');

  const map: Record<string, LessonTemplate> = {
    'lesson-1-one-way-lamp': {
      lessonId,
      focusRoomId: 'living',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین چراغ تک‌پل', roomIds: ['living'], wireSizeMm2: 1.5, breakerAmp: 10, kind: 'lighting' }),
      components: [livingLamp, oneWay],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 10 }))
    },
    'lesson-2-two-gang-two-lamps': {
      lessonId,
      focusRoomId: 'living',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین کلید دوپل', roomIds: ['living'], wireSizeMm2: 1.5, breakerAmp: 10, kind: 'lighting' }),
      components: [livingLamp, secondLamp, twoGang],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 10 }))
    },
    'lesson-3-standard-outlet': {
      lessonId,
      focusRoomId: 'living',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین پریز استاندارد', roomIds: ['living'], wireSizeMm2: 2.5, breakerAmp: 16, kind: 'outlet' }),
      components: [outlet],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 16 }))
    },
    'lesson-4-fridge-dedicated': {
      lessonId,
      focusRoomId: 'kitchen',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین مدار یخچال', roomIds: ['kitchen'], wireSizeMm2: 2.5, breakerAmp: 16, kind: 'outlet' }),
      components: [fridge],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 16 }))
    },
    'lesson-5-kitchen-heavy-loads': {
      lessonId,
      focusRoomId: 'kitchen',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین بار سنگین آشپزخانه', roomIds: ['kitchen'], wireSizeMm2: 4, breakerAmp: 20, kind: 'heavy' }),
      components: [fridge, oven, dishwasher],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 20 }))
    },
    'lesson-6-wire-size-comparison': {
      lessonId,
      focusRoomId: 'living',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین مقایسه سیم', roomIds: ['living'], wireSizeMm2: 1.5, breakerAmp: 10, kind: 'lighting' }),
      components: [livingLamp, outlet, oven],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 10 }))
    },
    'lesson-7-breaker-selection': {
      lessonId,
      focusRoomId: 'living',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین انتخاب فیوز', roomIds: ['living'], wireSizeMm2: 2.5, breakerAmp: 16, kind: 'outlet' }),
      components: [outlet],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 16 }))
    },
    'lesson-8-better-routing-cost': {
      lessonId,
      focusRoomId: 'living',
      circuit: baseCircuit(lessonId, { nameFa: 'تمرین مسیر اقتصادی', roomIds: ['living'], wireSizeMm2: 2.5, breakerAmp: 16, kind: 'outlet' }),
      components: [outlet, component('sandbox-junction', 'junction-box', 'جعبه تقسیم تمرین', 'living', 350, 155)],
      panelboard: templatePanel(baseCircuit(lessonId, { breakerAmp: 16 }))
    }
  };

  return finalizeTemplate(map[lessonId] ?? map['lesson-1-one-way-lamp']);
}

export function createLessonProjectFromTemplate(lessonId: string, progress?: LessonProgress): ElectricalProject {
  const template = getLessonTemplate(lessonId);
  const now = createProjectTimestamp();
  const lessonProgress = progress ? { ...progress, lastActiveLessonId: lessonId } : { ...createEmptyLessonProgress(), lastActiveLessonId: lessonId };
  return {
    ...defaultProject,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: CURRENT_APP_VERSION,
    createdAt: now,
    updatedAt: now,
    rooms,
    components: template.components,
    circuits: [template.circuit],
    wires: [],
    panelboard: template.panelboard,
    lessonProgress,
    useExplicitWiresOnly: true
  };
}

export function startLessonSandbox(mainProject: ElectricalProject, lessonId: string): LessonSandboxState {
  const sandboxProgress = mainProject.lessonProgress ?? createEmptyLessonProgress();
  return {
    activeLessonId: lessonId,
    mainProject,
    sandboxProject: createLessonProjectFromTemplate(lessonId, sandboxProgress),
    sandboxProgress,
    attemptsCount: 0,
    startedAt: createProjectTimestamp()
  };
}

export function resetLessonSandbox(sandbox: LessonSandboxState): LessonSandboxState {
  return {
    ...sandbox,
    sandboxProject: createLessonProjectFromTemplate(sandbox.activeLessonId, sandbox.sandboxProgress),
    attemptsCount: sandbox.attemptsCount + 1,
    startedAt: createProjectTimestamp()
  };
}

export function applySandboxResult(sandbox: LessonSandboxState): ElectricalProject {
  return {
    ...sandbox.sandboxProject,
    lessonProgress: sandbox.sandboxProgress,
    useExplicitWiresOnly: false,
    updatedAt: createProjectTimestamp()
  };
}

export interface SandboxApplySummary {
  circuits: number;
  components: number;
  wires: number;
}

export interface SandboxApplyPreview {
  mode: LessonSandboxApplyMode;
  summary: SandboxApplySummary;
  diagnostics: DiagnosticReport;
  whatWillHappenFa: string;
  risksFa: string[];
}

export interface LessonExampleImportResult {
  ok: boolean;
  example?: LessonExample;
  warningsFa: string[];
  errorFa?: string;
  checksumStatus: 'valid' | 'invalid' | 'not-provided';
  sourceCompatibility: 'current' | 'older' | 'newer' | 'unknown';
}

export interface SandboxApplyResult {
  project: ElectricalProject;
  diagnostics: DiagnosticReport;
  summary: SandboxApplySummary;
  warningsFa: string[];
  layoutWarningsFa?: string[];
}

export interface SandboxApplyAuditInput {
  action: ApplyAuditAction;
  lessonId?: string;
  lessonTitle?: string;
  affectedCounts: SandboxApplySummary;
  diagnosticsCount?: number;
  userNotes?: string;
  checksumStatus?: ApplyAuditEntry['checksumStatus'];
  sourceCompatibility?: ApplyAuditEntry['sourceCompatibility'];
  warningsFa?: string[];
}

export interface ApplyDiffSummary {
  circuitsAdded: number;
  circuitsRemoved: number;
  componentsAdded: number;
  componentsRemoved: number;
  wiresAdded: number;
  wiresRemoved: number;
  diagnosticsBefore: number;
  diagnosticsAfter: number;
}

function uniqueId(base: string, existing: Set<string>): string {
  if (!existing.has(base)) {
    existing.add(base);
    return base;
  }
  let index = 2;
  while (existing.has(`${base}-${index}`)) index += 1;
  const next = `${base}-${index}`;
  existing.add(next);
  return next;
}

function remapRef(ref: ElectricalTerminalRef, componentIdMap: Map<string, string>, circuitIdMap: Map<string, string>): ElectricalTerminalRef {
  if (ref.componentId.startsWith('breaker:')) {
    const oldCircuitId = ref.componentId.replace('breaker:', '');
    return { ...ref, componentId: `breaker:${circuitIdMap.get(oldCircuitId) ?? oldCircuitId}` };
  }
  return { ...ref, componentId: componentIdMap.get(ref.componentId) ?? ref.componentId };
}

function componentBounds(component: Pick<ElectricalComponent, 'x' | 'y'>) {
  return {
    left: component.x - 62,
    right: component.x + 62,
    top: component.y - 38,
    bottom: component.y + 38
  };
}

function boundsOverlap(a: ReturnType<typeof componentBounds>, b: ReturnType<typeof componentBounds>): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function componentOverlaps(a: Pick<ElectricalComponent, 'x' | 'y'>, b: Pick<ElectricalComponent, 'x' | 'y'>): boolean {
  return boundsOverlap(componentBounds(a), componentBounds(b));
}

export function planAppendLayout(mainProject: ElectricalProject, components: ElectricalComponent[]): { offset: { x: number; y: number }; warningsFa: string[] } {
  const occupied = mainProject.components.filter((component) => component.type !== 'main-panel');
  if (!components.length || !occupied.length) return { offset: { x: 24, y: 24 }, warningsFa: [] };

  const directions = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 }
  ];
  const candidates = [{ x: 24, y: 24 }];
  for (const step of [1, 2, 3, 4, 5, 6]) {
    for (const direction of directions) {
      candidates.push({ x: direction.x * step * 150, y: direction.y * step * 110 });
    }
  }

  const offset = candidates.find((candidate) =>
    components.every((component) => !occupied.some((existing) => componentOverlaps({ x: component.x + candidate.x, y: component.y + candidate.y }, existing)))
  );

  if (offset) return { offset, warningsFa: [] };
  return {
    offset: { x: 900, y: 660 },
    warningsFa: ['برای افزودن درس، جای خالی ایده‌آل پیدا نشد. قطعه‌ها با فاصله زیاد اضافه شدند؛ بهتر است جای آن‌ها را روی نقشه بررسی کنی.']
  };
}

function offsetRoutePoints(wires: ElectricalProject['wires'], offset: { x: number; y: number }) {
  return (wires ?? []).map((wire) => ({
    ...wire,
    routePoints: (wire.routePoints ?? []).map((point) => ({ x: point.x + offset.x, y: point.y + offset.y }))
  }));
}

export function summarizeSandboxApply(sandbox: LessonSandboxState): SandboxApplySummary {
  return {
    circuits: sandbox.sandboxProject.circuits.length,
    components: sandbox.sandboxProject.components.filter((component) => component.type !== 'main-panel').length,
    wires: (sandbox.sandboxProject.wires ?? []).length
  };
}

export function createSandboxApplyPreview(sandbox: LessonSandboxState, mode: LessonSandboxApplyMode): SandboxApplyPreview {
  const simulated =
    mode === 'append'
      ? appendSandboxToMainProject(sandbox)
      : mode === 'replace'
        ? replaceMainProjectWithSandbox(sandbox)
        : undefined;
  const summary = summarizeSandboxApply(sandbox);
  const diagnostics = simulated?.diagnostics ?? diagnoseProject(sandbox.sandboxProject);
  const whatWillHappenFa =
    mode === 'replace'
      ? 'کل پروژه اصلی با پروژه تمرینی جایگزین می‌شود.'
      : mode === 'append'
        ? 'مدار، قطعه‌ها و سیم‌های تمرین به پروژه اصلی اضافه می‌شوند و شناسه‌ها امن بازسازی می‌شوند.'
        : 'نمونه تمرین ذخیره می‌شود و پروژه اصلی هیچ تغییری نمی‌کند.';
  const risksFa =
    mode === 'replace'
      ? ['اگر تایید کنی، پروژه اصلی فعلی دیگر جای خود را به sandbox می‌دهد.']
      : mode === 'append'
        ? ['ممکن است قطعه‌های اضافه‌شده در نقشه نزدیک قطعه‌های موجود قرار بگیرند.', 'بعد از افزودن، هشدارهای عیب‌یابی را بررسی کن.']
        : ['اگر نمونه‌ها زیاد شوند، فضای ذخیره‌سازی مرورگر بیشتر مصرف می‌شود.'];
  return { mode, summary, diagnostics, whatWillHappenFa, risksFa };
}

export function createApplyAuditEntry(input: SandboxApplyAuditInput): ApplyAuditEntry {
  return {
    id: `audit-${crypto.randomUUID?.() ?? Date.now().toString(36)}`,
    action: input.action,
    timestamp: createProjectTimestamp(),
    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle,
    affectedCounts: input.affectedCounts,
    diagnosticsCount: input.diagnosticsCount ?? 0,
    userNotes: input.userNotes,
    checksumStatus: input.checksumStatus,
    sourceCompatibility: input.sourceCompatibility,
    warningsFa: input.warningsFa
  };
}

export function appendApplyAudit(project: ElectricalProject, entry: ApplyAuditEntry): ElectricalProject {
  return {
    ...project,
    applyAuditLog: [entry, ...(project.applyAuditLog ?? [])].slice(0, 50)
  };
}

function countAddedRemoved(beforeIds: string[], afterIds: string[]) {
  const before = new Set(beforeIds);
  const after = new Set(afterIds);
  return {
    added: afterIds.filter((id) => !before.has(id)).length,
    removed: beforeIds.filter((id) => !after.has(id)).length
  };
}

export function summarizeApplyDiff(beforeProject: ElectricalProject, afterProject: ElectricalProject): ApplyDiffSummary {
  const circuits = countAddedRemoved(beforeProject.circuits.map((circuit) => circuit.id), afterProject.circuits.map((circuit) => circuit.id));
  const components = countAddedRemoved(beforeProject.components.map((component) => component.id), afterProject.components.map((component) => component.id));
  const wires = countAddedRemoved((beforeProject.wires ?? []).map((wire) => wire.id), (afterProject.wires ?? []).map((wire) => wire.id));
  return {
    circuitsAdded: circuits.added,
    circuitsRemoved: circuits.removed,
    componentsAdded: components.added,
    componentsRemoved: components.removed,
    wiresAdded: wires.added,
    wiresRemoved: wires.removed,
    diagnosticsBefore: diagnoseProject(beforeProject).issueCount,
    diagnosticsAfter: diagnoseProject(afterProject).issueCount
  };
}

export function replaceMainProjectWithSandbox(sandbox: LessonSandboxState): SandboxApplyResult {
  const project: ElectricalProject = {
    ...sandbox.sandboxProject,
    lessonProgress: sandbox.sandboxProgress,
    useExplicitWiresOnly: false,
    updatedAt: createProjectTimestamp()
  };
  const diagnostics = diagnoseProject(project);
  return {
    project,
    diagnostics,
    summary: summarizeSandboxApply(sandbox),
    warningsFa: diagnostics.issueCount ? ['بعد از جایگزینی، چند مورد عیب‌یابی پیدا شد. قبل از ادامه آن‌ها را بررسی کن.'] : []
  };
}

export function appendSandboxToMainProject(sandbox: LessonSandboxState): SandboxApplyResult {
  const mainProject = sandbox.mainProject;
  const sandboxProject = sandbox.sandboxProject;
  const circuitIds = new Set(mainProject.circuits.map((circuit) => circuit.id));
  const componentIds = new Set(mainProject.components.map((component) => component.id));
  const wireIds = new Set((mainProject.wires ?? []).map((wire) => wire.id));
  const breakerIds = new Set((mainProject.panelboard?.breakers ?? []).map((breaker) => breaker.id));
  const circuitIdMap = new Map<string, string>();
  const componentIdMap = new Map<string, string>();

  const appendedCircuits = sandboxProject.circuits.map((circuit) => {
    const nextId = uniqueId(`lesson-${sandbox.activeLessonId}-${circuit.id}`, circuitIds);
    circuitIdMap.set(circuit.id, nextId);
    return {
      ...circuit,
      id: nextId,
      nameFa: `${circuit.nameFa} - نمونه درس`,
      componentIds: [],
      applianceIds: [...circuit.applianceIds],
      roomIds: circuit.roomIds.filter((roomId) => mainProject.rooms.some((room) => room.id === roomId))
    };
  });

  const sandboxComponents = sandboxProject.components.filter((component) => component.type !== 'main-panel');
  const layoutPlan = planAppendLayout(mainProject, sandboxComponents);
  const layoutOffset = layoutPlan.offset;
  const appendedComponents = sandboxComponents
    .map((component) => {
      const nextId = uniqueId(`lesson-${sandbox.activeLessonId}-${component.id}`, componentIds);
      componentIdMap.set(component.id, nextId);
      return {
        ...component,
        id: nextId,
        circuitId: component.circuitId ? circuitIdMap.get(component.circuitId) : undefined,
        roomId: mainProject.rooms.some((room) => room.id === component.roomId) ? component.roomId : 'living',
        x: component.x + layoutOffset.x,
        y: component.y + layoutOffset.y
      };
    });

  const componentsByCircuit = new Map<string, ElectricalComponent[]>();
  appendedComponents.forEach((component) => {
    if (!component.circuitId) return;
    componentsByCircuit.set(component.circuitId, [...(componentsByCircuit.get(component.circuitId) ?? []), component]);
  });

  const finalCircuits = appendedCircuits.map((circuit) => {
    const components = componentsByCircuit.get(circuit.id) ?? [];
    return {
      ...circuit,
      componentIds: components.map((component) => component.id),
      applianceIds: Array.from(new Set([...circuit.applianceIds, ...components.map((component) => component.applianceId).filter((id): id is string => Boolean(id))]))
    };
  });

  const offsetWires = offsetRoutePoints(sandboxProject.wires, layoutOffset);
  const appendedWires = (offsetWires ?? []).map((wire) => ({
    ...wire,
    id: uniqueId(`lesson-${sandbox.activeLessonId}-${wire.id}`, wireIds),
    circuitId: circuitIdMap.get(wire.circuitId) ?? wire.circuitId,
    from: remapRef(wire.from, componentIdMap, circuitIdMap),
    to: remapRef(wire.to, componentIdMap, circuitIdMap)
  }));

  const appendedBreakers = (sandboxProject.panelboard?.breakers ?? []).map((breaker) => ({
    ...breaker,
    id: uniqueId(`lesson-${sandbox.activeLessonId}-${breaker.id}`, breakerIds),
    labelFa: `${breaker.labelFa} - نمونه درس`,
    circuitId: breaker.circuitId ? circuitIdMap.get(breaker.circuitId) : undefined
  }));

  const project: ElectricalProject = {
    ...mainProject,
    circuits: [...mainProject.circuits, ...finalCircuits],
    components: [...mainProject.components, ...appendedComponents],
    wires: [...(mainProject.wires ?? []), ...appendedWires],
    panelboard: {
      mainBreakerAmp: mainProject.panelboard?.mainBreakerAmp ?? mainProject.mainBreakerAmp,
      breakers: [...(mainProject.panelboard?.breakers ?? []), ...appendedBreakers]
    },
    lessonProgress: sandbox.sandboxProgress,
    useExplicitWiresOnly: false,
    updatedAt: createProjectTimestamp()
  };
  const diagnostics = diagnoseProject(project);
  return {
    project,
    diagnostics,
    summary: {
      circuits: finalCircuits.length,
      components: appendedComponents.length,
      wires: appendedWires.length
    },
    warningsFa: diagnostics.issueCount ? ['بعد از افزودن نمونه درس، چند هشدار عیب‌یابی وجود دارد. آن‌ها را بررسی کن.'] : [],
    layoutWarningsFa: layoutPlan.warningsFa
  };
}

export function createLessonExample(sandbox: LessonSandboxState, title: string, notes?: string, score?: LessonScore): LessonExample {
  return {
    id: `example-${crypto.randomUUID?.() ?? Date.now().toString(36)}`,
    lessonId: sandbox.activeLessonId,
    title: title.trim() || getLessonById(sandbox.activeLessonId)?.titleFa || 'نمونه درس',
    projectSnapshot: {
      ...sandbox.sandboxProject,
      useExplicitWiresOnly: true,
      updatedAt: createProjectTimestamp()
    },
    score,
    createdAt: createProjectTimestamp(),
    notes
  };
}

export function addLessonExample(sandbox: LessonSandboxState, example: LessonExample): LessonSandboxState {
  return {
    ...sandbox,
    savedExamples: [example, ...(sandbox.savedExamples ?? [])]
  };
}

export function deleteLessonExample(sandbox: LessonSandboxState, exampleId: string): LessonSandboxState {
  return {
    ...sandbox,
    savedExamples: (sandbox.savedExamples ?? []).filter((example) => example.id !== exampleId)
  };
}

export function renameLessonExample(sandbox: LessonSandboxState, exampleId: string, title: string, notes?: string): LessonSandboxState {
  return {
    ...sandbox,
    savedExamples: (sandbox.savedExamples ?? []).map((example) =>
      example.id === exampleId
        ? {
            ...example,
            title: title.trim() || example.title,
            notes: notes ?? example.notes
          }
        : example
    )
  };
}

export function loadLessonExampleIntoSandbox(sandbox: LessonSandboxState, exampleId: string): LessonSandboxState {
  const example = (sandbox.savedExamples ?? []).find((item) => item.id === exampleId);
  if (!example) return sandbox;
  return {
    ...sandbox,
    activeLessonId: example.lessonId,
    sandboxProject: example.projectSnapshot,
    sandboxProgress: example.projectSnapshot.lessonProgress ?? sandbox.sandboxProgress,
    startedAt: createProjectTimestamp()
  };
}

function isLessonExample(value: unknown): value is LessonExample {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof (value as LessonExample).id === 'string' &&
      typeof (value as LessonExample).lessonId === 'string' &&
      typeof (value as LessonExample).title === 'string' &&
      typeof (value as LessonExample).createdAt === 'string' &&
      typeof (value as LessonExample).projectSnapshot === 'object'
  );
}

export function importLessonExampleJson(raw: string): LessonExampleImportResult {
  try {
    const parsed = JSON.parse(raw);
    const warningsFa: string[] = [];
    const example = isLessonExampleExportEnvelope(parsed) ? parsed.example : parsed;
    let checksumStatus: LessonExampleImportResult['checksumStatus'] = 'not-provided';
    if (isLessonExampleExportEnvelope(parsed)) {
      const validation = validateLessonExampleExportEnvelope(parsed);
      checksumStatus = validation.valid ? 'valid' : 'invalid';
      if (!validation.valid) warningsFa.push('checksum نمونه با محتوای فایل هماهنگ نیست. ممکن است فایل تغییر کرده یا ناقص باشد.');
    } else {
      warningsFa.push('این فایل envelope رسمی نمونه درس ندارد؛ با احتیاط وارد شد.');
    }
    if (!isLessonExample(example)) {
      return { ok: false, warningsFa, errorFa: 'ساختار فایل نمونه درس معتبر نیست.', checksumStatus, sourceCompatibility: 'unknown' };
    }
    if (example.projectSnapshot.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return { ok: false, warningsFa, errorFa: 'نسخه این نمونه از نسخه فعلی برنامه جدیدتر است.', checksumStatus, sourceCompatibility: 'newer' };
    }
    const sourceCompatibility = example.projectSnapshot.schemaVersion === CURRENT_SCHEMA_VERSION ? 'current' : 'older';
    return { ok: true, example, warningsFa, checksumStatus, sourceCompatibility };
  } catch {
    return { ok: false, warningsFa: [], errorFa: 'فایل نمونه خراب است یا JSON معتبر نیست.', checksumStatus: 'not-provided', sourceCompatibility: 'unknown' };
  }
}

export function generateLessonHighlight(project: ElectricalProject, lessonId: string, stepIndex: number): LessonHighlight {
  const lesson = getLessonById(lessonId);
  const template = getLessonTemplate(lessonId);
  const guidance = getStepGuidance(lessonId, stepIndex);
  const invalidWireIds = generateTopologyWarnings(project)
    .map((warning) => warning.id.match(/^topology:(.+):short-circuit$/)?.[1] ?? warning.id.match(/^topology:(.+):wire-overload$/)?.[1])
    .filter((wireId): wireId is string => Boolean(wireId));
  const componentIds = guidance.targetComponentId
    ? [guidance.targetComponentId]
    : template.components.filter((component) => component.type !== 'main-panel').map((component) => component.id);
  const terminalRefs = guidance.targetTerminalRef ? [guidance.targetTerminalRef] : [];
  return {
    roomIds: [guidance.targetRoomId ?? template.focusRoomId],
    componentIds,
    terminalRefs,
    invalidWireIds,
    ghostWire: stepIndex >= 2 && template.components.length > 1
      ? {
          from: { componentId: `breaker:${template.circuit.id}`, terminalId: 'load-out' },
          to: { componentId: template.components.find((component) => component.type !== 'main-panel')?.id ?? template.circuit.id, terminalId: 'phase' },
          kind: guidance.expectedWireKind ?? 'phase',
          labelFa: 'پیشنهاد مسیر تمرینی'
        }
      : undefined,
    messageFa: lesson ? `${lesson.titleFa}: ${guidance.validationHintFa}` : guidance.validationHintFa
  };
}

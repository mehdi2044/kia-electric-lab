import { defaultProject, rooms } from '../../data/apartment';
import { CURRENT_APP_VERSION, CURRENT_SCHEMA_VERSION, createProjectTimestamp } from '../../migrations/projectMigration';
import type {
  Circuit,
  ElectricalComponent,
  ElectricalProject,
  LessonHighlight,
  LessonProgress,
  LessonSandboxState,
  Panelboard
} from '../../types/electrical';
import { generateTopologyWarnings } from '../validation-engine/validationEngine';
import { createEmptyLessonProgress } from './lessonProgress';
import { getLessonById, getStepGuidance } from './lessonEngine';

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

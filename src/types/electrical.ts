export type RoomType =
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'hallway'
  | 'balcony'
  | 'panel';

export type ComponentType =
  | 'main-panel'
  | 'breaker'
  | 'wire-path'
  | 'junction-box'
  | 'one-way-switch'
  | 'two-gang-switch'
  | 'outlet'
  | 'lamp'
  | 'appliance';

export type WarningSeverity = 'info' | 'warning' | 'danger';

export type ElectricalTerminalRole =
  | 'phase-source'
  | 'neutral-source'
  | 'earth-source'
  | 'breaker-line'
  | 'breaker-load'
  | 'switch-line'
  | 'switch-load'
  | 'phase'
  | 'neutral'
  | 'earth'
  | 'junction';

export type ElectricalWireKind = 'phase' | 'neutral' | 'earth' | 'switched-phase';

export interface Appliance {
  id: string;
  nameFa: string;
  watts: number;
  voltage: number;
  category: 'light' | 'small' | 'heavy' | 'stable';
  icon: string;
}

export interface Room {
  id: string;
  nameFa: string;
  type: RoomType;
  x: number;
  y: number;
  width: number;
  height: number;
  highRisk?: boolean;
}

export interface ElectricalComponent {
  id: string;
  type: ComponentType;
  labelFa: string;
  roomId: string;
  x: number;
  y: number;
  applianceId?: string;
  circuitId?: string;
  costPointType?: 'outlet' | 'switch' | 'lamp' | 'junction';
}

export interface Wire {
  sizeMm2: number;
  maxAmp: number;
  pricePerMeter: number;
  resistanceOhmPerMeter: number;
  suitableForFa: string;
}

export interface Breaker {
  amp: number;
  labelFa: string;
  price: number;
}

export interface Circuit {
  id: string;
  nameFa: string;
  roomIds: string[];
  componentIds: string[];
  applianceIds: string[];
  wireSizeMm2: number;
  breakerAmp: number;
  lengthMeters: number;
  kind: 'lighting' | 'outlet' | 'heavy' | 'mixed';
}

export interface ElectricalTerminalRef {
  componentId: string;
  terminalId: string;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface ElectricalWire {
  id: string;
  circuitId: string;
  from: ElectricalTerminalRef;
  to: ElectricalTerminalRef;
  lengthMeters: number;
  wireSizeMm2: number;
  kind?: ElectricalWireKind;
  routePoints?: Point2D[];
  manualLengthOverride?: number;
  labelFa?: string;
}

export interface PanelBreakerSlot {
  id: string;
  labelFa: string;
  amp: number;
  circuitId?: string;
}

export interface Panelboard {
  mainBreakerAmp: number;
  breakers: PanelBreakerSlot[];
}

export interface CostItem {
  labelFa: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'material' | 'labor';
}

export interface SafetyWarning {
  id: string;
  severity: WarningSeverity;
  titleFa: string;
  messageFa: string;
  circuitId?: string;
  roomId?: string;
}

export interface ProjectReport {
  totalWattage: number;
  totalAmpere: number;
  circuits: Circuit[];
  wireUsageBySize: Record<string, number>;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  costByCircuit: Record<string, number>;
  costByRoom: Record<string, number>;
  warnings: SafetyWarning[];
  economicSuggestions: string[];
  recommendedCorrections: string[];
  scores: {
    safety: number;
    technical: number;
    economic: number;
    learning: number;
  };
}

export interface LessonScore {
  technical: number;
  safety: number;
  cost: number;
  learning: number;
  final: number;
}

export interface LessonAttempt {
  lessonId: string;
  attemptsCount: number;
  hintsUsed: number;
  completed: boolean;
  score?: LessonScore;
  completedAt?: string;
  lastFeedbackFa?: string;
}

export interface LessonProgress {
  completedLessonIds: string[];
  attemptsByLesson: Record<string, LessonAttempt>;
  lastActiveLessonId?: string;
}

export type LessonStepActionType =
  | 'select-circuit'
  | 'place-component'
  | 'connect-terminal'
  | 'select-wire'
  | 'edit-wire'
  | 'assign-breaker'
  | 'validate';

export interface LessonStepGuidance {
  expectedActionType: LessonStepActionType;
  targetRoomId?: string;
  targetComponentId?: string;
  targetTerminalId?: string;
  targetTerminalRef?: ElectricalTerminalRef;
  expectedWireKind?: ElectricalWireKind;
  validationHintFa: string;
}

export interface LessonHighlight {
  roomIds: string[];
  componentIds: string[];
  terminalRefs: ElectricalTerminalRef[];
  invalidWireIds: string[];
  ghostWire?: {
    from: ElectricalTerminalRef;
    to: ElectricalTerminalRef;
    kind: ElectricalWireKind;
    labelFa: string;
  };
  messageFa: string;
}

export interface LessonSandboxState {
  activeLessonId: string;
  mainProject: ElectricalProject;
  sandboxProject: ElectricalProject;
  sandboxProgress: LessonProgress;
  attemptsCount: number;
  startedAt: string;
  savedExamples?: ElectricalProject[];
  pendingApplyConfirmation?: boolean;
}

export interface ElectricalProject {
  schemaVersion: number;
  appVersion: string;
  createdAt: string;
  updatedAt: string;
  voltage: number;
  mainBreakerAmp: number;
  pixelsPerMeter?: number;
  rooms: Room[];
  components: ElectricalComponent[];
  circuits: Circuit[];
  wires?: ElectricalWire[];
  panelboard?: Panelboard;
  lessonProgress?: LessonProgress;
  useExplicitWiresOnly?: boolean;
}

import type { ElectricalProject, ElectricalWire, PanelBreakerSlot, Point2D } from '../types/electrical';

export const CURRENT_SCHEMA_VERSION = 5;
export const CURRENT_APP_VERSION = '0.5-phase5-migrations';
export const PROJECT_STORAGE_KEY = 'kia-electric-lab-project';
export const BACKUP_STORAGE_KEY = 'kia-electric-lab-project-backups';
export const MIGRATION_ERROR_STORAGE_KEY = 'kia-electric-lab-project-migration-error';

type UnknownRecord = Record<string, unknown>;

export interface ProjectBackup {
  id: string;
  createdAt: string;
  reasonFa: string;
  raw: string;
  schemaVersion?: number;
}

export interface MigrationResult {
  project: ElectricalProject;
  fromVersion: number;
  toVersion: number;
  changed: boolean;
  warningsFa: string[];
}

export interface ValidationResult {
  valid: boolean;
  errorsFa: string[];
  warningsFa: string[];
}

export function createProjectTimestamp(): string {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value ? value : fallback;
}

export function detectProjectVersion(project: unknown): number {
  if (!isRecord(project)) return 0;
  if (typeof project.schemaVersion === 'number') return project.schemaVersion;
  if ('panelboard' in project || 'pixelsPerMeter' in project) return 4;
  const wires = asArray(project.wires);
  if (wires.some((wire) => isRecord(wire) && 'kind' in wire)) return 3;
  if ('wires' in project) return 2;
  return 1;
}

function migrateToV2(project: UnknownRecord): UnknownRecord {
  return {
    ...project,
    wires: asArray(project.wires)
  };
}

function migrateToV3(project: UnknownRecord): UnknownRecord {
  const wires = asArray<UnknownRecord>(project.wires).map((wire) => ({
    ...wire,
    kind: asString(wire.kind, 'phase')
  }));
  return { ...project, wires };
}

function migrateToV4(project: UnknownRecord): UnknownRecord {
  const circuits = asArray<UnknownRecord>(project.circuits);
  const wires = asArray<UnknownRecord>(project.wires).map((wire) => ({
    ...wire,
    routePoints: asArray(wire.routePoints).filter(isPoint),
    manualLengthOverride: typeof wire.manualLengthOverride === 'number' ? wire.manualLengthOverride : undefined
  }));
  return {
    ...project,
    pixelsPerMeter: asNumber(project.pixelsPerMeter, 24),
    wires,
    panelboard: isRecord(project.panelboard)
      ? project.panelboard
      : {
          mainBreakerAmp: asNumber(project.mainBreakerAmp, 25),
          breakers: circuits.map((circuit, index) => ({
            id: `slot-${index + 1}`,
            labelFa: `فیوز ${index + 1}`,
            amp: asNumber(circuit.breakerAmp, 16),
            circuitId: asString(circuit.id, '')
          }))
        }
  };
}

function migrateToV5(project: UnknownRecord): ElectricalProject {
  const now = createProjectTimestamp();
  const migrated = {
    ...project,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: CURRENT_APP_VERSION,
    createdAt: asString(project.createdAt, now),
    updatedAt: now,
    voltage: asNumber(project.voltage, 220),
    mainBreakerAmp: asNumber(project.mainBreakerAmp, 25),
    pixelsPerMeter: asNumber(project.pixelsPerMeter, 24),
    rooms: asArray(project.rooms),
    components: asArray(project.components),
    circuits: asArray(project.circuits),
    wires: normalizeWires(asArray(project.wires)),
    panelboard: normalizePanelboard(project)
  } as ElectricalProject;
  return migrated;
}

function isPoint(value: unknown): value is Point2D {
  return isRecord(value) && typeof value.x === 'number' && typeof value.y === 'number' && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function normalizeWires(wires: unknown[]): ElectricalWire[] {
  return wires.filter(isRecord).map((wire, index) => ({
    id: asString(wire.id, `wire-migrated-${index + 1}`),
    circuitId: asString(wire.circuitId, ''),
    from: isRecord(wire.from) ? { componentId: asString(wire.from.componentId, ''), terminalId: asString(wire.from.terminalId, '') } : { componentId: '', terminalId: '' },
    to: isRecord(wire.to) ? { componentId: asString(wire.to.componentId, ''), terminalId: asString(wire.to.terminalId, '') } : { componentId: '', terminalId: '' },
    lengthMeters: asNumber(wire.lengthMeters, 1),
    wireSizeMm2: asNumber(wire.wireSizeMm2, 2.5),
    kind: ['phase', 'neutral', 'earth', 'switched-phase'].includes(String(wire.kind)) ? wire.kind as ElectricalWire['kind'] : 'phase',
    routePoints: asArray(wire.routePoints).filter(isPoint),
    manualLengthOverride: typeof wire.manualLengthOverride === 'number' && wire.manualLengthOverride > 0 ? wire.manualLengthOverride : undefined,
    labelFa: typeof wire.labelFa === 'string' ? wire.labelFa : undefined
  }));
}

function normalizePanelboard(project: UnknownRecord) {
  const circuits = asArray<UnknownRecord>(project.circuits);
  const panelboard = isRecord(project.panelboard) ? project.panelboard : {};
  const breakers = asArray<UnknownRecord>(panelboard.breakers).length
    ? asArray<UnknownRecord>(panelboard.breakers)
    : circuits.map((circuit, index) => ({
        id: `slot-${index + 1}`,
        labelFa: `فیوز ${index + 1}`,
        amp: asNumber(circuit.breakerAmp, 16),
        circuitId: asString(circuit.id, '')
      }));
  return {
    mainBreakerAmp: asNumber(panelboard.mainBreakerAmp, asNumber(project.mainBreakerAmp, 25)),
    breakers: breakers.map((breaker, index): PanelBreakerSlot => ({
      id: asString(breaker.id, `slot-${index + 1}`),
      labelFa: asString(breaker.labelFa, `فیوز ${index + 1}`),
      amp: asNumber(breaker.amp, 16),
      circuitId: typeof breaker.circuitId === 'string' && breaker.circuitId ? breaker.circuitId : undefined
    }))
  };
}

export function migrateProject(project: unknown): MigrationResult {
  if (!isRecord(project)) {
    throw new Error('Project is not an object');
  }
  const fromVersion = detectProjectVersion(project);
  let working: UnknownRecord = { ...project };
  const warningsFa: string[] = [];

  if (fromVersion < 2) working = migrateToV2(working);
  if (fromVersion < 3) working = migrateToV3(working);
  if (fromVersion < 4) working = migrateToV4(working);
  if (fromVersion < 5) working = migrateToV5(working) as unknown as UnknownRecord;
  if (fromVersion >= 5) working = migrateToV5(working) as unknown as UnknownRecord;

  const migrated = working as unknown as ElectricalProject;
  const validation = validateMigratedProject(migrated);
  if (!validation.valid) {
    throw new Error(validation.errorsFa.join(' | '));
  }
  warningsFa.push(...validation.warningsFa);

  return {
    project: migrated,
    fromVersion,
    toVersion: CURRENT_SCHEMA_VERSION,
    changed: fromVersion !== CURRENT_SCHEMA_VERSION,
    warningsFa
  };
}

export function validateMigratedProject(project: ElectricalProject): ValidationResult {
  const errorsFa: string[] = [];
  const warningsFa: string[] = [];
  const componentIds = new Set(project.components.map((component) => component.id));
  const circuitIds = new Set(project.circuits.map((circuit) => circuit.id));

  if (project.schemaVersion !== CURRENT_SCHEMA_VERSION) errorsFa.push('نسخه ساختار پروژه با نسخه فعلی هماهنگ نیست.');
  if (!Array.isArray(project.rooms) || project.rooms.length === 0) errorsFa.push('لیست اتاق‌ها معتبر نیست.');
  if (!Array.isArray(project.components)) errorsFa.push('لیست قطعه‌ها معتبر نیست.');
  if (!Array.isArray(project.circuits)) errorsFa.push('لیست مدارها معتبر نیست.');
  if (!Number.isFinite(project.pixelsPerMeter) || (project.pixelsPerMeter ?? 0) < 6) errorsFa.push('مقیاس نقشه معتبر نیست.');

  project.circuits.forEach((circuit) => {
    if (!circuit.id) errorsFa.push('یک مدار بدون شناسه پیدا شد.');
    circuit.componentIds.forEach((componentId) => {
      if (!componentIds.has(componentId)) warningsFa.push(`مدار ${circuit.nameFa} به قطعه‌ای اشاره می‌کند که وجود ندارد.`);
    });
  });

  (project.wires ?? []).forEach((wire) => {
    if (!circuitIds.has(wire.circuitId)) warningsFa.push(`سیم ${wire.id} به مدار نامعتبر وصل شده است.`);
    if (!componentIds.has(wire.from.componentId) && !wire.from.componentId.startsWith('breaker:')) warningsFa.push(`ابتدای سیم ${wire.id} قطعه معتبر ندارد.`);
    if (!componentIds.has(wire.to.componentId) && !wire.to.componentId.startsWith('breaker:')) warningsFa.push(`انتهای سیم ${wire.id} قطعه معتبر ندارد.`);
    if (!Number.isFinite(wire.lengthMeters) || wire.lengthMeters <= 0) warningsFa.push(`طول سیم ${wire.id} معتبر نیست.`);
    if ((wire.routePoints ?? []).some((point) => !isPoint(point))) warningsFa.push(`نقاط مسیر سیم ${wire.id} معتبر نیست.`);
  });

  project.panelboard?.breakers.forEach((breaker) => {
    if (breaker.circuitId && !circuitIds.has(breaker.circuitId)) warningsFa.push(`فیوز ${breaker.labelFa} به مدار نامعتبر وصل شده است.`);
    if (!Number.isFinite(breaker.amp) || breaker.amp <= 0) errorsFa.push(`آمپر فیوز ${breaker.labelFa} معتبر نیست.`);
  });

  return { valid: errorsFa.length === 0, errorsFa, warningsFa };
}

export function parsePersistedProject(raw: string): unknown {
  const parsed = JSON.parse(raw);
  if (isRecord(parsed) && isRecord(parsed.state) && 'project' in parsed.state) return parsed.state.project;
  return parsed;
}

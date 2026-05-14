import { CURRENT_APP_VERSION, CURRENT_SCHEMA_VERSION, createProjectTimestamp } from '../migrations/projectMigration';
import type { Circuit, ElectricalComponent, ElectricalProject, ElectricalWire, PanelBreakerSlot, Point2D, Room } from '../types/electrical';
import { diagnoseProject, type DiagnosticIssue } from './diagnosticsEngine';

export interface RepairLogEntry {
  issueId: string;
  actionFa: string;
  safe: boolean;
}

export interface RepairResult {
  project: ElectricalProject;
  repairedIssueIds: string[];
  logs: RepairLogEntry[];
  skippedIssues: DiagnosticIssue[];
}

function isPoint(value: unknown): value is Point2D {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && Number.isFinite((value as Point2D).x) && Number.isFinite((value as Point2D).y));
}

function shouldRepair(issue: DiagnosticIssue, selectedIssueIds?: string[]) {
  if (!issue.safeAutoRepair) return false;
  return !selectedIssueIds || selectedIssueIds.includes(issue.id);
}

function dedupeById<T extends { id: string }>(items: T[], prefix: string): { items: T[]; changed: boolean; idMap: Map<string, string[]> } {
  const seen = new Map<string, number>();
  const idMap = new Map<string, string[]>();
  let changed = false;
  const nextItems = items.map((item) => {
    const count = seen.get(item.id) ?? 0;
    seen.set(item.id, count + 1);
    if (count === 0) return item;
    changed = true;
    const nextId = `${item.id || prefix}-dedup-${count + 1}`;
    const ids = idMap.get(item.id) ?? [item.id];
    ids.push(nextId);
    idMap.set(item.id, ids);
    return { ...item, id: nextId };
  });
  return { items: nextItems, changed, idMap };
}

function safeIssueSet(issues: DiagnosticIssue[], selectedIssueIds?: string[]) {
  return new Set(issues.filter((issue) => shouldRepair(issue, selectedIssueIds)).map((issue) => issue.id));
}

export function repairProject(project: ElectricalProject, selectedIssueIds?: string[]): RepairResult {
  const report = diagnoseProject(project);
  const repairableIssueIds = safeIssueSet(report.issues, selectedIssueIds);
  const logs: RepairLogEntry[] = [];
  let nextProject: ElectricalProject = {
    ...project,
    rooms: [...project.rooms],
    components: [...project.components],
    circuits: [...project.circuits],
    wires: [...(project.wires ?? [])],
    panelboard: project.panelboard ? { ...project.panelboard, breakers: [...project.panelboard.breakers] } : undefined
  };

  const log = (issueId: string, actionFa: string) => {
    logs.push({ issueId, actionFa, safe: true });
  };

  if (repairableIssueIds.has('schema:metadata-missing')) {
    const now = createProjectTimestamp();
    nextProject = {
      ...nextProject,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      appVersion: CURRENT_APP_VERSION,
      createdAt: nextProject.createdAt || now,
      updatedAt: nextProject.updatedAt || now
    };
    log('schema:metadata-missing', 'اطلاعات نسخه و زمان پروژه تکمیل شد.');
  }

  if (repairableIssueIds.has('schema:invalid-pixels-per-meter')) {
    nextProject = { ...nextProject, pixelsPerMeter: 24 };
    log('schema:invalid-pixels-per-meter', 'مقیاس نقشه به مقدار آموزشی ۲۴ پیکسل بر متر برگردانده شد.');
  }

  const dedupRooms = dedupeById<Room>(nextProject.rooms, 'room');
  const dedupComponents = dedupeById<ElectricalComponent>(nextProject.components, 'component');
  const dedupCircuits = dedupeById<Circuit>(nextProject.circuits, 'circuit');
  const dedupWires = dedupeById<ElectricalWire>(nextProject.wires ?? [], 'wire');
  const dedupBreakers = dedupeById<PanelBreakerSlot>(nextProject.panelboard?.breakers ?? [], 'slot');

  if (dedupRooms.changed) {
    nextProject.rooms = dedupRooms.items;
    log('schema:duplicated-room-ids', 'شناسه‌های تکراری اتاق‌ها با پسوند امن بازسازی شدند.');
  }
  if (dedupComponents.changed) {
    nextProject.components = dedupComponents.items;
    log('component:duplicated-ids', 'شناسه‌های تکراری قطعه‌ها با پسوند امن بازسازی شدند.');
  }
  if (dedupCircuits.changed) {
    nextProject.circuits = dedupCircuits.items;
    log('circuit:duplicated-ids', 'شناسه‌های تکراری مدارها با پسوند امن بازسازی شدند.');
  }
  if (dedupWires.changed) {
    nextProject.wires = dedupWires.items;
    log('wire:duplicated-ids', 'شناسه‌های تکراری سیم‌ها با پسوند امن بازسازی شدند.');
  }
  if (dedupBreakers.changed && nextProject.panelboard) {
    nextProject.panelboard.breakers = dedupBreakers.items;
    log('panelboard:duplicated-ids', 'شناسه‌های تکراری فیوزهای تابلو با پسوند امن بازسازی شدند.');
  }

  const componentIds = new Set(nextProject.components.map((component) => component.id));
  const circuitIds = new Set(nextProject.circuits.map((circuit) => circuit.id));
  const orphanWireIds = new Set(
    report.issues
      .filter((issue) => repairableIssueIds.has(issue.id) && (issue.category === 'terminal' || issue.id.includes(':orphan')) && issue.entityId)
      .map((issue) => issue.entityId as string)
  );

  if (orphanWireIds.size > 0) {
    nextProject.wires = (nextProject.wires ?? []).filter((wire) => !orphanWireIds.has(wire.id));
    orphanWireIds.forEach((wireId) => log(`wire:${wireId}:removed`, `سیم نامعتبر ${wireId} از پروژه حذف شد.`));
  }

  const geometryIssueWireIds = new Set(
    report.issues
      .filter((issue) => repairableIssueIds.has(issue.id) && issue.id.includes(':invalid-geometry') && issue.entityId)
      .map((issue) => issue.entityId as string)
  );
  if (geometryIssueWireIds.size > 0) {
    nextProject.wires = (nextProject.wires ?? []).map((wire) =>
      geometryIssueWireIds.has(wire.id)
        ? {
            ...wire,
            lengthMeters: Number.isFinite(wire.lengthMeters) && wire.lengthMeters > 0 ? wire.lengthMeters : 1,
            routePoints: (wire.routePoints ?? []).filter(isPoint)
          }
        : wire
    );
    geometryIssueWireIds.forEach((wireId) => log(`wire:${wireId}:geometry`, `هندسه سیم ${wireId} به حالت معتبر آموزشی اصلاح شد.`));
  }

  nextProject.circuits = nextProject.circuits.map((circuit) => ({
    ...circuit,
    componentIds: circuit.componentIds.filter((componentId) => componentIds.has(componentId)),
    applianceIds: circuit.applianceIds,
    roomIds: circuit.roomIds.filter((roomId) => nextProject.rooms.some((room) => room.id === roomId))
  }));
  report.issues
    .filter((issue) => repairableIssueIds.has(issue.id) && issue.id.includes(':missing-component:'))
    .forEach((issue) => log(issue.id, 'ارجاع قطعه ناموجود از مدار حذف شد.'));

  if (nextProject.panelboard) {
    nextProject.panelboard = {
      ...nextProject.panelboard,
      breakers: nextProject.panelboard.breakers.map((breaker) =>
        breaker.circuitId && !circuitIds.has(breaker.circuitId) ? { ...breaker, circuitId: undefined } : breaker
      )
    };
    report.issues
      .filter((issue) => repairableIssueIds.has(issue.id) && issue.category === 'panelboard' && issue.id.includes('missing-circuit'))
      .forEach((issue) => log(issue.id, 'اتصال فیوز به مدار ناموجود پاک شد.'));
  }

  nextProject = {
    ...nextProject,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: CURRENT_APP_VERSION,
    updatedAt: createProjectTimestamp()
  };

  const repairedIssueIds = [...new Set(logs.map((entry) => entry.issueId))];
  return {
    project: nextProject,
    repairedIssueIds,
    logs,
    skippedIssues: report.issues.filter((issue) => !shouldRepair(issue, selectedIssueIds))
  };
}

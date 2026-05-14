import { breakers, unitCosts, wires } from '../data/electricalTables';
import { CURRENT_SCHEMA_VERSION } from '../migrations/projectMigration';
import type { ElectricalProject, ElectricalTerminalRef, Point2D } from '../types/electrical';
import { createTerminalsForComponent } from '../features/topology-engine/terminalCatalog';

export type DiagnosticSeverity = 'info' | 'warning' | 'error' | 'critical';
export type DiagnosticCategory = 'schema' | 'component' | 'circuit' | 'wire' | 'terminal' | 'panelboard' | 'cost' | 'storage';

export interface DiagnosticIssue {
  id: string;
  severity: DiagnosticSeverity;
  category: DiagnosticCategory;
  titleFa: string;
  explanationFa: string;
  recommendedRepairFa: string;
  safeAutoRepair: boolean;
  entityId?: string;
}

export interface DiagnosticReport {
  generatedAt: string;
  issueCount: number;
  issues: DiagnosticIssue[];
  counts: Record<DiagnosticSeverity, number>;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isPoint(value: unknown): value is Point2D {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function addIssue(issues: DiagnosticIssue[], issue: DiagnosticIssue) {
  if (!issues.some((item) => item.id === issue.id)) issues.push(issue);
}

function isVirtualBreakerRef(ref: ElectricalTerminalRef): boolean {
  return ref.componentId.startsWith('breaker:') && ['line-in', 'load-out'].includes(ref.terminalId);
}

function hasValidTerminal(project: ElectricalProject, ref: ElectricalTerminalRef): boolean {
  if (isVirtualBreakerRef(ref)) {
    const circuitId = ref.componentId.replace('breaker:', '');
    return project.circuits.some((circuit) => circuit.id === circuitId);
  }
  const component = project.components.find((item) => item.id === ref.componentId);
  if (!component) return false;
  return createTerminalsForComponent(component).some((terminal) => terminal.id === ref.terminalId);
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicated = new Set<string>();
  values.forEach((value) => {
    if (!value) return;
    if (seen.has(value)) duplicated.add(value);
    seen.add(value);
  });
  return [...duplicated];
}

export function diagnoseProject(project: ElectricalProject): DiagnosticReport {
  const issues: DiagnosticIssue[] = [];
  const roomIds = new Set(project.rooms.map((room) => room.id));
  const componentIds = new Set(project.components.map((component) => component.id));
  const circuitIds = new Set(project.circuits.map((circuit) => circuit.id));
  const assignedCircuitIds = new Set((project.panelboard?.breakers ?? []).map((breaker) => breaker.circuitId).filter(Boolean));

  if (project.schemaVersion !== CURRENT_SCHEMA_VERSION || !project.appVersion || !project.createdAt || !project.updatedAt) {
    addIssue(issues, {
      id: 'schema:metadata-missing',
      severity: 'error',
      category: 'schema',
      titleFa: 'اطلاعات نسخه پروژه کامل نیست',
      explanationFa: 'برای مهاجرت امن در نسخه‌های آینده، پروژه باید schemaVersion، appVersion، createdAt و updatedAt داشته باشد.',
      recommendedRepairFa: 'اطلاعات نسخه با مقدار فعلی برنامه تکمیل شود.',
      safeAutoRepair: true
    });
  }

  if (!Number.isFinite(project.pixelsPerMeter) || (project.pixelsPerMeter ?? 0) < 6) {
    addIssue(issues, {
      id: 'schema:invalid-pixels-per-meter',
      severity: 'error',
      category: 'schema',
      titleFa: 'مقیاس نقشه معتبر نیست',
      explanationFa: 'طول سیم‌ها، هزینه و افت ولتاژ به مقیاس نقشه وابسته هستند.',
      recommendedRepairFa: 'مقیاس به مقدار آموزشی ۲۴ پیکسل بر متر برگردد.',
      safeAutoRepair: true
    });
  }

  const duplicateGroups: Array<[DiagnosticCategory, string, string[]]> = [
    ['component', 'component', findDuplicates(project.components.map((item) => item.id))],
    ['circuit', 'circuit', findDuplicates(project.circuits.map((item) => item.id))],
    ['wire', 'wire', findDuplicates((project.wires ?? []).map((item) => item.id))],
    ['panelboard', 'breaker', findDuplicates((project.panelboard?.breakers ?? []).map((item) => item.id))]
  ];
  duplicateGroups.forEach(([category, label, duplicates]) => {
    duplicates.forEach((duplicatedId) =>
      addIssue(issues, {
        id: `${category}:duplicated-id:${duplicatedId}`,
        severity: 'error',
        category,
        titleFa: 'شناسه تکراری پیدا شد',
        explanationFa: `شناسه ${duplicatedId} در بخش ${label} بیش از یک بار استفاده شده است و می‌تواند اتصال‌ها را مبهم کند.`,
        recommendedRepairFa: 'شناسه‌های تکراری با پسوند امن بازسازی شوند و ارجاع‌های داخلی تا جای ممکن حفظ شوند.',
        safeAutoRepair: true,
        entityId: duplicatedId
      })
    );
  });

  project.components.forEach((component) => {
    if (!roomIds.has(component.roomId)) {
      addIssue(issues, {
        id: `component:${component.id}:missing-room`,
        severity: 'warning',
        category: 'component',
        titleFa: 'قطعه در اتاق نامعتبر قرار دارد',
        explanationFa: 'هر قطعه باید به یک اتاق موجود در نقشه وصل باشد تا هزینه، گزارش و آموزش اتاقی درست کار کند.',
        recommendedRepairFa: 'اتاق قطعه به صورت دستی انتخاب شود.',
        safeAutoRepair: false,
        entityId: component.id
      });
    }
  });

  project.circuits.forEach((circuit) => {
    if (circuit.componentIds.length === 0) {
      addIssue(issues, {
        id: `circuit:${circuit.id}:empty`,
        severity: 'info',
        category: 'circuit',
        titleFa: 'مدار بدون قطعه است',
        explanationFa: 'این مدار فعلاً چیزی را تغذیه نمی‌کند و فقط در گزارش/تابلو دیده می‌شود.',
        recommendedRepairFa: 'یا قطعه‌ای به آن اضافه کن، یا اگر اضافه است بعداً آن را حذف کن.',
        safeAutoRepair: false,
        entityId: circuit.id
      });
    }
    circuit.componentIds.forEach((componentId) => {
      if (!componentIds.has(componentId)) {
        addIssue(issues, {
          id: `circuit:${circuit.id}:missing-component:${componentId}`,
          severity: 'warning',
          category: 'circuit',
          titleFa: 'مدار به قطعه حذف‌شده اشاره می‌کند',
          explanationFa: 'این ارجاع باعث می‌شود گزارش مدار دقیق نباشد.',
          recommendedRepairFa: 'ارجاع قطعه ناموجود از مدار حذف شود.',
          safeAutoRepair: true,
          entityId: circuit.id
        });
      }
    });
    if (!assignedCircuitIds.has(circuit.id)) {
      addIssue(issues, {
        id: `panelboard:circuit-without-breaker:${circuit.id}`,
        severity: 'warning',
        category: 'panelboard',
        titleFa: 'مدار به فیوز تابلو وصل نیست',
        explanationFa: 'هر مدار آموزشی بهتر است در تابلو یک فیوز مشخص داشته باشد تا حفاظت و سازمان‌دهی قابل فهم باشد.',
        recommendedRepairFa: 'یک فیوز مناسب در تابلو برای این مدار انتخاب شود.',
        safeAutoRepair: false,
        entityId: circuit.id
      });
    }
  });

  (project.wires ?? []).forEach((wire) => {
    const fromMissingComponent = !componentIds.has(wire.from.componentId) && !wire.from.componentId.startsWith('breaker:');
    const toMissingComponent = !componentIds.has(wire.to.componentId) && !wire.to.componentId.startsWith('breaker:');
    if (!circuitIds.has(wire.circuitId) || fromMissingComponent || toMissingComponent) {
      addIssue(issues, {
        id: `wire:${wire.id}:orphan`,
        severity: 'error',
        category: 'wire',
        titleFa: 'سیم یتیم یا جدا از پروژه پیدا شد',
        explanationFa: 'این سیم به مدار یا قطعه‌ای اشاره می‌کند که دیگر وجود ندارد و نمی‌تواند در توپولوژی واقعی استفاده شود.',
        recommendedRepairFa: 'حذف این سیم امن است، چون اتصال معتبر آموزشی ندارد.',
        safeAutoRepair: true,
        entityId: wire.id
      });
    }
    [wire.from, wire.to].forEach((ref, index) => {
      if (!hasValidTerminal(project, ref)) {
        addIssue(issues, {
          id: `terminal:${wire.id}:${index === 0 ? 'from' : 'to'}:missing-terminal`,
          severity: 'error',
          category: 'terminal',
          titleFa: 'سیم به ترمینال نامعتبر وصل است',
          explanationFa: 'ترمینال مقصد یا مبدا در قطعه مربوطه وجود ندارد؛ بنابراین مسیر الکتریکی قابل اعتماد نیست.',
          recommendedRepairFa: 'حذف این سیم امن است و کاربر می‌تواند دوباره آن را از ترمینال درست رسم کند.',
          safeAutoRepair: true,
          entityId: wire.id
        });
      }
    });
    if ((wire.routePoints ?? []).some((point) => !isPoint(point)) || !Number.isFinite(wire.lengthMeters) || wire.lengthMeters <= 0) {
      addIssue(issues, {
        id: `wire:${wire.id}:invalid-geometry`,
        severity: 'warning',
        category: 'wire',
        titleFa: 'هندسه مسیر سیم معتبر نیست',
        explanationFa: 'نقاط مسیر یا طول سیم باید عددی و مثبت باشند تا هزینه و افت ولتاژ درست محاسبه شود.',
        recommendedRepairFa: 'نقاط خراب حذف شوند و طول حداقلی آموزشی جایگزین شود.',
        safeAutoRepair: true,
        entityId: wire.id
      });
    }
  });

  project.panelboard?.breakers.forEach((breaker) => {
    if (breaker.circuitId && !circuitIds.has(breaker.circuitId)) {
      addIssue(issues, {
        id: `panelboard:${breaker.id}:missing-circuit`,
        severity: 'warning',
        category: 'panelboard',
        titleFa: 'فیوز به مدار ناموجود وصل است',
        explanationFa: 'این خانه تابلو به مداری اشاره می‌کند که در پروژه وجود ندارد.',
        recommendedRepairFa: 'اتصال این فیوز به مدار ناموجود پاک شود.',
        safeAutoRepair: true,
        entityId: breaker.id
      });
    }
  });

  const invalidWireCatalog = wires.some((wire) => !Number.isFinite(wire.pricePerMeter) || wire.pricePerMeter <= 0 || !Number.isFinite(wire.resistanceOhmPerMeter) || wire.resistanceOhmPerMeter <= 0);
  const invalidBreakerCatalog = breakers.some((breaker) => !Number.isFinite(breaker.price) || breaker.price <= 0 || !Number.isFinite(breaker.amp) || breaker.amp <= 0);
  const invalidUnitCosts = Object.values(unitCosts).some((value) => !Number.isFinite(value) || value < 0);
  if (invalidWireCatalog || invalidBreakerCatalog || invalidUnitCosts) {
    addIssue(issues, {
      id: 'cost:invalid-settings',
      severity: 'critical',
      category: 'cost',
      titleFa: 'تنظیمات هزینه معتبر نیست',
      explanationFa: 'قیمت‌ها و مقاومت سیم‌ها باید عددی و مثبت باشند؛ وگرنه گزارش اقتصادی گمراه‌کننده می‌شود.',
      recommendedRepairFa: 'جدول هزینه در کد یا تنظیمات آینده اصلاح شود.',
      safeAutoRepair: false
    });
  }

  const counts: Record<DiagnosticSeverity, number> = { info: 0, warning: 0, error: 0, critical: 0 };
  issues.forEach((issue) => {
    counts[issue.severity] += 1;
  });

  return {
    generatedAt: new Date().toISOString(),
    issueCount: issues.length,
    issues,
    counts
  };
}

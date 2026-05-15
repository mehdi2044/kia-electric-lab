import type { ElectricalProject, ElectricalTerminalRef, ElectricalWire, ElectricalWireKind } from '../../types/electrical';
import { createTerminalLookup } from './topologyEngine';
import type { ElectricalTerminal } from './types';
import { terminalKey } from './types';
import { createComponentNode, createVirtualBreakerNode } from './terminalCatalog';

export interface WireCreationInput {
  project: ElectricalProject;
  circuitId: string;
  from: ElectricalTerminalRef;
  to: ElectricalTerminalRef;
  wireSizeMm2: number;
  lengthMeters: number;
  kind?: ElectricalWireKind;
}

export interface WireConnectionValidation {
  valid: boolean;
  severity: 'info' | 'warning' | 'danger';
  titleFa: string;
  messageFa: string;
  suggestedKind?: ElectricalWireKind;
}

function terminalLookupForProject(project: ElectricalProject) {
  return createTerminalLookup({
    nodes: [
      ...project.components.map(createComponentNode),
      ...project.circuits.map((circuit) => createVirtualBreakerNode(circuit.id, circuit.breakerAmp, `فیوز ${circuit.nameFa}`))
    ]
  });
}

function kindForTerminal(terminal: ElectricalTerminal): ElectricalWireKind {
  if (terminal.energizedRole === 'neutral') return 'neutral';
  if (terminal.energizedRole === 'earth') return 'earth';
  if (terminal.role === 'switch-load') return 'switched-phase';
  return 'phase';
}

export function inferWireKind(project: ElectricalProject, from: ElectricalTerminalRef, to: ElectricalTerminalRef): ElectricalWireKind {
  const lookup = terminalLookupForProject(project);
  const fromTerminal = lookup.get(terminalKey(from))?.terminal;
  const toTerminal = lookup.get(terminalKey(to))?.terminal;
  if (!fromTerminal || !toTerminal) return 'phase';
  if (fromTerminal.energizedRole === 'earth' || toTerminal.energizedRole === 'earth') return 'earth';
  if (fromTerminal.energizedRole === 'neutral' || toTerminal.energizedRole === 'neutral') return 'neutral';
  if (fromTerminal.role === 'switch-load' || toTerminal.role === 'switch-load') return 'switched-phase';
  return kindForTerminal(fromTerminal);
}

export function validateTerminalConnection(
  project: ElectricalProject,
  from: ElectricalTerminalRef,
  to: ElectricalTerminalRef
): WireConnectionValidation {
  const lookup = terminalLookupForProject(project);
  const fromTerminal = lookup.get(terminalKey(from));
  const toTerminal = lookup.get(terminalKey(to));

  if (!fromTerminal || !toTerminal) {
    return {
      valid: false,
      severity: 'danger',
      titleFa: 'ترمینال پیدا نشد',
      messageFa: 'یکی از سرهای سیم به ترمینالی اشاره می‌کند که در نقشه وجود ندارد.'
    };
  }

  if (terminalKey(from) === terminalKey(to)) {
    return {
      valid: false,
      severity: 'danger',
      titleFa: 'دو سر سیم یکی است',
      messageFa: 'یک سیم باید دو ترمینال متفاوت را به هم وصل کند.'
    };
  }

  const roles = new Set([fromTerminal.terminal.energizedRole, toTerminal.terminal.energizedRole]);
  if (roles.has('phase') && roles.has('neutral')) {
    return {
      valid: false,
      severity: 'danger',
      titleFa: 'فاز به نول مستقیم وصل شده است',
      messageFa: 'این اتصال کوتاه است. فاز و نول نباید مستقیم با یک سیم به هم وصل شوند.'
    };
  }

  if (roles.has('phase') && roles.has('earth')) {
    return {
      valid: false,
      severity: 'danger',
      titleFa: 'فاز به ارت وصل شده است',
      messageFa: 'ارت مسیر مصرف عادی نیست. وصل کردن فاز به ارت در دنیای واقعی بسیار خطرناک است.'
    };
  }

  if (roles.has('neutral') && roles.has('earth')) {
    return {
      valid: false,
      severity: 'warning',
      titleFa: 'نول و ارت جدا بمانند',
      messageFa: 'در این شبیه‌ساز آموزشی، نول و ارت را به عنوان مسیرهای جدا نگه می‌داریم تا مفهوم ایمنی روشن بماند.'
    };
  }

  return {
    valid: true,
    severity: 'info',
    titleFa: 'اتصال قابل قبول است',
    messageFa: 'این اتصال از نظر نوع ترمینال برای مدل آموزشی قابل بررسی است.',
    suggestedKind: inferWireKind(project, from, to)
  };
}

export function createElectricalWire(input: WireCreationInput): { wire?: ElectricalWire; validation: WireConnectionValidation } {
  const validation = validateTerminalConnection(input.project, input.from, input.to);
  if (!validation.valid) return { validation };

  return {
    validation,
    wire: {
      id: `wire-${crypto.randomUUID?.() ?? Date.now().toString(36)}`,
      circuitId: input.circuitId,
      from: input.from,
      to: input.to,
      wireSizeMm2: input.wireSizeMm2,
      lengthMeters: input.lengthMeters,
      routePoints: [],
      kind: input.kind ?? validation.suggestedKind ?? 'phase'
    }
  };
}

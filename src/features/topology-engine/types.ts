import type {
  Circuit,
  ComponentType,
  ElectricalComponent,
  ElectricalTerminalRef,
  ElectricalTerminalRole,
  ElectricalWire,
  Wire
} from '../../types/electrical';

export interface ElectricalTerminal {
  id: string;
  componentId: string;
  role: ElectricalTerminalRole;
  labelFa: string;
  energizedRole: 'phase' | 'neutral' | 'earth' | 'control' | 'junction';
}

export interface TopologyNode {
  id: string;
  componentType: ComponentType | 'virtual-breaker';
  labelFa: string;
  roomId?: string;
  circuitId?: string;
  applianceId?: string;
  terminals: ElectricalTerminal[];
  source?: boolean;
  breakerAmp?: number;
}

export interface TopologyWire extends ElectricalWire {
  source: 'explicit' | 'generated';
  resistanceOhmPerMeter: number;
  maxAmp: number;
}

export interface ElectricalTopologyGraph {
  nodes: TopologyNode[];
  wires: TopologyWire[];
  circuits: Circuit[];
  adjacency: Map<string, TopologyWire[]>;
}

export interface TerminalLookup {
  node: TopologyNode;
  terminal: ElectricalTerminal;
}

export interface TopologyBuildIssue {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  titleFa: string;
  messageFa: string;
  circuitId?: string;
}

export function terminalKey(ref: ElectricalTerminalRef): string {
  return `${ref.componentId}:${ref.terminalId}`;
}

export function getOtherTerminal(wire: TopologyWire, key: string): ElectricalTerminalRef | undefined {
  if (terminalKey(wire.from) === key) return wire.to;
  if (terminalKey(wire.to) === key) return wire.from;
  return undefined;
}

export function getLoadTerminal(component: ElectricalComponent, role: 'phase' | 'neutral'): string {
  if (component.type === 'one-way-switch') return role === 'phase' ? 'line-in' : 'line-out';
  if (component.type === 'two-gang-switch') return role === 'phase' ? 'line-in' : 'line-out-1';
  return role;
}

export function wireWithCatalogData(wire: ElectricalWire, catalogWire: Wire, source: TopologyWire['source']): TopologyWire {
  return {
    ...wire,
    source,
    resistanceOhmPerMeter: catalogWire.resistanceOhmPerMeter,
    maxAmp: catalogWire.maxAmp
  };
}

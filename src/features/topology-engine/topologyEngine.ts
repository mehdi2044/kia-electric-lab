import { wires as wireCatalog } from '../../data/electricalTables';
import type { Circuit, ElectricalComponent, ElectricalProject, ElectricalTerminalRef, ElectricalWire } from '../../types/electrical';
import { getWire } from '../safety-engine/electricalMath';
import { createComponentNode, createMainPanelNode, createVirtualBreakerNode } from './terminalCatalog';
import type { ElectricalTopologyGraph, TerminalLookup, TopologyBuildIssue, TopologyWire } from './types';
import { getLoadTerminal, terminalKey, wireWithCatalogData } from './types';

function findMainPanel(components: ElectricalComponent[]): ElectricalComponent | undefined {
  return components.find((component) => component.type === 'main-panel');
}

function addAdjacency(adjacency: Map<string, TopologyWire[]>, wire: TopologyWire) {
  const fromKey = terminalKey(wire.from);
  const toKey = terminalKey(wire.to);
  adjacency.set(fromKey, [...(adjacency.get(fromKey) ?? []), wire]);
  adjacency.set(toKey, [...(adjacency.get(toKey) ?? []), wire]);
}

export function createTerminalLookup(graph: Pick<ElectricalTopologyGraph, 'nodes'>): Map<string, TerminalLookup> {
  const lookup = new Map<string, TerminalLookup>();
  graph.nodes.forEach((node) => {
    node.terminals.forEach((terminal) => {
      lookup.set(terminalKey({ componentId: node.id, terminalId: terminal.id }), { node, terminal });
    });
  });
  return lookup;
}

function makeWire(
  id: string,
  circuit: Circuit,
  from: ElectricalTerminalRef,
  to: ElectricalTerminalRef,
  lengthMeters: number
): ElectricalWire {
  return {
    id,
    circuitId: circuit.id,
    from,
    to,
    lengthMeters,
    wireSizeMm2: circuit.wireSizeMm2
  };
}

function phaseTerminal(component: ElectricalComponent): string {
  return getLoadTerminal(component, 'phase');
}

function neutralTerminal(component: ElectricalComponent): string {
  return getLoadTerminal(component, 'neutral');
}

function generateCircuitWires(project: ElectricalProject, circuit: Circuit, panelId: string): ElectricalWire[] {
  const components = circuit.componentIds
    .map((componentId) => project.components.find((component) => component.id === componentId))
    .filter((component): component is ElectricalComponent => Boolean(component));
  const loadComponents = components.filter((component) => ['outlet', 'lamp', 'appliance'].includes(component.type));
  const switchComponents = components.filter((component) => ['one-way-switch', 'two-gang-switch'].includes(component.type));
  const segmentCount = Math.max(1, 1 + loadComponents.length * 2 + switchComponents.length);
  const segmentLength = Math.max(0.5, circuit.lengthMeters / segmentCount);
  const breakerId = `breaker:${circuit.id}`;
  const generated: ElectricalWire[] = [
    makeWire(`${circuit.id}:panel-to-breaker`, circuit, { componentId: panelId, terminalId: 'phase-source' }, { componentId: breakerId, terminalId: 'line-in' }, segmentLength)
  ];

  const firstSwitch = switchComponents[0];
  if (firstSwitch) {
    generated.push(
      makeWire(`${circuit.id}:breaker-to-switch`, circuit, { componentId: breakerId, terminalId: 'load-out' }, { componentId: firstSwitch.id, terminalId: 'line-in' }, segmentLength)
    );
  }

  loadComponents.forEach((component, index) => {
    const phaseFrom = firstSwitch && component.type === 'lamp'
      ? {
          componentId: firstSwitch.id,
          terminalId: firstSwitch.type === 'two-gang-switch' ? (index % 2 === 1 ? 'line-out-2' : 'line-out-1') : 'line-out'
        }
      : { componentId: breakerId, terminalId: 'load-out' };
    generated.push(
      makeWire(`${circuit.id}:phase:${component.id}`, circuit, phaseFrom, { componentId: component.id, terminalId: phaseTerminal(component) }, segmentLength),
      makeWire(`${circuit.id}:neutral:${component.id}`, circuit, { componentId: component.id, terminalId: neutralTerminal(component) }, { componentId: panelId, terminalId: 'neutral-source' }, segmentLength)
    );
  });

  return generated;
}

export function buildTopologyGraph(project: ElectricalProject): { graph: ElectricalTopologyGraph; issues: TopologyBuildIssue[] } {
  const issues: TopologyBuildIssue[] = [];
  const panel = findMainPanel(project.components);
  const panelId = panel?.id ?? 'main-panel';
  const componentNodes = project.components
    .filter((component) => component.id !== panelId)
    .map(createComponentNode);
  const panelNode = panel ? createComponentNode(panel) : createMainPanelNode(panelId);
  const breakerNodes = project.circuits.map((circuit) => createVirtualBreakerNode(circuit.id, circuit.breakerAmp, `فیوز ${circuit.nameFa}`));
  const graphBase = { nodes: [panelNode, ...breakerNodes, ...componentNodes] };
  const terminalLookup = createTerminalLookup(graphBase);

  if (!panel) {
    issues.push({
      id: 'missing-main-panel',
      severity: 'danger',
      titleFa: 'تابلو اصلی پیدا نشد',
      messageFa: 'برای ساخت مسیر واقعی برق، هر پروژه باید یک تابلو اصلی با ترمینال فاز و نول داشته باشد.'
    });
  }

  const sourceWires = project.wires?.length
    ? project.wires.map((wire) => ({ wire, source: 'explicit' as const }))
    : project.circuits.flatMap((circuit) => generateCircuitWires(project, circuit, panelId).map((wire) => ({ wire, source: 'generated' as const })));

  const topologyWires = sourceWires
    .map(({ wire, source }) => {
      const catalogWire = wireCatalog.find((item) => item.sizeMm2 === wire.wireSizeMm2) ?? getWire(wire.wireSizeMm2);
      return wireWithCatalogData(wire, catalogWire, source);
    })
    .filter((wire) => {
      const fromExists = terminalLookup.has(terminalKey(wire.from));
      const toExists = terminalLookup.has(terminalKey(wire.to));
      if (!fromExists || !toExists) {
        issues.push({
          id: `invalid-wire-terminal:${wire.id}`,
          severity: 'danger',
          titleFa: 'سیم به ترمینال نامعتبر وصل شده است',
          messageFa: 'یکی از سیم‌ها به ترمینالی وصل شده که در گراف الکتریکی وجود ندارد. این یعنی مسیر آموزشی مدار کامل و قابل اعتماد نیست.',
          circuitId: wire.circuitId
        });
      }
      return fromExists && toExists;
    });

  const adjacency = new Map<string, TopologyWire[]>();
  topologyWires.forEach((wire) => addAdjacency(adjacency, wire));

  return {
    graph: {
      nodes: graphBase.nodes,
      wires: topologyWires,
      circuits: project.circuits,
      adjacency
    },
    issues
  };
}

export function traverseFromTerminal(graph: ElectricalTopologyGraph, start: ElectricalTerminalRef, circuitId?: string): Set<string> {
  const visited = new Set<string>();
  const queue = [terminalKey(start)];

  while (queue.length) {
    const key = queue.shift()!;
    if (visited.has(key)) continue;
    visited.add(key);
    const wires = graph.adjacency.get(key) ?? [];
    wires
      .filter((wire) => !circuitId || wire.circuitId === circuitId)
      .forEach((wire) => {
        const next = wire.from.componentId + ':' + wire.from.terminalId === key ? wire.to : wire.from;
        const nextKey = terminalKey(next);
        if (!visited.has(nextKey)) queue.push(nextKey);
      });
  }

  return visited;
}

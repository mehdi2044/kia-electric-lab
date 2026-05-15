import { appliances } from '../../data/appliances';
import type { ElectricalComponent, ElectricalProject, ElectricalTerminalRef, ElectricalWireKind } from '../../types/electrical';
import { calculateCurrent } from '../safety-engine/electricalMath';
import { buildTopologyGraph, createTerminalLookup } from '../topology-engine/topologyEngine';
import type { ElectricalTopologyGraph, TopologyWire } from '../topology-engine/types';
import { getOtherTerminal, terminalKey } from '../topology-engine/types';
import { isWireDirectShort } from '../current-engine/currentEngine';

export interface LiveComponentState {
  componentId: string;
  powered: boolean;
  energized: boolean;
  activeLoad: boolean;
  phaseConnected: boolean;
  neutralConnected: boolean;
  explanationFa: string;
}

export interface LiveWireState {
  wireId: string;
  circuitId: string;
  energized: boolean;
  carryingCurrent: boolean;
  currentAmp: number;
  unsafe: boolean;
  kind?: ElectricalWireKind;
  explanationFa: string;
}

export interface LiveBreakerState {
  circuitId: string;
  enabled: boolean;
  overloaded: boolean;
  tripped: boolean;
  currentAmp: number;
  explanationFa: string;
}

export interface LiveCircuitState {
  graph: ElectricalTopologyGraph;
  components: LiveComponentState[];
  wires: LiveWireState[];
  breakers: LiveBreakerState[];
  warningsFa: string[];
}

type Adjacency = Map<string, Array<{ to: string; wireId?: string }>>;

function addConnection(adjacency: Adjacency, from: ElectricalTerminalRef, to: ElectricalTerminalRef, wireId?: string) {
  const fromKey = terminalKey(from);
  const toKey = terminalKey(to);
  adjacency.set(fromKey, [...(adjacency.get(fromKey) ?? []), { to: toKey, wireId }]);
  adjacency.set(toKey, [...(adjacency.get(toKey) ?? []), { to: fromKey, wireId }]);
}

function buildLiveAdjacency(project: ElectricalProject, graph: ElectricalTopologyGraph, ignoredWireId?: string): Adjacency {
  const adjacency: Adjacency = new Map();
  graph.wires
    .filter((wire) => wire.id !== ignoredWireId)
    .forEach((wire) => addConnection(adjacency, wire.from, wire.to, wire.id));

  project.circuits.forEach((circuit) => {
    const breakerState = project.breakerStates?.[circuit.id];
    if (breakerState?.enabled === false || breakerState?.tripped) return;
    addConnection(
      adjacency,
      { componentId: `breaker:${circuit.id}`, terminalId: 'line-in' },
      { componentId: `breaker:${circuit.id}`, terminalId: 'load-out' }
    );
  });

  project.components.forEach((component) => {
    const state = project.switchStates?.[component.id];
    if (component.type === 'one-way-switch' && state?.on) {
      addConnection(adjacency, { componentId: component.id, terminalId: 'line-in' }, { componentId: component.id, terminalId: 'line-out' });
    }
    if (component.type === 'two-gang-switch') {
      ['line-out-1', 'line-out-2'].forEach((terminalId) => {
        if (state?.outputs?.[terminalId]) {
          addConnection(adjacency, { componentId: component.id, terminalId: 'line-in' }, { componentId: component.id, terminalId });
        }
      });
    }
  });

  return adjacency;
}

function traverse(adjacency: Adjacency, start: ElectricalTerminalRef): Set<string> {
  const visited = new Set<string>();
  const queue = [terminalKey(start)];
  while (queue.length) {
    const key = queue.shift()!;
    if (visited.has(key)) continue;
    visited.add(key);
    (adjacency.get(key) ?? []).forEach((next) => {
      if (!visited.has(next.to)) queue.push(next.to);
    });
  }
  return visited;
}

function componentWatts(component: ElectricalComponent): number {
  if (!component.applianceId) return 0;
  return appliances.find((appliance) => appliance.id === component.applianceId)?.watts ?? 0;
}

function isLoadComponent(component: ElectricalComponent): boolean {
  return component.type === 'lamp' || component.type === 'outlet' || component.type === 'appliance';
}

function loadActive(project: ElectricalProject, component: ElectricalComponent): boolean {
  if (component.type !== 'appliance') return true;
  return project.loadStates?.[component.id] !== false;
}

function loadExplanation(component: ElectricalComponent, phaseConnected: boolean, neutralConnected: boolean, active: boolean): string {
  if (!phaseConnected && !neutralConnected) return 'مسیر فاز و نول کامل نیست؛ جریان نمی‌تواند یک حلقه کامل بسازد.';
  if (!phaseConnected) return 'فاز به این قطعه نمی‌رسد؛ کلید، فیوز یا مسیر فاز قطع است.';
  if (!neutralConnected) return 'نول وصل نیست؛ بدون مسیر برگشت، وسیله روشن نمی‌شود.';
  if (!active) return 'مسیر برق آماده است، اما مصرف‌کننده در حالت خاموش قرار دارد.';
  if (component.type === 'lamp') return 'لامپ روشن است چون فاز از مسیر کنترل‌شده می‌رسد و نول هم مسیر برگشت را کامل کرده است.';
  if (component.type === 'outlet') return 'پریز برقدار است چون فاز و نول هر دو به آن رسیده‌اند.';
  return 'وسیله فعال است چون فاز و نول کامل هستند و مصرف‌کننده روشن شده است.';
}

function downstreamCurrent(project: ElectricalProject, graph: ElectricalTopologyGraph, wire: TopologyWire, poweredLoads: LiveComponentState[]): number {
  const adjacency = buildLiveAdjacency(project, graph, wire.id);
  const fromReach = traverse(adjacency, wire.from);
  const toReach = traverse(adjacency, wire.to);
  const fromHasSupply = [...fromReach].some((key) => key.endsWith(':load-out') || key.endsWith(':phase-source') || key.endsWith(':neutral-source'));
  const toHasSupply = [...toReach].some((key) => key.endsWith(':load-out') || key.endsWith(':phase-source') || key.endsWith(':neutral-source'));
  const downstream = fromHasSupply && !toHasSupply ? toReach : toHasSupply && !fromHasSupply ? fromReach : new Set([...fromReach, ...toReach]);
  return poweredLoads
    .filter((load) => downstream.has(terminalKey({ componentId: load.componentId, terminalId: 'phase' })) || downstream.has(terminalKey({ componentId: load.componentId, terminalId: 'neutral' })))
    .reduce((sum, load) => {
      const component = project.components.find((item) => item.id === load.componentId);
      return sum + calculateCurrent(component ? componentWatts(component) : 0, project.voltage);
    }, 0);
}

export function simulateLiveCircuitState(project: ElectricalProject): LiveCircuitState {
  const { graph, issues } = buildTopologyGraph(project);
  const lookup = createTerminalLookup(graph);
  const adjacency = buildLiveAdjacency(project, graph);
  const panelNeutralReach = traverse(adjacency, { componentId: 'main-panel', terminalId: 'neutral-source' });
  const phaseReachByCircuit = new Map(
    project.circuits.map((circuit) => {
      const breakerState = project.breakerStates?.[circuit.id];
      const enabled = breakerState?.enabled !== false && !breakerState?.tripped;
      return [circuit.id, enabled ? traverse(adjacency, { componentId: `breaker:${circuit.id}`, terminalId: 'load-out' }) : new Set<string>()] as const;
    })
  );

  const components = project.components.filter(isLoadComponent).map((component) => {
    const circuitId = component.circuitId ?? project.circuits.find((circuit) => circuit.componentIds.includes(component.id))?.id;
    const phaseConnected = circuitId ? (phaseReachByCircuit.get(circuitId)?.has(terminalKey({ componentId: component.id, terminalId: 'phase' })) ?? false) : false;
    const neutralConnected = panelNeutralReach.has(terminalKey({ componentId: component.id, terminalId: 'neutral' }));
    const activeLoad = loadActive(project, component);
    const powered = phaseConnected && neutralConnected && activeLoad;
    return {
      componentId: component.id,
      powered,
      energized: phaseConnected && neutralConnected,
      activeLoad,
      phaseConnected,
      neutralConnected,
      explanationFa: loadExplanation(component, phaseConnected, neutralConnected, activeLoad)
    };
  });

  const poweredLoads = components.filter((component) => component.powered);
  const wires = graph.wires.map((wire) => {
    const fromKey = terminalKey(wire.from);
    const toKey = terminalKey(wire.to);
    const energized = [...phaseReachByCircuit.values()].some((reach) => reach.has(fromKey) || reach.has(toKey)) || panelNeutralReach.has(fromKey) || panelNeutralReach.has(toKey);
    const currentAmp = downstreamCurrent(project, graph, wire, poweredLoads);
    const unsafe = isWireDirectShort(graph, wire) || currentAmp > wire.maxAmp;
    return {
      wireId: wire.id,
      circuitId: wire.circuitId,
      energized,
      carryingCurrent: currentAmp > 0.01,
      currentAmp,
      unsafe,
      kind: wire.kind,
      explanationFa: unsafe
        ? 'این سیم وضعیت خطرناک دارد؛ یا اتصال اشتباه است یا جریان از ظرفیت آموزشی سیم بیشتر شده است.'
        : currentAmp > 0.01
          ? 'این سیم بخشی از مسیر جریان مصرف‌کننده‌های روشن است.'
          : 'این سیم فعلا جریان مؤثر عبور نمی‌دهد.'
    };
  });

  const breakers = project.circuits.map((circuit) => {
    const enabled = project.breakerStates?.[circuit.id]?.enabled !== false;
    const tripped = Boolean(project.breakerStates?.[circuit.id]?.tripped);
    const currentAmp = components
      .filter((component) => component.powered)
      .filter((component) => project.circuits.find((item) => item.id === circuit.id)?.componentIds.includes(component.componentId))
      .reduce((sum, state) => {
        const component = project.components.find((item) => item.id === state.componentId);
        return sum + calculateCurrent(component ? componentWatts(component) : 0, project.voltage);
      }, 0);
    const overloaded = currentAmp > circuit.breakerAmp;
    return {
      circuitId: circuit.id,
      enabled,
      overloaded,
      tripped,
      currentAmp,
      explanationFa: !enabled
        ? 'فیوز در شبیه‌سازی خاموش است و خروجی فاز مدار را قطع کرده است.'
        : overloaded
          ? 'جریان مدار از آمپر فیوز بیشتر شده است؛ در آموزش باید بار کم شود یا مدار اصلاح شود.'
          : 'فیوز وصل است و جریان مدار در محدوده آموزشی قرار دارد.'
    };
  });

  return {
    graph,
    components,
    wires,
    breakers,
    warningsFa: issues.map((issue) => issue.messageFa)
  };
}

export function isLampPowered(project: ElectricalProject, componentId: string): boolean {
  return simulateLiveCircuitState(project).components.some((component) => component.componentId === componentId && component.powered);
}

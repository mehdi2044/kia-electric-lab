import { appliances } from '../../data/appliances';
import type { ElectricalComponent, ElectricalProject, ElectricalTerminalRef } from '../../types/electrical';
import { calculateCurrent } from '../safety-engine/electricalMath';
import { buildTopologyGraph, createTerminalLookup, traverseFromTerminal } from '../topology-engine/topologyEngine';
import type { ElectricalTopologyGraph, TopologyWire } from '../topology-engine/types';
import { getOtherTerminal, terminalKey } from '../topology-engine/types';

export interface LoadFlowResult {
  componentId: string;
  circuitId: string;
  applianceId: string;
  watts: number;
  currentAmp: number;
  phaseConnected: boolean;
  neutralConnected: boolean;
}

export interface WireFlowResult {
  wireId: string;
  circuitId: string;
  currentAmp: number;
  voltageDrop: number;
  overloaded: boolean;
}

export interface CircuitFlowResult {
  circuitId: string;
  totalWatts: number;
  totalCurrentAmp: number;
  breakerAmp: number;
  overloaded: boolean;
}

export interface CurrentSimulationResult {
  graph: ElectricalTopologyGraph;
  loads: LoadFlowResult[];
  wires: WireFlowResult[];
  circuits: CircuitFlowResult[];
}

function loadComponents(project: ElectricalProject, circuitId: string): ElectricalComponent[] {
  const circuit = project.circuits.find((item) => item.id === circuitId);
  if (!circuit) return [];
  return circuit.componentIds
    .map((componentId) => project.components.find((component) => component.id === componentId))
    .filter((component): component is ElectricalComponent => Boolean(component?.applianceId));
}

function applianceWatts(applianceId: string): number {
  return appliances.find((appliance) => appliance.id === applianceId)?.watts ?? 0;
}

function loadPhaseRef(componentId: string): ElectricalTerminalRef {
  return { componentId, terminalId: 'phase' };
}

function loadNeutralRef(componentId: string): ElectricalTerminalRef {
  return { componentId, terminalId: 'neutral' };
}

function terminalReachable(graph: ElectricalTopologyGraph, from: ElectricalTerminalRef, target: ElectricalTerminalRef, circuitId: string): boolean {
  return traverseFromTerminal(graph, from, circuitId).has(terminalKey(target));
}

function simulateLoads(project: ElectricalProject, graph: ElectricalTopologyGraph): LoadFlowResult[] {
  return project.circuits.flatMap((circuit) => {
    const breakerLoad: ElectricalTerminalRef = { componentId: `breaker:${circuit.id}`, terminalId: 'load-out' };
    const panelNeutral: ElectricalTerminalRef = { componentId: 'main-panel', terminalId: 'neutral-source' };

    return loadComponents(project, circuit.id).map((component) => {
      const applianceId = component.applianceId!;
      return {
        componentId: component.id,
        circuitId: circuit.id,
        applianceId,
        watts: applianceWatts(applianceId),
        currentAmp: calculateCurrent(applianceWatts(applianceId), project.voltage),
        phaseConnected: terminalReachable(graph, breakerLoad, loadPhaseRef(component.id), circuit.id),
        neutralConnected: terminalReachable(graph, panelNeutral, loadNeutralRef(component.id), circuit.id)
      };
    });
  });
}

function withoutWire(graph: ElectricalTopologyGraph, removedWireId: string): ElectricalTopologyGraph {
  const wires = graph.wires.filter((wire) => wire.id !== removedWireId);
  const adjacency = new Map<string, TopologyWire[]>();
  wires.forEach((wire) => {
    const fromKey = terminalKey(wire.from);
    const toKey = terminalKey(wire.to);
    adjacency.set(fromKey, [...(adjacency.get(fromKey) ?? []), wire]);
    adjacency.set(toKey, [...(adjacency.get(toKey) ?? []), wire]);
  });
  return { ...graph, wires, adjacency };
}

function calculateWireCurrent(graph: ElectricalTopologyGraph, wire: TopologyWire, loads: LoadFlowResult[]): number {
  const graphWithoutWire = withoutWire(graph, wire.id);
  const breakerRef = { componentId: `breaker:${wire.circuitId}`, terminalId: 'load-out' };
  const panelPhaseRef = { componentId: 'main-panel', terminalId: 'phase-source' };
  const panelNeutralRef = { componentId: 'main-panel', terminalId: 'neutral-source' };
  const supplySide = new Set([
    ...traverseFromTerminal(graphWithoutWire, breakerRef, wire.circuitId),
    ...traverseFromTerminal(graphWithoutWire, panelPhaseRef, wire.circuitId),
    ...traverseFromTerminal(graphWithoutWire, panelNeutralRef, wire.circuitId)
  ]);
  const fromKey = terminalKey(wire.from);
  const toKey = terminalKey(wire.to);
  const downstreamStart = supplySide.has(fromKey) && !supplySide.has(toKey) ? wire.to : supplySide.has(toKey) && !supplySide.has(fromKey) ? wire.from : undefined;

  if (!downstreamStart) {
    return loads
      .filter((load) => load.circuitId === wire.circuitId && load.phaseConnected && load.neutralConnected)
      .reduce((sum, load) => sum + load.currentAmp, 0);
  }

  const downstream = traverseFromTerminal(graphWithoutWire, downstreamStart, wire.circuitId);
  return loads
    .filter((load) => load.circuitId === wire.circuitId && load.phaseConnected && load.neutralConnected)
    .filter((load) => downstream.has(terminalKey(loadPhaseRef(load.componentId))) || downstream.has(terminalKey(loadNeutralRef(load.componentId))))
    .reduce((sum, load) => sum + load.currentAmp, 0);
}

export function simulateCurrentFlow(project: ElectricalProject): CurrentSimulationResult {
  const { graph } = buildTopologyGraph(project);
  const lookup = createTerminalLookup(graph);
  const loads = simulateLoads(project, graph).filter((load) => lookup.has(terminalKey(loadPhaseRef(load.componentId))));
  const circuits = project.circuits.map((circuit) => {
    const circuitLoads = loads.filter((load) => load.circuitId === circuit.id && load.phaseConnected && load.neutralConnected);
    const totalWatts = circuitLoads.reduce((sum, load) => sum + load.watts, 0);
    const totalCurrentAmp = circuitLoads.reduce((sum, load) => sum + load.currentAmp, 0);
    return {
      circuitId: circuit.id,
      totalWatts,
      totalCurrentAmp,
      breakerAmp: circuit.breakerAmp,
      overloaded: totalCurrentAmp > circuit.breakerAmp
    };
  });
  const wires = graph.wires.map((wire) => {
    const currentAmp = calculateWireCurrent(graph, wire, loads);
    return {
      wireId: wire.id,
      circuitId: wire.circuitId,
      currentAmp,
      voltageDrop: currentAmp * wire.resistanceOhmPerMeter * wire.lengthMeters,
      overloaded: currentAmp > wire.maxAmp
    };
  });

  return { graph, loads, wires, circuits };
}

export function getConnectedTerminalKeys(graph: ElectricalTopologyGraph, ref: ElectricalTerminalRef, circuitId: string): Set<string> {
  return traverseFromTerminal(graph, ref, circuitId);
}

export function isWireDirectShort(graph: ElectricalTopologyGraph, wire: TopologyWire): boolean {
  const lookup = createTerminalLookup(graph);
  const from = lookup.get(terminalKey(wire.from));
  const to = lookup.get(terminalKey(wire.to));
  if (!from || !to) return false;
  const roles = new Set([from.terminal.energizedRole, to.terminal.energizedRole]);
  return roles.has('phase') && roles.has('neutral');
}

export function wireTouchesTerminal(wire: TopologyWire, ref: ElectricalTerminalRef): boolean {
  return terminalKey(wire.from) === terminalKey(ref) || terminalKey(wire.to) === terminalKey(ref);
}

export function otherTerminalKey(wire: TopologyWire, key: string): string | undefined {
  const other = getOtherTerminal(wire, key);
  return other ? terminalKey(other) : undefined;
}

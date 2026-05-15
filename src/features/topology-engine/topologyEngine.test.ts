import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import type { ElectricalProject } from '../../types/electrical';
import { simulateCurrentFlow } from '../current-engine/currentEngine';
import { generateTopologyWarnings } from '../validation-engine/validationEngine';
import { buildTopologyGraph, traverseFromTerminal } from './topologyEngine';
import { terminalKey } from './types';

function cloneProject(): ElectricalProject {
  return structuredClone(defaultProject);
}

describe('electrical topology engine', () => {
  it('builds a deterministic graph and traverses generated circuit wiring', () => {
    const project = cloneProject();
    const { graph, issues } = buildTopologyGraph(project);
    const reachableFromBreaker = traverseFromTerminal(
      graph,
      { componentId: 'breaker:c-lighting', terminalId: 'load-out' },
      'c-lighting'
    );
    const reachableFromNeutral = traverseFromTerminal(
      graph,
      { componentId: 'main-panel', terminalId: 'neutral-source' },
      'c-lighting'
    );

    expect(issues).toEqual([]);
    expect(graph.nodes.some((node) => node.id === 'breaker:c-lighting')).toBe(true);
    expect(reachableFromBreaker.has(terminalKey({ componentId: 'lamp-living', terminalId: 'phase' }))).toBe(true);
    expect(reachableFromNeutral.has(terminalKey({ componentId: 'lamp-living', terminalId: 'neutral' }))).toBe(true);
  });

  it('calculates parallel branch load and breaker current from topology loads', () => {
    const project = cloneProject();
    const flow = simulateCurrentFlow(project);
    const kitchen = flow.circuits.find((circuit) => circuit.circuitId === 'c-kitchen');
    const ovenWire = flow.wires.find((wire) => wire.wireId === 'c-kitchen:phase:oven-kitchen');

    expect(kitchen?.totalWatts).toBe(2900);
    expect(kitchen?.totalCurrentAmp).toBeCloseTo(13.18, 2);
    expect(ovenWire?.currentAmp).toBeCloseTo(2500 / 220, 2);
  });

  it('detects topology-based overload at the breaker', () => {
    const project = cloneProject();
    project.circuits = project.circuits.map((circuit) =>
      circuit.id === 'c-kitchen' ? { ...circuit, breakerAmp: 6 } : circuit
    );

    const warnings = generateTopologyWarnings(project);
    expect(warnings.some((warning) => warning.id === 'topology:c-kitchen:breaker-overload')).toBe(true);
  });

  it('detects invalid breaker placement when phase does not enter breaker line terminal', () => {
    const project = cloneProject();
    project.wires = [
      {
        id: 'bad-load-wire',
        circuitId: 'c-living-outlet',
        from: { componentId: 'breaker:c-living-outlet', terminalId: 'load-out' },
        to: { componentId: 'outlet-living', terminalId: 'phase' },
        lengthMeters: 5,
        wireSizeMm2: 2.5
      },
      {
        id: 'neutral-wire',
        circuitId: 'c-living-outlet',
        from: { componentId: 'outlet-living', terminalId: 'neutral' },
        to: { componentId: 'main-panel', terminalId: 'neutral-source' },
        lengthMeters: 5,
        wireSizeMm2: 2.5
      }
    ];

    const warnings = generateTopologyWarnings(project);
    expect(warnings.some((warning) => warning.id === 'topology:c-living-outlet:invalid-breaker-placement')).toBe(true);
  });

  it('detects disconnected neutral and incomplete loop', () => {
    const project = cloneProject();
    project.wires = [
      {
        id: 'panel-to-breaker',
        circuitId: 'c-living-outlet',
        from: { componentId: 'main-panel', terminalId: 'phase-source' },
        to: { componentId: 'breaker:c-living-outlet', terminalId: 'line-in' },
        lengthMeters: 3,
        wireSizeMm2: 2.5
      },
      {
        id: 'breaker-to-outlet',
        circuitId: 'c-living-outlet',
        from: { componentId: 'breaker:c-living-outlet', terminalId: 'load-out' },
        to: { componentId: 'outlet-living', terminalId: 'phase' },
        lengthMeters: 5,
        wireSizeMm2: 2.5
      }
    ];

    const warnings = generateTopologyWarnings(project);
    expect(warnings.some((warning) => warning.id === 'topology:c-living-outlet:outlet-living:neutral-open')).toBe(true);
    expect(warnings.some((warning) => warning.id === 'topology:c-living-outlet:outlet-living:incomplete-loop')).toBe(true);
  });

  it('detects direct short circuit between phase and neutral terminals', () => {
    const project = cloneProject();
    project.wires = [
      {
        id: 'short-wire',
        circuitId: 'c-living-outlet',
        from: { componentId: 'outlet-living', terminalId: 'phase' },
        to: { componentId: 'outlet-living', terminalId: 'neutral' },
        lengthMeters: 1,
        wireSizeMm2: 2.5
      }
    ];

    const warnings = generateTopologyWarnings(project);
    expect(warnings.some((warning) => warning.id === 'topology:short-wire:short-circuit')).toBe(true);
  });
});

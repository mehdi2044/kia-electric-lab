import { describe, expect, it } from 'vitest';
import { defaultProject } from '../data/apartment';
import { diagnoseProject } from './diagnosticsEngine';
import { repairProject } from './repairEngine';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('project diagnostics and repair', () => {
  it('detects orphan wires, missing terminals, invalid scale, empty circuits, and missing breakers', () => {
    const project = clone(defaultProject);
    project.pixelsPerMeter = 0;
    project.circuits.push({
      id: 'empty-circuit',
      nameFa: 'مدار خالی',
      roomIds: [],
      componentIds: [],
      applianceIds: [],
      wireSizeMm2: 2.5,
      breakerAmp: 16,
      lengthMeters: 1,
      kind: 'outlet'
    });
    project.wires = [
      {
        id: 'bad-wire',
        circuitId: 'missing-circuit',
        from: { componentId: 'missing-component', terminalId: 'phase' },
        to: { componentId: project.components[0].id, terminalId: 'missing-terminal' },
        lengthMeters: -1,
        wireSizeMm2: 2.5,
        routePoints: [{ x: Number.NaN, y: 1 }]
      }
    ];

    const report = diagnoseProject(project);
    const ids = report.issues.map((issue) => issue.id);

    expect(ids).toContain('schema:invalid-pixels-per-meter');
    expect(ids).toContain('wire:bad-wire:orphan');
    expect(ids).toContain('terminal:bad-wire:to:missing-terminal');
    expect(ids).toContain('circuit:empty-circuit:empty');
    expect(ids).toContain('panelboard:circuit-without-breaker:empty-circuit');
  });

  it('repairs safe issues conservatively', () => {
    const project = clone(defaultProject);
    project.pixelsPerMeter = 0;
    project.panelboard = {
      mainBreakerAmp: 25,
      breakers: [{ id: 'slot-bad', labelFa: 'فیوز خراب', amp: 16, circuitId: 'missing-circuit' }]
    };
    project.wires = [
      {
        id: 'orphan-wire',
        circuitId: 'missing-circuit',
        from: { componentId: 'missing-component', terminalId: 'phase' },
        to: { componentId: project.components[0].id, terminalId: 'phase-source' },
        lengthMeters: 1,
        wireSizeMm2: 2.5
      }
    ];

    const result = repairProject(project);

    expect(result.project.pixelsPerMeter).toBe(24);
    expect(result.project.wires).toEqual([]);
    expect(result.project.panelboard?.breakers[0].circuitId).toBeUndefined();
    expect(result.logs.length).toBeGreaterThan(0);
  });
});

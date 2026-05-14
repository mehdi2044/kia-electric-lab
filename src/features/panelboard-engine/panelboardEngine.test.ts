import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import type { ElectricalProject } from '../../types/electrical';
import { calculateCircuitCost } from '../cost-engine/costEngine';
import { generatePanelboardWarnings } from './panelboardEngine';

function cloneProject(): ElectricalProject {
  return structuredClone(defaultProject);
}

describe('panelboard engine and geometric cost', () => {
  it('detects a circuit without a breaker assignment', () => {
    const project = cloneProject();
    project.panelboard = {
      mainBreakerAmp: 25,
      breakers: [{ id: 'slot-1', labelFa: 'فیوز ۱', amp: 16 }]
    };

    const warnings = generatePanelboardWarnings(project);
    expect(warnings.some((warning) => warning.id === 'panelboard:c-lighting:without-breaker')).toBe(true);
    expect(warnings.some((warning) => warning.id === 'panelboard:slot-1:empty-breaker')).toBe(true);
  });

  it('detects breaker and wire size incompatibility', () => {
    const project = cloneProject();
    project.panelboard = {
      mainBreakerAmp: 25,
      breakers: [{ id: 'slot-1', labelFa: 'فیوز ۱', amp: 32, circuitId: 'c-lighting' }]
    };

    const warnings = generatePanelboardWarnings(project);
    expect(warnings.some((warning) => warning.id === 'panelboard:slot-1:wire-incompatible')).toBe(true);
  });

  it('uses geometric explicit wire length for circuit cost', () => {
    const project = cloneProject();
    project.pixelsPerMeter = 10;
    project.wires = [
      {
        id: 'geo-wire',
        circuitId: 'c-living-outlet',
        from: { componentId: 'main-panel', terminalId: 'phase-source' },
        to: { componentId: 'outlet-living', terminalId: 'phase' },
        lengthMeters: 1,
        wireSizeMm2: 2.5,
        kind: 'phase',
        routePoints: [{ x: 100, y: 100 }]
      }
    ];

    const circuit = project.circuits.find((item) => item.id === 'c-living-outlet')!;
    const cost = calculateCircuitCost(circuit, project);
    const wireItem = cost.items.find((item) => item.labelFa === 'سیم‌ها بر اساس مسیر هندسی');

    expect(wireItem?.quantity).toBeGreaterThan(1);
    expect(wireItem?.total).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import type { ElectricalProject } from '../../types/electrical';
import { generateTopologyWarnings } from '../validation-engine/validationEngine';
import { createElectricalWire, inferWireKind, validateTerminalConnection } from './wireFactory';

function cloneProject(): ElectricalProject {
  return structuredClone(defaultProject);
}

describe('terminal-aware wire factory', () => {
  it('creates a terminal ref based explicit phase wire', () => {
    const project = cloneProject();
    const result = createElectricalWire({
      project,
      circuitId: 'c-living-outlet',
      from: { componentId: 'breaker:c-living-outlet', terminalId: 'load-out' },
      to: { componentId: 'outlet-living', terminalId: 'phase' },
      wireSizeMm2: 2.5,
      lengthMeters: 6
    });

    expect(result.validation.valid).toBe(true);
    expect(result.wire?.from).toEqual({ componentId: 'breaker:c-living-outlet', terminalId: 'load-out' });
    expect(result.wire?.to).toEqual({ componentId: 'outlet-living', terminalId: 'phase' });
    expect(result.wire?.kind).toBe('phase');
  });

  it('infers neutral and earth wire kinds from terminal roles', () => {
    const project = cloneProject();

    expect(
      inferWireKind(project, { componentId: 'outlet-living', terminalId: 'neutral' }, { componentId: 'main-panel', terminalId: 'neutral-source' })
    ).toBe('neutral');
    expect(
      inferWireKind(project, { componentId: 'outlet-living', terminalId: 'earth' }, { componentId: 'main-panel', terminalId: 'earth-source' })
    ).toBe('earth');
  });

  it('rejects invalid direct phase to neutral terminal connections', () => {
    const project = cloneProject();
    const validation = validateTerminalConnection(
      project,
      { componentId: 'outlet-living', terminalId: 'phase' },
      { componentId: 'outlet-living', terminalId: 'neutral' }
    );

    expect(validation.valid).toBe(false);
    expect(validation.titleFa).toContain('فاز به نول');
  });

  it('detects short circuit from explicit wires in topology validation', () => {
    const project = cloneProject();
    project.wires = [
      {
        id: 'explicit-short',
        circuitId: 'c-living-outlet',
        from: { componentId: 'outlet-living', terminalId: 'phase' },
        to: { componentId: 'outlet-living', terminalId: 'neutral' },
        lengthMeters: 1,
        wireSizeMm2: 2.5,
        kind: 'phase'
      }
    ];

    const warnings = generateTopologyWarnings(project);
    expect(warnings.some((warning) => warning.id === 'topology:explicit-short:short-circuit')).toBe(true);
  });

  it('detects incomplete loop from explicit wires missing neutral return', () => {
    const project = cloneProject();
    project.wires = [
      {
        id: 'phase-feed',
        circuitId: 'c-living-outlet',
        from: { componentId: 'main-panel', terminalId: 'phase-source' },
        to: { componentId: 'breaker:c-living-outlet', terminalId: 'line-in' },
        lengthMeters: 2,
        wireSizeMm2: 2.5,
        kind: 'phase'
      },
      {
        id: 'phase-load',
        circuitId: 'c-living-outlet',
        from: { componentId: 'breaker:c-living-outlet', terminalId: 'load-out' },
        to: { componentId: 'outlet-living', terminalId: 'phase' },
        lengthMeters: 6,
        wireSizeMm2: 2.5,
        kind: 'phase'
      }
    ];

    const warnings = generateTopologyWarnings(project);
    expect(warnings.some((warning) => warning.id === 'topology:c-living-outlet:outlet-living:neutral-open')).toBe(true);
    expect(warnings.some((warning) => warning.id === 'topology:c-living-outlet:outlet-living:incomplete-loop')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import type { ElectricalProject, ElectricalWire } from '../../types/electrical';
import {
  calculateRouteLengthPixels,
  calculateWireGeometryLength,
  insertBendPoint,
  pixelsToMeters,
  removeBendPoint,
  resetWireRoute,
  updateBendPoint
} from './wireGeometry';

function projectWithScale(pixelsPerMeter = 10): ElectricalProject {
  return { ...structuredClone(defaultProject), pixelsPerMeter };
}

function sampleWire(): ElectricalWire {
  return {
    id: 'w1',
    circuitId: 'c-living-outlet',
    from: { componentId: 'main-panel', terminalId: 'phase-source' },
    to: { componentId: 'outlet-living', terminalId: 'phase' },
    lengthMeters: 1,
    wireSizeMm2: 2.5,
    kind: 'phase',
    routePoints: []
  };
}

describe('wire geometry', () => {
  it('calculates route length from points', () => {
    expect(calculateRouteLengthPixels([{ x: 0, y: 0 }, { x: 30, y: 40 }])).toBe(50);
  });

  it('converts pixels to meters with project scale', () => {
    expect(pixelsToMeters(120, 24)).toBe(5);
  });

  it('inserts, updates, deletes, and resets bend points', () => {
    const inserted = insertBendPoint(sampleWire(), { x: 25, y: 35 });
    expect(inserted.routePoints).toEqual([{ x: 24, y: 24 }]);

    const updated = updateBendPoint(inserted, 0, { x: 48, y: 60 }, true);
    expect(updated.routePoints).toEqual([{ x: 48, y: 72 }]);

    const removed = removeBendPoint(updated, 0);
    expect(removed.routePoints).toEqual([]);

    const reset = resetWireRoute({ ...updated, manualLengthOverride: 99 });
    expect(reset.routePoints).toEqual([]);
    expect(reset.manualLengthOverride).toBeUndefined();
  });

  it('uses manual override only when present', () => {
    const project = projectWithScale();
    const wire = { ...sampleWire(), manualLengthOverride: 12 };
    expect(calculateWireGeometryLength(project, wire)).toBe(12);
  });

  it('calculates wire length from terminal coordinates and bend points', () => {
    const project = projectWithScale(20);
    const wire = { ...sampleWire(), routePoints: [{ x: 100, y: 100 }] };
    expect(calculateWireGeometryLength(project, wire)).toBeGreaterThan(0);
  });
});

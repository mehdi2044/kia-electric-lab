import { describe, expect, it } from 'vitest';
import { defaultProject } from '../data/apartment';
import {
  CURRENT_SCHEMA_VERSION,
  detectProjectVersion,
  migrateProject,
  parsePersistedProject,
  validateMigratedProject
} from './projectMigration';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('project schema migration', () => {
  it('detects legacy project shapes', () => {
    const phase1 = clone(defaultProject) as unknown as Record<string, unknown>;
    delete phase1.schemaVersion;
    delete phase1.appVersion;
    delete phase1.createdAt;
    delete phase1.updatedAt;
    delete phase1.wires;
    delete phase1.panelboard;
    delete phase1.pixelsPerMeter;

    const phase2 = { ...phase1, wires: [] };
    const phase3 = { ...phase1, wires: [{ id: 'w1', kind: 'phase' }] };
    const phase4 = { ...phase1, wires: [], pixelsPerMeter: 24 };

    expect(detectProjectVersion(phase1)).toBe(1);
    expect(detectProjectVersion(phase2)).toBe(2);
    expect(detectProjectVersion(phase3)).toBe(3);
    expect(detectProjectVersion(phase4)).toBe(4);
    expect(detectProjectVersion(defaultProject)).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('migrates a Phase 1 project into the latest schema', () => {
    const phase1 = clone(defaultProject) as unknown as Record<string, unknown>;
    delete phase1.schemaVersion;
    delete phase1.appVersion;
    delete phase1.createdAt;
    delete phase1.updatedAt;
    delete phase1.wires;
    delete phase1.panelboard;
    delete phase1.pixelsPerMeter;

    const result = migrateProject(phase1);

    expect(result.fromVersion).toBe(1);
    expect(result.toVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.project.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.project.wires).toEqual([]);
    expect(result.project.pixelsPerMeter).toBe(24);
    expect(result.project.panelboard?.breakers.length).toBe(result.project.circuits.length);
  });

  it('preserves explicit wires and panelboard assignments during migration', () => {
    const phase4 = clone(defaultProject) as unknown as Record<string, unknown>;
    delete phase4.schemaVersion;
    delete phase4.appVersion;
    delete phase4.createdAt;
    delete phase4.updatedAt;
    phase4.wires = [
      {
        id: 'wire-explicit-1',
        circuitId: defaultProject.circuits[0].id,
        from: { componentId: defaultProject.components[0].id, terminalId: 'phase' },
        to: { componentId: defaultProject.components[1].id, terminalId: 'phase' },
        lengthMeters: 4,
        wireSizeMm2: 1.5,
        kind: 'switched-phase',
        routePoints: [{ x: 10, y: 20 }, { x: 30, y: 20 }],
        manualLengthOverride: 6
      }
    ];
    phase4.panelboard = {
      mainBreakerAmp: 25,
      breakers: [{ id: 'slot-a', labelFa: 'فیوز روشنایی', amp: 10, circuitId: defaultProject.circuits[0].id }]
    };

    const result = migrateProject(phase4);

    expect(result.fromVersion).toBe(4);
    expect(result.project.wires?.[0].id).toBe('wire-explicit-1');
    expect(result.project.wires?.[0].kind).toBe('switched-phase');
    expect(result.project.wires?.[0].routePoints).toHaveLength(2);
    expect(result.project.wires?.[0].manualLengthOverride).toBe(6);
    expect(result.project.panelboard?.breakers[0].circuitId).toBe(defaultProject.circuits[0].id);
  });

  it('parses Zustand persisted storage shape before migration', () => {
    const raw = JSON.stringify({ state: { project: defaultProject, darkMode: true }, version: 4 });
    const parsed = parsePersistedProject(raw);

    expect(detectProjectVersion(parsed)).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('rejects corrupt project data without crashing validation callers', () => {
    expect(() => migrateProject(null)).toThrow();

    const broken = clone(defaultProject);
    broken.rooms = [];
    const validation = validateMigratedProject(broken);

    expect(validation.valid).toBe(false);
    expect(validation.errorsFa.length).toBeGreaterThan(0);
  });

  it('validates the latest default schema', () => {
    const result = validateMigratedProject(defaultProject);

    expect(result.valid).toBe(true);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultProject } from '../data/apartment';
import { CURRENT_SCHEMA_VERSION, PROJECT_STORAGE_KEY } from './projectMigration';
import { calculateProjectChecksum, serializeProjectExport } from './exportIntegrity';
import { importProjectFromJson, preparePersistedProjectStorage } from './storageSafety';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function installLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    })
  };
  vi.stubGlobal('window', { localStorage });
  return localStorage;
}

function persisted(project: unknown, version?: number) {
  return JSON.stringify({ state: { project }, version });
}

function legacyProject(phase: 1 | 2 | 3 | 4) {
  const project = clone(defaultProject) as unknown as Record<string, unknown>;
  delete project.schemaVersion;
  delete project.appVersion;
  delete project.createdAt;
  delete project.updatedAt;
  if (phase === 1) {
    delete project.wires;
    delete project.panelboard;
    delete project.pixelsPerMeter;
  }
  if (phase === 2) {
    project.wires = [];
    delete project.panelboard;
    delete project.pixelsPerMeter;
  }
  if (phase === 3) {
    project.wires = [{ id: 'wire-1', kind: 'phase' }];
    delete project.panelboard;
    delete project.pixelsPerMeter;
  }
  if (phase === 4) {
    project.wires = [];
    project.pixelsPerMeter = 24;
  }
  return project;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('storage safety migration fixtures', () => {
  it.each([1, 2, 3, 4] as const)('migrates Phase %s persisted localStorage shape end-to-end', (phase) => {
    const localStorage = installLocalStorage();
    localStorage.setItem(PROJECT_STORAGE_KEY, persisted(legacyProject(phase), phase));

    const result = preparePersistedProjectStorage();
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    const parsed = JSON.parse(raw ?? '{}');

    expect(result.ok).toBe(true);
    expect(parsed.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(parsed.state.project.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('quarantines corrupted persisted data instead of throwing', () => {
    const localStorage = installLocalStorage();
    localStorage.setItem(PROJECT_STORAGE_KEY, '{not valid json');

    const result = preparePersistedProjectStorage();

    expect(result.ok).toBe(false);
    expect(localStorage.getItem(PROJECT_STORAGE_KEY)).toBeNull();
  });

  it('exports checksum envelope and warns on checksum mismatch during import', () => {
    const raw = serializeProjectExport(defaultProject);
    const imported = importProjectFromJson(raw);
    const tampered = JSON.parse(raw);
    tampered.project.mainBreakerAmp = 32;
    const tamperedImport = importProjectFromJson(JSON.stringify(tampered));

    expect(imported.ok).toBe(true);
    expect(calculateProjectChecksum(defaultProject)).toMatch(/^[0-9a-f]{8}$/);
    expect(tamperedImport.ok).toBe(true);
    expect(tamperedImport.warningsFa?.length).toBe(1);
  });
});

import type { ElectricalProject } from '../types/electrical';

export interface ProjectExportEnvelope {
  format: 'kia-electric-lab-project';
  exportedAt: string;
  checksumAlgorithm: 'fnv1a32-canonical-json';
  checksum: string;
  project: ElectricalProject;
}

type JsonLike = null | boolean | number | string | JsonLike[] | { [key: string]: JsonLike };

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(',')}}`;
}

export function calculateProjectChecksum(project: ElectricalProject): string {
  const canonical = canonicalize(project as unknown as JsonLike);
  let hash = 0x811c9dc5;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function createProjectExportEnvelope(project: ElectricalProject): ProjectExportEnvelope {
  return {
    format: 'kia-electric-lab-project',
    exportedAt: new Date().toISOString(),
    checksumAlgorithm: 'fnv1a32-canonical-json',
    checksum: calculateProjectChecksum(project),
    project
  };
}

export function serializeProjectExport(project: ElectricalProject): string {
  return JSON.stringify(createProjectExportEnvelope(project), null, 2);
}

export function isProjectExportEnvelope(value: unknown): value is ProjectExportEnvelope {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (value as ProjectExportEnvelope).format === 'kia-electric-lab-project' &&
      typeof (value as ProjectExportEnvelope).checksum === 'string' &&
      typeof (value as ProjectExportEnvelope).project === 'object'
  );
}

export function validateProjectExportEnvelope(envelope: ProjectExportEnvelope): { valid: boolean; expected: string; actual: string } {
  const expected = calculateProjectChecksum(envelope.project);
  return {
    valid: expected === envelope.checksum,
    expected,
    actual: envelope.checksum
  };
}

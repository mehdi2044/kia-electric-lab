import type { ElectricalProject } from '../types/electrical';
import {
  BACKUP_STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  MIGRATION_ERROR_STORAGE_KEY,
  PROJECT_STORAGE_KEY,
  type ProjectBackup,
  migrateProject,
  parsePersistedProject
} from './projectMigration';
import { isProjectExportEnvelope, serializeProjectExport, validateProjectExportEnvelope } from './exportIntegrity';

type UnknownRecord = Record<string, unknown>;

export interface StoragePreparationResult {
  ok: boolean;
  migrated: boolean;
  messageFa?: string;
}

export interface ImportProjectResult {
  ok: boolean;
  project?: ElectricalProject;
  messageFa: string;
  warningsFa?: string[];
}

function isBrowserStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isProjectBackup(value: unknown): value is ProjectBackup {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.reasonFa === 'string' &&
    typeof value.raw === 'string'
  );
}

function createBackupId(): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `backup-${random}`;
}

export function readProjectBackups(): ProjectBackup[] {
  if (!isBrowserStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isProjectBackup) : [];
  } catch {
    return [];
  }
}

export function writeProjectBackups(backups: ProjectBackup[]): void {
  if (!isBrowserStorageAvailable()) return;
  window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups.slice(0, 12)));
}

export function createProjectBackup(raw: string, reasonFa: string): ProjectBackup | undefined {
  if (!isBrowserStorageAvailable()) return undefined;
  let schemaVersion: number | undefined;
  try {
    const projectLike = parsePersistedProject(raw);
    schemaVersion = isRecord(projectLike) && typeof projectLike.schemaVersion === 'number' ? projectLike.schemaVersion : undefined;
  } catch {
    schemaVersion = undefined;
  }
  const backup: ProjectBackup = {
    id: createBackupId(),
    createdAt: new Date().toISOString(),
    reasonFa,
    raw,
    schemaVersion
  };
  writeProjectBackups([backup, ...readProjectBackups()]);
  return backup;
}

export function getMigrationErrorRaw(): string | undefined {
  if (!isBrowserStorageAvailable()) return undefined;
  return window.localStorage.getItem(MIGRATION_ERROR_STORAGE_KEY) ?? undefined;
}

export function clearMigrationError(): void {
  if (!isBrowserStorageAvailable()) return;
  window.localStorage.removeItem(MIGRATION_ERROR_STORAGE_KEY);
}

export function serializeProjectForExport(project: ElectricalProject): string {
  return serializeProjectExport(project);
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function importProjectFromJson(raw: string): ImportProjectResult {
  try {
    const parsed = JSON.parse(raw);
    const warningsFa: string[] = [];
    let projectLike: unknown = parsePersistedProject(raw);
    if (isProjectExportEnvelope(parsed)) {
      const checksum = validateProjectExportEnvelope(parsed);
      projectLike = parsed.project;
      if (!checksum.valid) {
        warningsFa.push('هشدار: checksum فایل با محتوای پروژه هماهنگ نیست. ممکن است فایل دستی تغییر کرده یا ناقص باشد.');
      }
    }
    const result = migrateProject(projectLike);
    return {
      ok: true,
      project: result.project,
      messageFa: [
        result.changed
          ? `پروژه از نسخه ${result.fromVersion} به نسخه ${result.toVersion} مهاجرت داده شد.`
          : 'پروژه معتبر است و بدون تغییر ساختاری وارد شد.',
        ...warningsFa
      ].join(' '),
      warningsFa
    };
  } catch (error) {
    return {
      ok: false,
      messageFa: `فایل پروژه قابل استفاده نیست: ${error instanceof Error ? error.message : 'خطای نامشخص'}`
    };
  }
}

export function restoreProjectBackup(backupId: string): ImportProjectResult {
  const backup = readProjectBackups().find((item) => item.id === backupId);
  if (!backup) return { ok: false, messageFa: 'این پشتیبان پیدا نشد.' };
  return importProjectFromJson(backup.raw);
}

export function deleteProjectBackup(backupId: string): void {
  writeProjectBackups(readProjectBackups().filter((backup) => backup.id !== backupId));
}

export function exportBackupJson(backupId: string): string | undefined {
  return readProjectBackups().find((backup) => backup.id === backupId)?.raw;
}

export function preparePersistedProjectStorage(): StoragePreparationResult {
  if (!isBrowserStorageAvailable()) return { ok: true, migrated: false };
  const raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
  if (!raw) return { ok: true, migrated: false };

  try {
    const parsed = JSON.parse(raw);
    const projectLike = parsePersistedProject(raw);
    const result = migrateProject(projectLike);
    const persistedVersion = isRecord(parsed) && typeof parsed.version === 'number' ? parsed.version : undefined;
    const shouldRewritePersistedWrapper = persistedVersion !== CURRENT_SCHEMA_VERSION;
    if (!result.changed && !shouldRewritePersistedWrapper) {
      clearMigrationError();
      return { ok: true, migrated: false };
    }

    createProjectBackup(raw, result.changed ? 'پشتیبان خودکار قبل از مهاجرت نسخه پروژه' : 'پشتیبان خودکار قبل از هماهنگ‌سازی نسخه ذخیره‌سازی');
    const nextPersisted = isRecord(parsed)
      ? {
          ...parsed,
          state: {
            ...(isRecord(parsed.state) ? parsed.state : {}),
            project: result.project
          },
          version: CURRENT_SCHEMA_VERSION
        }
      : { state: { project: result.project }, version: CURRENT_SCHEMA_VERSION };
    window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(nextPersisted));
    clearMigrationError();
    return {
      ok: true,
      migrated: result.changed,
      messageFa: result.changed
        ? `پروژه ذخیره‌شده از نسخه ${result.fromVersion} به نسخه ${result.toVersion} مهاجرت کرد.`
        : 'نسخه wrapper ذخیره‌سازی با schema فعلی هماهنگ شد.'
    };
  } catch (error) {
    createProjectBackup(raw, 'پشتیبان داده خراب یا ناسازگار قبل از بازنشانی امن');
    window.localStorage.setItem(MIGRATION_ERROR_STORAGE_KEY, raw);
    window.localStorage.removeItem(PROJECT_STORAGE_KEY);
    return {
      ok: false,
      migrated: false,
      messageFa: `داده ذخیره‌شده خراب بود و برای جلوگیری از خرابی برنامه کنار گذاشته شد: ${error instanceof Error ? error.message : 'خطای نامشخص'}`
    };
  }
}

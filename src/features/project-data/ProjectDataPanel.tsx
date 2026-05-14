import { useRef, useState } from 'react';
import { AccessibleModal } from '../../components/AccessibleModal';
import { Icon } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import {
  clearMigrationError,
  deleteProjectBackup,
  downloadTextFile,
  exportBackupJson,
  getMigrationErrorRaw,
  importProjectFromJson,
  readProjectBackups,
  restoreProjectBackup,
  serializeProjectForExport
} from '../../migrations/storageSafety';
import type { ProjectBackup } from '../../migrations/projectMigration';

type ProjectDataConfirmation =
  | { type: 'reset-project' }
  | { type: 'restore-backup'; backupId: string }
  | { type: 'start-safe' };

function formatDateFa(value?: string) {
  if (!value) return 'نامشخص';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'نامعتبر';
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function ProjectDataPanel() {
  const project = useLabStore((state) => state.project);
  const replaceProject = useLabStore((state) => state.replaceProject);
  const resetProject = useLabStore((state) => state.resetProject);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageFa, setMessageFa] = useState<string>();
  const [backups, setBackups] = useState<ProjectBackup[]>(() => readProjectBackups());
  const [corruptedRaw, setCorruptedRaw] = useState<string | undefined>(() => getMigrationErrorRaw());
  const [confirmation, setConfirmation] = useState<ProjectDataConfirmation>();

  const refreshBackups = () => {
    setBackups(readProjectBackups());
    setCorruptedRaw(getMigrationErrorRaw());
  };

  const exportProject = () => {
    const filename = `kia-electric-lab-schema-${project.schemaVersion}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadTextFile(filename, serializeProjectForExport(project));
    setMessageFa('خروجی JSON پروژه آماده شد.');
  };

  const importFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? '');
      const result = importProjectFromJson(raw);
      if (result.ok && result.project) {
        replaceProject(result.project);
        setMessageFa(result.messageFa);
      } else {
        setMessageFa(result.messageFa);
      }
      refreshBackups();
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const restoreBackup = (backupId: string) => {
    const result = restoreProjectBackup(backupId);
    if (result.ok && result.project) {
      replaceProject(result.project);
      setMessageFa('پشتیبان انتخاب‌شده با مهاجرت امن بازیابی شد.');
    } else {
      setMessageFa(result.messageFa);
    }
    refreshBackups();
  };

  const runConfirmation = () => {
    if (!confirmation) return;
    if (confirmation.type === 'restore-backup') restoreBackup(confirmation.backupId);
    if (confirmation.type === 'reset-project' || confirmation.type === 'start-safe') resetProject();
    setConfirmation(undefined);
  };

  const confirmationTitle =
    confirmation?.type === 'restore-backup'
      ? 'بازیابی پشتیبان'
      : confirmation?.type === 'start-safe'
        ? 'شروع امن'
        : 'بازنشانی پروژه آموزشی';

  const confirmationDescription =
    confirmation?.type === 'restore-backup'
      ? 'پروژه فعلی با پشتیبان انتخاب‌شده جایگزین می‌شود.'
      : 'پروژه فعلی به حالت آموزشی اولیه برمی‌گردد.';

  const deleteBackup = (backupId: string) => {
    deleteProjectBackup(backupId);
    setMessageFa('پشتیبان انتخاب‌شده حذف شد.');
    refreshBackups();
  };

  const exportBackup = (backupId: string) => {
    const raw = exportBackupJson(backupId);
    if (!raw) {
      setMessageFa('این پشتیبان پیدا نشد.');
      return;
    }
    downloadTextFile(`kia-electric-lab-backup-${new Date().toISOString().slice(0, 10)}.json`, raw);
    setMessageFa('فایل JSON پشتیبان آماده شد.');
  };

  const exportCorrupted = () => {
    if (!corruptedRaw) return;
    downloadTextFile(`kia-electric-lab-corrupted-${new Date().toISOString().slice(0, 10)}.json`, corruptedRaw);
    clearMigrationError();
    setCorruptedRaw(undefined);
    setMessageFa('داده خراب برای بررسی مهندسی خروجی گرفته شد.');
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" data-testid="project-data-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">داده‌های پروژه</h2>
          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">نسخه ساختار، پشتیبان، ورود و خروج JSON</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon name="Database" className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-950">
          <span className="text-slate-500 dark:text-slate-400">Schema</span>
          <strong>{project.schemaVersion.toLocaleString('fa-IR')}</strong>
        </div>
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-950">
          <span className="text-slate-500 dark:text-slate-400">App</span>
          <strong dir="ltr" className="text-xs">{project.appVersion}</strong>
        </div>
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-950">
          <span className="text-slate-500 dark:text-slate-400">آخرین ذخیره</span>
          <strong className="text-xs">{formatDateFa(project.updatedAt)}</strong>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={exportProject} className="inline-flex items-center justify-center gap-2 rounded-md bg-tealish px-3 py-2 text-sm font-bold text-white">
          <Icon name="Download" className="h-4 w-4" />
          خروجی
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <Icon name="Upload" className="h-4 w-4" />
          ورود
        </button>
        <button onClick={() => setConfirmation({ type: 'reset-project' })} data-testid="project-data-reset-button" className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          <Icon name="RefreshCcw" className="h-4 w-4" />
          بازنشانی پروژه آموزشی
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => importFile(event.target.files?.[0])} />

      {messageFa && (
        <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm leading-6 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100">
          {messageFa}
        </div>
      )}

      {corruptedRaw && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          داده ذخیره‌شده قبلی ناسازگار بوده و کنار گذاشته شده است.
          <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={exportCorrupted} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-600 px-3 py-2 text-white">
            <Icon name="FileJson" className="h-4 w-4" />
            خروجی داده خراب
          </button>
          <button onClick={() => setConfirmation({ type: 'start-safe' })} className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-amber-700 px-3 py-2">
            <Icon name="RefreshCcw" className="h-4 w-4" />
            شروع امن
          </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <strong>پشتیبان‌ها</strong>
          <button onClick={refreshBackups} className="text-xs text-tealish">به‌روزرسانی</button>
        </div>
        <div className="max-h-44 space-y-2 overflow-auto">
          {backups.length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-950 dark:text-slate-400">هنوز پشتیبانی ثبت نشده است.</p>
          ) : (
            backups.map((backup) => (
              <div key={backup.id} className="rounded-md border border-slate-200 p-2 text-xs dark:border-slate-800">
                <div className="font-bold">{backup.reasonFa}</div>
                <div className="mt-1 text-slate-500 dark:text-slate-400">{formatDateFa(backup.createdAt)}</div>
                <div className="mt-1 text-slate-500 dark:text-slate-400">Schema: {backup.schemaVersion?.toLocaleString('fa-IR') ?? 'نامشخص'}</div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  <button onClick={() => setConfirmation({ type: 'restore-backup', backupId: backup.id })} data-testid={`restore-backup-${backup.id}`} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700">بازیابی</button>
                  <button onClick={() => exportBackup(backup.id)} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700">خروجی</button>
                  <button onClick={() => deleteBackup(backup.id)} className="rounded-md border border-rose-200 px-2 py-1 text-rose-700 dark:border-rose-900 dark:text-rose-200">حذف</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <AccessibleModal
        open={Boolean(confirmation)}
        title={confirmationTitle}
        description={confirmationDescription}
        variant={confirmation?.type === 'restore-backup' ? 'warning' : 'danger'}
        confirmTone={confirmation?.type === 'restore-backup' ? 'primary' : 'danger'}
        confirmLabel={confirmation?.type === 'restore-backup' ? 'بازیابی' : 'بازنشانی'}
        onCancel={() => setConfirmation(undefined)}
        onConfirm={runConfirmation}
        testId="project-data-confirmation-modal"
      >
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">این کار فقط بعد از تایید انجام می‌شود. قبل از تایید مطمئن شو خروجی یا پشتیبان لازم را داری.</p>
      </AccessibleModal>
    </section>
  );
}

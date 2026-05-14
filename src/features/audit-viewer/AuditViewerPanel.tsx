import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { downloadTextFile } from '../../migrations/storageSafety';
import { useLabStore } from '../../store/useLabStore';
import type { ApplyAuditAction, ApplyAuditEntry } from '../../types/electrical';

const EMPTY_AUDIT_LOG: ApplyAuditEntry[] = [];

const actionLabels: Record<ApplyAuditAction | 'all', string> = {
  all: 'همه',
  replace: 'جایگزینی پروژه',
  append: 'افزودن به پروژه',
  'save-example': 'ذخیره نمونه',
  'import-example': 'ورود نمونه',
  'restore-example': 'باز کردن نمونه'
};

function formatDateFa(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'زمان نامعتبر';
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function AuditViewerPanel() {
  const auditLog = useLabStore((state) => state.project.applyAuditLog ?? EMPTY_AUDIT_LOG);
  const [action, setAction] = useState<ApplyAuditAction | 'all'>('all');
  const filtered = useMemo(() => (action === 'all' ? auditLog : auditLog.filter((entry) => entry.action === action)), [action, auditLog]);

  const exportAudit = () => {
    downloadTextFile(`kia-electric-lab-audit-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(auditLog, null, 2));
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" data-testid="audit-viewer">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">تاریخچه اعمال</h2>
          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">ثبت ۵۰ اقدام آخر sandbox و نمونه‌ها برای اعتماد و پیگیری</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon name="History" className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <select
          value={action}
          onChange={(event) => setAction(event.target.value as ApplyAuditAction | 'all')}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          aria-label="فیلتر نوع اقدام"
          data-testid="audit-action-filter"
        >
          {Object.entries(actionLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button onClick={exportAudit} data-testid="audit-export-button" className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <Icon name="Download" className="h-4 w-4" />
          JSON
        </button>
      </div>

      <div className="mt-4 max-h-80 space-y-2 overflow-auto">
        {filtered.length === 0 ? (
          <div className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-500 dark:bg-slate-950 dark:text-slate-400" data-testid="audit-empty-state">
            هنوز رویدادی برای این فیلتر ثبت نشده است. بعد از اعمال sandbox، ورود نمونه یا بازیابی نمونه، اینجا تاریخچه را می‌بینی.
          </div>
        ) : (
          filtered.slice(0, 50).map((entry) => (
            <article key={entry.id} className="rounded-md border border-slate-200 p-3 text-xs leading-6 dark:border-slate-800" data-testid="audit-entry" data-action={entry.action}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong className="text-sm">{actionLabels[entry.action]}</strong>
                  <div className="text-slate-500 dark:text-slate-400">{entry.lessonTitle ?? entry.lessonId ?? 'بدون درس'}</div>
                </div>
                <span className="text-slate-500 dark:text-slate-400">{formatDateFa(entry.timestamp)}</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                <div className="rounded bg-slate-50 p-1 dark:bg-slate-950"><strong>{entry.affectedCounts.circuits.toLocaleString('fa-IR')}</strong><div>مدار</div></div>
                <div className="rounded bg-slate-50 p-1 dark:bg-slate-950"><strong>{entry.affectedCounts.components.toLocaleString('fa-IR')}</strong><div>قطعه</div></div>
                <div className="rounded bg-slate-50 p-1 dark:bg-slate-950"><strong>{entry.affectedCounts.wires.toLocaleString('fa-IR')}</strong><div>سیم</div></div>
                <div className="rounded bg-slate-50 p-1 dark:bg-slate-950"><strong>{entry.diagnosticsCount.toLocaleString('fa-IR')}</strong><div>عیب</div></div>
              </div>
              {(entry.checksumStatus || entry.sourceCompatibility) && (
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  checksum: {entry.checksumStatus ?? 'نامشخص'} | سازگاری: {entry.sourceCompatibility ?? 'نامشخص'}
                </p>
              )}
              {entry.userNotes && <p className="mt-2">یادداشت: {entry.userNotes}</p>}
              {entry.warningsFa?.map((warning) => <p key={warning} className="mt-1 text-amber-700 dark:text-amber-300">{warning}</p>)}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

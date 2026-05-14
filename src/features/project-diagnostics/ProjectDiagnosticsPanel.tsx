import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { diagnoseProject, type DiagnosticCategory, type DiagnosticIssue, type DiagnosticSeverity } from '../../diagnostics/diagnosticsEngine';
import { repairProject } from '../../diagnostics/repairEngine';
import { downloadTextFile } from '../../migrations/storageSafety';
import { useLabStore } from '../../store/useLabStore';

const categoryLabels: Record<DiagnosticCategory | 'all', string> = {
  all: 'همه',
  schema: 'ساختار',
  component: 'قطعه',
  circuit: 'مدار',
  wire: 'سیم',
  terminal: 'ترمینال',
  panelboard: 'تابلو',
  cost: 'هزینه',
  storage: 'ذخیره'
};

const severityLabels: Record<DiagnosticSeverity, string> = {
  info: 'اطلاع',
  warning: 'هشدار',
  error: 'خطا',
  critical: 'بحرانی'
};

const severityClass: Record<DiagnosticSeverity, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
  error: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100',
  critical: 'border-red-300 bg-red-100 text-red-950 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
};

function IssueCard({ issue }: { issue: DiagnosticIssue }) {
  return (
    <div className={`rounded-md border p-3 text-sm leading-6 ${severityClass[issue.severity]}`}>
      <div className="flex items-center justify-between gap-2">
        <strong>{issue.titleFa}</strong>
        <span className="rounded bg-white/50 px-2 py-0.5 text-xs dark:bg-black/20">{severityLabels[issue.severity]}</span>
      </div>
      <p className="mt-2">{issue.explanationFa}</p>
      <p className="mt-2 text-xs opacity-90">پیشنهاد: {issue.recommendedRepairFa}</p>
      <p className="mt-1 text-xs opacity-80">دسته: {categoryLabels[issue.category]} | {issue.safeAutoRepair ? 'قابل اصلاح خودکار امن' : 'نیازمند تصمیم دستی'}</p>
    </div>
  );
}

export function ProjectDiagnosticsPanel() {
  const project = useLabStore((state) => state.project);
  const replaceProject = useLabStore((state) => state.replaceProject);
  const report = useMemo(() => diagnoseProject(project), [project]);
  const [category, setCategory] = useState<DiagnosticCategory | 'all'>('all');
  const [messageFa, setMessageFa] = useState<string>();

  const filteredIssues = category === 'all' ? report.issues : report.issues.filter((issue) => issue.category === category);
  const safeIssues = report.issues.filter((issue) => issue.safeAutoRepair);

  const repairSafeIssues = () => {
    const result = repairProject(project, safeIssues.map((issue) => issue.id));
    replaceProject(result.project);
    setMessageFa(result.logs.length ? `${result.logs.length.toLocaleString('fa-IR')} اصلاح امن انجام شد.` : 'مورد امنی برای اصلاح خودکار پیدا نشد.');
  };

  const exportReport = () => {
    downloadTextFile(`kia-electric-lab-diagnostics-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(report, null, 2));
    setMessageFa('گزارش عیب‌یابی JSON آماده شد.');
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">عیب‌یابی پروژه</h2>
          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">بررسی داده‌ها، ارجاع‌ها، سیم‌ها، تابلو و ذخیره‌سازی</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon name="ClipboardList" className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {(['critical', 'error', 'warning', 'info'] as DiagnosticSeverity[]).map((severity) => (
          <div key={severity} className={`rounded-md border px-2 py-2 ${severityClass[severity]}`}>
            <div className="font-black">{report.counts[severity].toLocaleString('fa-IR')}</div>
            <div>{severityLabels[severity]}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={repairSafeIssues} className="inline-flex items-center justify-center gap-2 rounded-md bg-tealish px-3 py-2 text-sm font-bold text-white">
          <Icon name="ShieldCheck" className="h-4 w-4" />
          اصلاح امن
        </button>
        <button onClick={exportReport} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <Icon name="Download" className="h-4 w-4" />
          گزارش JSON
        </button>
      </div>

      {messageFa && (
        <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm leading-6 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100">
          {messageFa}
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">فیلتر دسته</label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as DiagnosticCategory | 'all')}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 max-h-96 space-y-3 overflow-auto">
        {filteredIssues.length === 0 ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            مشکلی در این دسته پیدا نشد.
          </div>
        ) : (
          filteredIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </section>
  );
}

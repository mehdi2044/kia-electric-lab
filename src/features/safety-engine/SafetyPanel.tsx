import { Icon } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import { generateSafetyWarnings } from './safetyEngine';

export function SafetyPanel() {
  const project = useLabStore((state) => state.project);
  const warnings = generateSafetyWarnings(project);

  const styles = {
    danger: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100',
    warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
    info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100'
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">بازخورد آموزشی ایمنی</h2>
      <div className="mt-3 space-y-2">
        {warnings.length ? (
          warnings.map((warning) => (
            <article key={warning.id} className={`rounded-lg border p-3 ${styles[warning.severity]}`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Icon name="AlertTriangle" className="h-4 w-4" />
                {warning.titleFa}
              </div>
              <p className="mt-2 text-sm leading-7">{warning.messageFa}</p>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            در این مدل آموزشی هشدار جدی دیده نشد.
          </div>
        )}
      </div>
    </section>
  );
}

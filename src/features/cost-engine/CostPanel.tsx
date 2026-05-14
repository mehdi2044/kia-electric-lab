import { useLabStore } from '../../store/useLabStore';
import { formatToman } from '../../utils/format';
import { calculateProjectCost } from './costEngine';

export function CostPanel() {
  const project = useLabStore((state) => state.project);
  const cost = calculateProjectCost(project);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">برآورد اقتصادی</h2>
      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between rounded-md bg-slate-50 p-3 dark:bg-slate-900">
          <span>هزینه مصالح</span>
          <strong>{formatToman(cost.materialCost)}</strong>
        </div>
        <div className="flex justify-between rounded-md bg-slate-50 p-3 dark:bg-slate-900">
          <span>هزینه اجرا</span>
          <strong>{formatToman(cost.laborCost)}</strong>
        </div>
        <div className="flex justify-between rounded-md bg-teal-50 p-3 text-teal-950 dark:bg-teal-950 dark:text-teal-100">
          <span>جمع کل پروژه</span>
          <strong>{formatToman(cost.totalCost)}</strong>
        </div>
        {cost.overdesignCost > 0 ? (
          <div className="rounded-md bg-amber-50 p-3 text-sm leading-7 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            حدود {formatToman(cost.overdesignCost)} هزینه اضافه به دلیل انتخاب گران‌تر از نیاز دیده می‌شود.
          </div>
        ) : null}
      </div>
    </section>
  );
}

import { useMemo } from 'react';
import { StatCard } from '../../components/StatCard';
import { useLabStore } from '../../store/useLabStore';
import { formatNumber, formatToman } from '../../utils/format';
import { calculateCircuitLoad } from '../safety-engine/electricalMath';
import { generateProjectReport } from './reportEngine';

export function ReportPanel() {
  const project = useLabStore((state) => state.project);
  const report = useMemo(() => generateProjectReport(project), [project]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">گزارش نهایی آموزشی</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard label="امتیاز ایمنی" value={report.scores.safety.toLocaleString('fa-IR')} tone={report.scores.safety > 75 ? 'good' : report.scores.safety > 45 ? 'warn' : 'danger'} />
        <StatCard label="امتیاز فنی" value={report.scores.technical.toLocaleString('fa-IR')} tone={report.scores.technical > 75 ? 'good' : 'warn'} />
        <StatCard label="امتیاز اقتصادی" value={report.scores.economic.toLocaleString('fa-IR')} tone={report.scores.economic > 75 ? 'good' : 'warn'} />
        <StatCard label="امتیاز یادگیری" value={report.scores.learning.toLocaleString('fa-IR')} tone="good" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <h3 className="text-sm font-bold">خلاصه بار و هزینه</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>توان کل</dt><dd>{formatNumber(report.totalWattage)} وات</dd></div>
            <div className="flex justify-between"><dt>جریان کل</dt><dd>{formatNumber(report.totalAmpere, 2)} آمپر</dd></div>
            <div className="flex justify-between"><dt>مصالح</dt><dd>{formatToman(report.materialCost)}</dd></div>
            <div className="flex justify-between"><dt>اجرت</dt><dd>{formatToman(report.laborCost)}</dd></div>
            <div className="flex justify-between font-bold"><dt>کل</dt><dd>{formatToman(report.totalCost)}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <h3 className="text-sm font-bold">مصرف سیم</h3>
          <div className="mt-3 space-y-2 text-sm">
            {Object.entries(report.wireUsageBySize).map(([size, meters]) => (
              <div key={size} className="flex justify-between rounded-md bg-slate-50 p-2 dark:bg-slate-900">
                <span>{size}</span>
                <span>{meters.toLocaleString('fa-IR')} متر</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <h3 className="text-sm font-bold">لیست مدارها و فیوزها</h3>
        <div className="mt-3 overflow-auto">
          <table className="w-full min-w-[620px] text-right text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">مدار</th>
                <th>توان</th>
                <th>جریان</th>
                <th>سیم</th>
                <th>فیوز</th>
                <th>هزینه</th>
              </tr>
            </thead>
            <tbody>
              {report.circuits.map((circuit) => {
                const load = calculateCircuitLoad(circuit);
                return (
                  <tr key={circuit.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2 font-semibold">{circuit.nameFa}</td>
                    <td>{formatNumber(load.totalWattage)} وات</td>
                    <td>{formatNumber(load.totalCurrent, 2)} آمپر</td>
                    <td>{circuit.wireSizeMm2} mm²</td>
                    <td>{circuit.breakerAmp} آمپر</td>
                    <td>{formatToman(report.costByCircuit[circuit.id] ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <h3 className="text-sm font-bold">پیشنهادهای اقتصادی</h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {(report.economicSuggestions.length ? report.economicSuggestions : ['در این مرحله هزینه اضافه واضحی دیده نشد.']).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <h3 className="text-sm font-bold">اصلاحات پیشنهادی</h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {(report.recommendedCorrections.length ? report.recommendedCorrections : ['طرح فعلی در مدل آموزشی مشکل مهمی ندارد.']).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

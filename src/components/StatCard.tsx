import type { ReactNode } from 'react';

export function StatCard({ label, value, hint, tone = 'neutral' }: { label: string; value: ReactNode; hint?: string; tone?: 'neutral' | 'good' | 'warn' | 'danger' }) {
  const toneClass = {
    neutral: 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
    warn: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
    danger: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100'
  }[tone];

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClass}`}>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint ? <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</div> : null}
    </div>
  );
}

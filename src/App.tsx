import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AccessibleModal } from './components/AccessibleModal';
import { Icon } from './components/Icon';
import { StatCard } from './components/StatCard';
import { ApplianceLibrary } from './features/appliance-library/ApplianceLibrary';
import { CircuitBuilder } from './features/circuit-builder/CircuitBuilder';
import { CostPanel } from './features/cost-engine/CostPanel';
import { FloorPlan } from './features/floor-plan/FloorPlan';
import { ReportPanel } from './features/report-engine/ReportPanel';
import { generateProjectReport } from './features/report-engine/reportEngine';
import { SafetyPanel } from './features/safety-engine/SafetyPanel';
import { WireRoutingPanel } from './features/wire-routing/WireRoutingPanel';
import { PanelboardPanel } from './features/panelboard/PanelboardPanel';
import { useLabStore } from './store/useLabStore';
import { formatNumber, formatToman } from './utils/format';

const LessonPanel = lazy(() => import('./features/lesson-mode/LessonPanel').then((module) => ({ default: module.LessonPanel })));
const ProjectDataPanel = lazy(() => import('./features/project-data/ProjectDataPanel').then((module) => ({ default: module.ProjectDataPanel })));
const ProjectDiagnosticsPanel = lazy(() => import('./features/project-diagnostics/ProjectDiagnosticsPanel').then((module) => ({ default: module.ProjectDiagnosticsPanel })));
const AuditViewerPanel = lazy(() => import('./features/audit-viewer/AuditViewerPanel').then((module) => ({ default: module.AuditViewerPanel })));

function PanelLoading({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      {label} در حال آماده‌سازی است...
    </div>
  );
}

export function App() {
  const project = useLabStore((state) => state.project);
  const darkMode = useLabStore((state) => state.darkMode);
  const setDarkMode = useLabStore((state) => state.setDarkMode);
  const resetProject = useLabStore((state) => state.resetProject);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const report = useMemo(() => generateProjectReport(project), [project]);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'fa';
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const overMain = report.totalAmpere > project.mainBreakerAmp;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-tealish p-2 text-white">
                <Icon name="Zap" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-normal">Kia Electric Lab</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">آزمایشگاه آموزشی سیم‌کشی خانه، با محاسبه بار، ایمنی و هزینه</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              title="تغییر حالت روشن و تاریک"
            >
              <Icon name={darkMode ? 'Sun' : 'Moon'} className="h-4 w-4" />
              {darkMode ? 'روشن' : 'تاریک'}
            </button>
            <button
              onClick={() => setResetModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              title="بازنشانی پروژه نمونه"
              data-testid="header-reset-project-button"
            >
              <Icon name="RefreshCcw" className="h-4 w-4" />
              بازنشانی
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-5">
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          این نرم‌افزار فقط برای آموزش است و نباید برای طراحی حرفه‌ای، اجرا یا تایید سیم‌کشی واقعی استفاده شود.
        </div>

        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <StatCard label="توان کل خانه" value={`${formatNumber(report.totalWattage)} وات`} hint="جمع توان وسایل موازی" />
          <StatCard label="جریان کل" value={`${formatNumber(report.totalAmpere, 2)} آمپر`} hint="I = P / 220" tone={overMain ? 'danger' : 'good'} />
          <StatCard label="حد فیوز اصلی" value={`${project.mainBreakerAmp.toLocaleString('fa-IR')} آمپر`} hint="حد آموزشی خانه: ۵۵۰۰ وات" tone={overMain ? 'danger' : 'neutral'} />
          <StatCard label="هزینه کل" value={formatToman(report.totalCost)} hint="مصالح + اجرت" />
        </section>

        <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)_380px]">
          <ApplianceLibrary />
          <div className="space-y-5">
            <Suspense fallback={<PanelLoading label="درس‌های کیارش" />}>
              <LessonPanel />
            </Suspense>
            <FloorPlan />
            <WireRoutingPanel />
            <PanelboardPanel />
            <CircuitBuilder />
            <ReportPanel />
          </div>
          <div className="space-y-5">
            <Suspense fallback={<PanelLoading label="داده‌های پروژه" />}>
              <ProjectDataPanel />
            </Suspense>
            <Suspense fallback={<PanelLoading label="تاریخچه اعمال" />}>
              <AuditViewerPanel />
            </Suspense>
            <div id="project-diagnostics-panel">
              <Suspense fallback={<PanelLoading label="عیب‌یابی پروژه" />}>
                <ProjectDiagnosticsPanel />
              </Suspense>
            </div>
            <SafetyPanel />
            <CostPanel />
          </div>
        </div>
      </div>
      <AccessibleModal
        open={resetModalOpen}
        title="بازنشانی پروژه آموزشی"
        description="این کار پروژه فعلی را به نمونه اولیه برمی‌گرداند."
        variant="danger"
        confirmTone="danger"
        confirmLabel="بازنشانی"
        onCancel={() => setResetModalOpen(false)}
        onConfirm={() => {
          resetProject();
          setResetModalOpen(false);
        }}
        testId="reset-project-modal"
      >
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">اگر در sandbox یا پروژه اصلی تغییر ذخیره‌نشده داری، قبل از تایید مطمئن شو که لازم نیست نگهش داری.</p>
      </AccessibleModal>
    </main>
  );
}

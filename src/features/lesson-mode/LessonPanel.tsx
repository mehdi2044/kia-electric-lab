import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import { calculateProgressPercent, getLessonAttempt } from './lessonProgress';
import { getStepGuidance, lessons } from './lessonEngine';
import { validateLesson } from './lessonValidation';
import { createSandboxApplyPreview, generateLessonHighlight, importLessonExampleJson, type SandboxApplySummary } from './lessonSandbox';
import { downloadTextFile } from '../../migrations/storageSafety';
import { serializeLessonExampleExport } from '../../migrations/exportIntegrity';
import type { LessonSandboxApplyMode } from '../../types/electrical';

const difficultyLabels = {
  beginner: 'شروع',
  intermediate: 'متوسط',
  advanced: 'چالشی'
};

function scoreTone(score?: number) {
  if (score === undefined) return 'text-slate-500';
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-300';
  if (score >= 65) return 'text-amber-600 dark:text-amber-300';
  return 'text-rose-600 dark:text-rose-300';
}

export function LessonPanel() {
  const project = useLabStore((state) => state.project);
  const lessonSandbox = useLabStore((state) => state.lessonSandbox);
  const setActiveLesson = useLabStore((state) => state.setActiveLesson);
  const useLessonHint = useLabStore((state) => state.useLessonHint);
  const recordLessonValidation = useLabStore((state) => state.recordLessonValidation);
  const resetCurrentLessonWiring = useLabStore((state) => state.resetCurrentLessonWiring);
  const startLessonSandbox = useLabStore((state) => state.startLessonSandbox);
  const resetLessonSandbox = useLabStore((state) => state.resetLessonSandbox);
  const exitLessonSandbox = useLabStore((state) => state.exitLessonSandbox);
  const applyLessonSandboxToMainProject = useLabStore((state) => state.applyLessonSandboxToMainProject);
  const saveSandboxAsExample = useLabStore((state) => state.saveSandboxAsExample);
  const deleteLessonExample = useLabStore((state) => state.deleteLessonExample);
  const loadLessonExample = useLabStore((state) => state.loadLessonExample);
  const renameLessonExample = useLabStore((state) => state.renameLessonExample);
  const importLessonExample = useLabStore((state) => state.importLessonExample);
  const activeLessonId = project.lessonProgress?.lastActiveLessonId ?? lessons[0].id;
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const attempt = getLessonAttempt(project, activeLesson.id);
  const progressPercent = calculateProgressPercent(project.lessonProgress);
  const [hintIndex, setHintIndex] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [applyMode, setApplyMode] = useState<LessonSandboxApplyMode>('append');
  const [exampleTitle, setExampleTitle] = useState('');
  const [applyMessageFa, setApplyMessageFa] = useState<string>();
  const [applyResult, setApplyResult] = useState<{
    mode: LessonSandboxApplyMode;
    summary: SandboxApplySummary;
    diagnosticsCount: number;
    warningsFa: string[];
  }>();
  const [applyPreviewOpen, setApplyPreviewOpen] = useState(false);
  const [exampleImportMessageFa, setExampleImportMessageFa] = useState<string>();
  const cancelApplyButtonRef = useRef<HTMLButtonElement>(null);
  const confirmApplyButtonRef = useRef<HTMLButtonElement>(null);
  const validationPreview = useMemo(() => validateLesson(project, activeLesson.id, attempt.hintsUsed), [project, activeLesson.id, attempt.hintsUsed]);
  const currentStepIndex = Math.min(validationPreview.completedStepIds.length, activeLesson.steps.length - 1);
  const currentGuidance = getStepGuidance(activeLesson.id, currentStepIndex);
  const highlight = useMemo(() => generateLessonHighlight(project, activeLesson.id, currentStepIndex), [project, activeLesson.id, currentStepIndex]);

  const requestHint = () => {
    useLessonHint(activeLesson.id);
    setHintIndex((value) => Math.min(value + 1, activeLesson.hintsFa.length - 1));
  };

  const validate = () => {
    const result = validateLesson(project, activeLesson.id, attempt.hintsUsed);
    recordLessonValidation(activeLesson.id, result.passed, result.score, result.feedbackFa.join(' '));
    setFeedback(result.feedbackFa);
  };

  const sandboxCounts = lessonSandbox
    ? {
        circuits: project.circuits.length,
        components: project.components.filter((component) => component.type !== 'main-panel').length,
        wires: (project.wires ?? []).length
      }
    : { circuits: 0, components: 0, wires: 0 };

  const applyPreview = lessonSandbox ? createSandboxApplyPreview({ ...lessonSandbox, sandboxProject: project }, applyMode) : undefined;

  useEffect(() => {
    if (!applyPreviewOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    cancelApplyButtonRef.current?.focus();
    return () => previousFocus?.focus();
  }, [applyPreviewOpen]);

  const handleApplyModalKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setApplyPreviewOpen(false);
      return;
    }
    if (event.key === 'Enter') {
      if (document.activeElement === confirmApplyButtonRef.current) {
        event.preventDefault();
        applySandbox();
      }
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [cancelApplyButtonRef.current, confirmApplyButtonRef.current].filter((item): item is HTMLButtonElement => Boolean(item));
    if (!focusable.length) return;
    const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.shiftKey
      ? currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1
      : currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
    event.preventDefault();
    focusable[nextIndex]?.focus();
  };

  const applySandbox = () => {
    const preview = applyPreview;
    const result = applyLessonSandboxToMainProject(applyMode, exampleTitle || activeLesson.titleFa);
    setApplyPreviewOpen(false);
    setApplyResult({
      mode: applyMode,
      summary: result?.summary ?? preview?.summary ?? { circuits: 0, components: 0, wires: 0 },
      diagnosticsCount: result?.diagnostics.issueCount ?? preview?.diagnostics.issueCount ?? 0,
      warningsFa: [...(result?.warningsFa ?? []), ...(result?.layoutWarningsFa ?? [])]
    });
    if (applyMode === 'save-example') {
      setApplyMessageFa('نمونه درس ذخیره شد و پروژه اصلی تغییر نکرد.');
      return;
    }
    setApplyMessageFa(result?.diagnostics.issueCount ? `اعمال انجام شد، اما ${result.diagnostics.issueCount.toLocaleString('fa-IR')} مورد عیب‌یابی برای بررسی وجود دارد.` : 'اعمال با موفقیت انجام شد و عیب ساختاری مهمی پیدا نشد.');
  };

  const importExampleFile = (file?: File) => {
    if (!file || !lessonSandbox) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importLessonExampleJson(String(reader.result ?? ''));
      if (result.ok && result.example) {
        importLessonExample(result.example, {
          checksumStatus: result.checksumStatus,
          sourceCompatibility: result.sourceCompatibility,
          warningsFa: result.warningsFa
        });
        setExampleImportMessageFa(result.warningsFa.length ? `نمونه وارد شد، اما: ${result.warningsFa.join(' ')}` : 'نمونه درس با checksum معتبر وارد شد.');
        setApplyResult({
          mode: 'save-example',
          summary: {
            circuits: result.example.projectSnapshot.circuits.length,
            components: result.example.projectSnapshot.components.filter((component) => component.type !== 'main-panel').length,
            wires: (result.example.projectSnapshot.wires ?? []).length
          },
          diagnosticsCount: 0,
          warningsFa: result.warningsFa
        });
      } else {
        setExampleImportMessageFa(result.errorFa ?? 'نمونه درس قابل ورود نیست.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">درس‌های کیارش</h2>
          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">ماموریت‌های مرحله‌به‌مرحله برای یادگیری سیم‌کشی آموزشی</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon name="BookOpen" className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>پیشرفت کل</span>
          <span>{progressPercent.toLocaleString('fa-IR')}٪</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-2 rounded-full bg-tealish" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className={`mb-4 rounded-md border p-3 text-sm leading-7 ${lessonSandbox ? 'border-teal-200 bg-teal-50 text-teal-950 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-100' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'}`}>
        {lessonSandbox ? (
          <div>
            <div className="font-bold">حالت sandbox فعال است؛ پروژه اصلی دست‌نخورده نگه داشته شده.</div>
            <div className="mt-1 text-xs">شروع: {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(lessonSandbox.startedAt))}</div>
          </div>
        ) : (
          <div>برای تمرین امن، درس را داخل sandbox شروع کن. تغییرها تا وقتی خودت تایید نکنی روی پروژه اصلی اعمال نمی‌شود.</div>
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="max-h-80 space-y-2 overflow-auto">
          {lessons.map((lesson, index) => {
            const completed = project.lessonProgress?.completedLessonIds.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => {
                  if (lessonSandbox) {
                    startLessonSandbox(lesson.id);
                  } else {
                    setActiveLesson(lesson.id);
                  }
                  setFeedback([]);
                  setHintIndex(0);
                }}
                className={`w-full rounded-md border p-2 text-right text-sm ${
                  lesson.id === activeLesson.id
                    ? 'border-tealish bg-teal-50 dark:bg-teal-950'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{index + 1}. {lesson.titleFa}</span>
                  {completed && <Icon name="CheckCircle2" className="h-4 w-4 text-emerald-600" />}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{difficultyLabels[lesson.difficulty]}</div>
              </button>
            );
          })}
        </div>

        <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold">{activeLesson.titleFa}</h3>
              <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">{activeLesson.targetBehaviorFa}</p>
            </div>
            {attempt.completed && <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">کامل شده</span>}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => startLessonSandbox(activeLesson.id)} className="inline-flex items-center justify-center gap-2 rounded-md bg-tealish px-3 py-2 text-sm font-bold text-white">
              <Icon name="BookOpen" className="h-4 w-4" />
              {lessonSandbox ? 'شروع دوباره درس' : 'شروع درس'}
            </button>
            <button onClick={resetLessonSandbox} disabled={!lessonSandbox} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950">
              <Icon name="RefreshCcw" className="h-4 w-4" />
              ریست sandbox
            </button>
            <button onClick={exitLessonSandbox} disabled={!lessonSandbox} className="inline-flex items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 disabled:opacity-50 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
              خروج بدون اعمال
            </button>
            <button onClick={() => setApplyPreviewOpen(true)} disabled={!lessonSandbox} className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
              پیش‌نمایش اعمال
            </button>
          </div>

          <div className="mt-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
            <div className="font-bold">خروجی sandbox</div>
            <select
              value={applyMode}
              onChange={(event) => setApplyMode(event.target.value as LessonSandboxApplyMode)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="append">افزودن به پروژه اصلی</option>
              <option value="replace">جایگزینی کل پروژه اصلی</option>
              <option value="save-example">فقط ذخیره به عنوان نمونه</option>
            </select>
            <input
              value={exampleTitle}
              onChange={(event) => setExampleTitle(event.target.value)}
              placeholder="نام نمونه یا توضیح کوتاه"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              اثر انتخاب: {sandboxCounts.circuits.toLocaleString('fa-IR')} مدار، {sandboxCounts.components.toLocaleString('fa-IR')} قطعه، {sandboxCounts.wires.toLocaleString('fa-IR')} سیم.
            </p>
          </div>

          {applyMessageFa && (
            <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm leading-7 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100">
              {applyMessageFa}
            </div>
          )}

          {applyResult && (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-7 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
              <div className="flex items-center justify-between gap-2">
                <strong>گزارش نتیجه اعمال</strong>
                <span className="rounded-md bg-white/70 px-2 py-1 text-xs dark:bg-slate-900/70">
                  {applyResult.mode === 'append' ? 'افزودن' : applyResult.mode === 'replace' ? 'جایگزینی' : 'نمونه'}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-white/70 p-2 dark:bg-slate-900/70"><strong>{applyResult.summary.circuits.toLocaleString('fa-IR')}</strong><div>مدار</div></div>
                <div className="rounded-md bg-white/70 p-2 dark:bg-slate-900/70"><strong>{applyResult.summary.components.toLocaleString('fa-IR')}</strong><div>قطعه</div></div>
                <div className="rounded-md bg-white/70 p-2 dark:bg-slate-900/70"><strong>{applyResult.summary.wires.toLocaleString('fa-IR')}</strong><div>سیم</div></div>
              </div>
              <p className="mt-2">عیب‌یابی بعد از اعمال: {applyResult.diagnosticsCount.toLocaleString('fa-IR')} مورد</p>
              {applyResult.warningsFa.map((warning) => <p key={warning} className="text-amber-700 dark:text-amber-200">{warning}</p>)}
              <button
                onClick={() => document.getElementById('project-diagnostics-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="mt-2 rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-slate-950 dark:text-emerald-100"
              >
                باز کردن پنل عیب‌یابی
              </button>
            </div>
          )}

          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            {(['technical', 'safety', 'cost', 'learning'] as const).map((key) => (
              <div key={key} className="rounded-md bg-slate-50 px-2 py-2 dark:bg-slate-950">
                <div className={`font-black ${scoreTone(validationPreview.score[key])}`}>{validationPreview.score[key].toLocaleString('fa-IR')}</div>
                <div>{key === 'technical' ? 'فنی' : key === 'safety' ? 'ایمنی' : key === 'cost' ? 'هزینه' : 'یادگیری'}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <strong className="text-sm">مراحل</strong>
            <div className="mt-2 space-y-2">
              {activeLesson.steps.map((step) => {
                const checked = validationPreview.completedStepIds.includes(step.id);
                return (
                  <div key={step.id} className="flex items-start gap-2 rounded-md bg-slate-50 p-2 text-sm leading-6 dark:bg-slate-950">
                    <span className={`mt-1 h-4 w-4 rounded border ${checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-700'}`} />
                    <span>{step.textFa}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm leading-7 text-teal-950 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-100">
            <div className="font-bold">راهنمای قدم فعلی</div>
            <div>{highlight.messageFa}</div>
            <div className="mt-1 text-xs">اقدام مورد انتظار: {currentGuidance.expectedActionType} | {currentGuidance.validationHintFa}</div>
          </div>

          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-7 dark:bg-slate-950">
            {activeLesson.explanationFa}
          </div>

          <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm leading-7 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100">
            <div className="flex items-center gap-2 font-bold">
              <Icon name="HelpCircle" className="h-4 w-4" />
              راهنمایی
            </div>
            <p className="mt-1">{activeLesson.hintsFa[hintIndex]}</p>
          </div>

          {feedback.length > 0 && (
            <div className={`mt-3 rounded-md border p-3 text-sm leading-7 ${validationPreview.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' : 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100'}`}>
              {feedback.map((item) => <p key={item}>{item}</p>)}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={validate} className="inline-flex items-center justify-center gap-2 rounded-md bg-tealish px-3 py-2 text-sm font-bold text-white">
              <Icon name="CheckCircle2" className="h-4 w-4" />
              بررسی درس
            </button>
            <button onClick={requestHint} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              <Icon name="HelpCircle" className="h-4 w-4" />
              راهنمایی
            </button>
            <button onClick={resetCurrentLessonWiring} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
              <Icon name="RefreshCcw" className="h-4 w-4" />
              پاک کردن سیم‌های مدار انتخاب‌شده برای تمرین
            </button>
            <button onClick={() => saveSandboxAsExample(exampleTitle || activeLesson.titleFa)} disabled={!lessonSandbox} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950">
              ذخیره sandbox به عنوان مثال
            </button>
          </div>

          {lessonSandbox ? (
            <div className="mt-4 rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <div className="font-bold">نمونه‌های ذخیره‌شده</div>
              {lessonSandbox.savedExamples?.length ? (
                <div className="mt-2 max-h-56 space-y-2 overflow-auto">
                {lessonSandbox.savedExamples.map((example) => (
                  <div key={example.id} className="rounded-md bg-slate-50 p-2 text-xs leading-6 dark:bg-slate-950">
                    <div className="font-bold">{example.title}</div>
                    <div>{lessons.find((lesson) => lesson.id === example.lessonId)?.titleFa ?? example.lessonId}</div>
                    <div>{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(example.createdAt))}</div>
                    <div>
                      امتیاز: {example.score?.final?.toLocaleString('fa-IR') ?? 'ثبت نشده'} | مدار: {example.projectSnapshot.circuits.length.toLocaleString('fa-IR')} | سیم: {(example.projectSnapshot.wires ?? []).length.toLocaleString('fa-IR')}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      <button onClick={() => loadLessonExample(example.id)} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700">باز کردن</button>
                      <button
                        onClick={() => downloadTextFile(`kia-electric-lab-example-${example.id}.json`, serializeLessonExampleExport(example))}
                        className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700"
                      >
                        خروجی
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('این نمونه حذف شود؟')) deleteLessonExample(example.id);
                        }}
                        className="rounded-md border border-rose-200 px-2 py-1 text-rose-700 dark:border-rose-900 dark:text-rose-200"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      <button
                        onClick={() => {
                          const title = window.prompt('نام جدید نمونه', example.title);
                          if (title) renameLessonExample(example.id, title, example.notes);
                        }}
                        className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700"
                      >
                        تغییر نام
                      </button>
                      <button
                        onClick={() => {
                          const notes = window.prompt('یادداشت نمونه', example.notes ?? '');
                          if (notes !== null) renameLessonExample(example.id, example.title, notes);
                        }}
                        className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700"
                      >
                        یادداشت
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              ) : <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">هنوز نمونه‌ای ذخیره نشده است.</p>}
              <label className="mt-3 block rounded-md border border-slate-300 px-3 py-2 text-center text-xs dark:border-slate-700">
                ورود نمونه JSON
                <input type="file" accept="application/json,.json" className="hidden" onChange={(event) => importExampleFile(event.target.files?.[0])} />
              </label>
              {exampleImportMessageFa && <div className="mt-2 text-xs leading-6 text-sky-700 dark:text-sky-300">{exampleImportMessageFa}</div>}
            </div>
          ) : null}
        </div>
      </div>
      {applyPreviewOpen && applyPreview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setApplyPreviewOpen(false);
          }}
          onKeyDown={handleApplyModalKeyDown}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-preview-title"
            aria-describedby="apply-preview-description"
            className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 text-right shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 id="apply-preview-title" className="text-lg font-extrabold">پیش‌نمایش اعمال sandbox</h3>
            <p id="apply-preview-description" className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{applyPreview.whatWillHappenFa}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-950"><strong>{applyPreview.summary.circuits.toLocaleString('fa-IR')}</strong><div>مدار</div></div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-950"><strong>{applyPreview.summary.components.toLocaleString('fa-IR')}</strong><div>قطعه</div></div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-950"><strong>{applyPreview.summary.wires.toLocaleString('fa-IR')}</strong><div>سیم</div></div>
            </div>
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
              <strong>ریسک‌ها</strong>
              {applyPreview.risksFa.map((risk) => <p key={risk}>{risk}</p>)}
            </div>
            <div className="mt-3 rounded-md border border-slate-200 p-3 text-sm leading-7 dark:border-slate-800">
              عیب‌یابی پس از اعمال: {applyPreview.diagnostics.issueCount.toLocaleString('fa-IR')} مورد
              {applyPreview.diagnostics.issueCount > 0 ? <p className="text-amber-700 dark:text-amber-300">بعد از اعمال، پنل عیب‌یابی را بررسی کن.</p> : <p className="text-emerald-700 dark:text-emerald-300">مشکل ساختاری مهمی دیده نشد.</p>}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button ref={cancelApplyButtonRef} onClick={() => setApplyPreviewOpen(false)} className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700">انصراف</button>
              <button ref={confirmApplyButtonRef} onClick={applySandbox} className="rounded-md bg-tealish px-3 py-2 font-bold text-white">تایید و اعمال</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import { calculateProgressPercent, getLessonAttempt } from './lessonProgress';
import { getStepGuidance, lessons } from './lessonEngine';
import { validateLesson } from './lessonValidation';
import { generateLessonHighlight } from './lessonSandbox';
import { downloadTextFile } from '../../migrations/storageSafety';
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
  const activeLessonId = project.lessonProgress?.lastActiveLessonId ?? lessons[0].id;
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const attempt = getLessonAttempt(project, activeLesson.id);
  const progressPercent = calculateProgressPercent(project.lessonProgress);
  const [hintIndex, setHintIndex] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [applyMode, setApplyMode] = useState<LessonSandboxApplyMode>('append');
  const [exampleTitle, setExampleTitle] = useState('');
  const [applyMessageFa, setApplyMessageFa] = useState<string>();
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

  const applySandbox = () => {
    const modeText =
      applyMode === 'replace'
        ? 'جایگزینی کل پروژه اصلی با sandbox'
        : applyMode === 'append'
          ? 'افزودن مدار، قطعه‌ها و سیم‌های درس به پروژه اصلی'
          : 'ذخیره به عنوان نمونه، بدون تغییر پروژه اصلی';
    const ok = window.confirm(
      `${modeText}\n\nتعداد مدار: ${sandboxCounts.circuits}\nتعداد قطعه: ${sandboxCounts.components}\nتعداد سیم: ${sandboxCounts.wires}\n\nآیا مطمئنی؟`
    );
    if (!ok) return;
    const result = applyLessonSandboxToMainProject(applyMode, exampleTitle || activeLesson.titleFa);
    if (applyMode === 'save-example') {
      setApplyMessageFa('نمونه درس ذخیره شد و پروژه اصلی تغییر نکرد.');
      return;
    }
    setApplyMessageFa(result?.diagnostics.issueCount ? `اعمال انجام شد، اما ${result.diagnostics.issueCount.toLocaleString('fa-IR')} مورد عیب‌یابی برای بررسی وجود دارد.` : 'اعمال با موفقیت انجام شد و عیب ساختاری مهمی پیدا نشد.');
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
            <button onClick={applySandbox} disabled={!lessonSandbox} className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
              اجرای انتخاب
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

          {lessonSandbox?.savedExamples?.length ? (
            <div className="mt-4 rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <div className="font-bold">نمونه‌های ذخیره‌شده</div>
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
                        onClick={() => downloadTextFile(`kia-electric-lab-example-${example.id}.json`, JSON.stringify(example, null, 2))}
                        className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700"
                      >
                        خروجی
                      </button>
                      <button onClick={() => deleteLessonExample(example.id)} className="rounded-md border border-rose-200 px-2 py-1 text-rose-700 dark:border-rose-900 dark:text-rose-200">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

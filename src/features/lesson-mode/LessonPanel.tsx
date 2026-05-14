import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import { calculateProgressPercent, getLessonAttempt } from './lessonProgress';
import { lessons } from './lessonEngine';
import { validateLesson } from './lessonValidation';

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
  const setActiveLesson = useLabStore((state) => state.setActiveLesson);
  const useLessonHint = useLabStore((state) => state.useLessonHint);
  const recordLessonValidation = useLabStore((state) => state.recordLessonValidation);
  const resetCurrentLessonWiring = useLabStore((state) => state.resetCurrentLessonWiring);
  const activeLessonId = project.lessonProgress?.lastActiveLessonId ?? lessons[0].id;
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const attempt = getLessonAttempt(project, activeLesson.id);
  const progressPercent = calculateProgressPercent(project.lessonProgress);
  const [hintIndex, setHintIndex] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const validationPreview = useMemo(() => validateLesson(project, activeLesson.id, attempt.hintsUsed), [project, activeLesson.id, attempt.hintsUsed]);

  const requestHint = () => {
    useLessonHint(activeLesson.id);
    setHintIndex((value) => Math.min(value + 1, activeLesson.hintsFa.length - 1));
  };

  const validate = () => {
    const result = validateLesson(project, activeLesson.id, attempt.hintsUsed);
    recordLessonValidation(activeLesson.id, result.passed, result.score, result.feedbackFa.join(' '));
    setFeedback(result.feedbackFa);
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

      <div className="grid gap-2 md:grid-cols-2">
        <div className="max-h-80 space-y-2 overflow-auto">
          {lessons.map((lesson, index) => {
            const completed = project.lessonProgress?.completedLessonIds.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => {
                  setActiveLesson(lesson.id);
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
          </div>
        </div>
      </div>
    </section>
  );
}

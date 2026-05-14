import type { ElectricalProject, LessonAttempt, LessonProgress, LessonScore } from '../../types/electrical';
import { lessons } from './lessonEngine';

export function createEmptyLessonProgress(): LessonProgress {
  return {
    completedLessonIds: [],
    attemptsByLesson: {},
    lastActiveLessonId: lessons[0]?.id
  };
}

function currentProgress(project: ElectricalProject): LessonProgress {
  return project.lessonProgress ?? createEmptyLessonProgress();
}

export function getLessonAttempt(project: ElectricalProject, lessonId: string): LessonAttempt {
  const progress = currentProgress(project);
  return progress.attemptsByLesson[lessonId] ?? {
    lessonId,
    attemptsCount: 0,
    hintsUsed: 0,
    completed: false
  };
}

export function setActiveLesson(project: ElectricalProject, lessonId: string): ElectricalProject {
  const progress = currentProgress(project);
  return {
    ...project,
    lessonProgress: {
      ...progress,
      lastActiveLessonId: lessonId
    }
  };
}

export function recordHintUsed(project: ElectricalProject, lessonId: string): ElectricalProject {
  const progress = currentProgress(project);
  const attempt = getLessonAttempt(project, lessonId);
  return {
    ...project,
    lessonProgress: {
      ...progress,
      lastActiveLessonId: lessonId,
      attemptsByLesson: {
        ...progress.attemptsByLesson,
        [lessonId]: {
          ...attempt,
          hintsUsed: attempt.hintsUsed + 1
        }
      }
    }
  };
}

export function recordLessonAttempt(project: ElectricalProject, lessonId: string, passed: boolean, score: LessonScore, feedbackFa: string): ElectricalProject {
  const progress = currentProgress(project);
  const attempt = getLessonAttempt(project, lessonId);
  const completedLessonIds = passed
    ? Array.from(new Set([...progress.completedLessonIds, lessonId]))
    : progress.completedLessonIds;
  return {
    ...project,
    lessonProgress: {
      ...progress,
      completedLessonIds,
      lastActiveLessonId: lessonId,
      attemptsByLesson: {
        ...progress.attemptsByLesson,
        [lessonId]: {
          ...attempt,
          attemptsCount: attempt.attemptsCount + 1,
          completed: attempt.completed || passed,
          score,
          completedAt: passed ? new Date().toISOString() : attempt.completedAt,
          lastFeedbackFa: feedbackFa
        }
      }
    }
  };
}

export function calculateProgressPercent(progress?: LessonProgress): number {
  const completed = progress?.completedLessonIds.length ?? 0;
  return Math.round((completed / Math.max(1, lessons.length)) * 100);
}

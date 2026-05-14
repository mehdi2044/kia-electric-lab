import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import { calculateProgressPercent, getLessonAttempt, recordHintUsed, recordLessonAttempt, setActiveLesson } from './lessonProgress';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('lesson progress', () => {
  it('tracks active lesson and hint usage without mutating the original project', () => {
    const project = clone(defaultProject);
    const active = setActiveLesson(project, 'lesson-2-two-gang-two-lamps');
    const hinted = recordHintUsed(active, 'lesson-2-two-gang-two-lamps');

    expect(project.lessonProgress?.lastActiveLessonId).toBe('lesson-1-one-way-lamp');
    expect(active.lessonProgress?.lastActiveLessonId).toBe('lesson-2-two-gang-two-lamps');
    expect(getLessonAttempt(hinted, 'lesson-2-two-gang-two-lamps').hintsUsed).toBe(1);
  });

  it('records completion, attempts, and score', () => {
    const project = clone(defaultProject);
    const next = recordLessonAttempt(
      project,
      'lesson-1-one-way-lamp',
      true,
      { technical: 90, safety: 90, cost: 80, learning: 95, final: 90 },
      'کارت خوب بود.'
    );
    const attempt = getLessonAttempt(next, 'lesson-1-one-way-lamp');

    expect(attempt.completed).toBe(true);
    expect(attempt.attemptsCount).toBe(1);
    expect(attempt.score?.final).toBe(90);
    expect(calculateProgressPercent(next.lessonProgress)).toBeGreaterThan(0);
  });
});

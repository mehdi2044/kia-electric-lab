import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import {
  addLessonExample,
  appendSandboxToMainProject,
  createLessonExample,
  createLessonProjectFromTemplate,
  deleteLessonExample,
  generateLessonHighlight,
  loadLessonExampleIntoSandbox,
  replaceMainProjectWithSandbox,
  resetLessonSandbox,
  startLessonSandbox
} from './lessonSandbox';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('lesson sandbox', () => {
  it('creates a lesson template with explicit wiring required', () => {
    const project = createLessonProjectFromTemplate('lesson-1-one-way-lamp');

    expect(project.useExplicitWiresOnly).toBe(true);
    expect(project.components.some((component) => component.type === 'one-way-switch')).toBe(true);
    expect(project.components.some((component) => component.type === 'lamp')).toBe(true);
    expect(project.panelboard?.breakers[0].circuitId).toBe(project.circuits[0].id);
  });

  it('starts sandbox without mutating the main project', () => {
    const main = clone(defaultProject);
    const sandbox = startLessonSandbox(main, 'lesson-3-standard-outlet');

    sandbox.sandboxProject.components.push({
      id: 'sandbox-extra',
      type: 'outlet',
      labelFa: 'پریز اضافه',
      roomId: 'living',
      x: 1,
      y: 1
    });

    expect(main.components.some((component) => component.id === 'sandbox-extra')).toBe(false);
    expect(sandbox.mainProject.components.length).toBe(defaultProject.components.length);
  });

  it('resets sandbox from template', () => {
    const sandbox = startLessonSandbox(clone(defaultProject), 'lesson-1-one-way-lamp');
    sandbox.sandboxProject.wires = [
      {
        id: 'wire-temp',
        circuitId: sandbox.sandboxProject.circuits[0].id,
        from: { componentId: 'main-panel', terminalId: 'phase-source' },
        to: { componentId: `breaker:${sandbox.sandboxProject.circuits[0].id}`, terminalId: 'line-in' },
        lengthMeters: 1,
        wireSizeMm2: 1.5
      }
    ];

    const reset = resetLessonSandbox(sandbox);

    expect(reset.sandboxProject.wires).toEqual([]);
    expect(reset.attemptsCount).toBe(1);
  });

  it('generates step highlight guidance', () => {
    const project = createLessonProjectFromTemplate('lesson-1-one-way-lamp');
    const highlight = generateLessonHighlight(project, 'lesson-1-one-way-lamp', 0);

    expect(highlight.roomIds).toContain('living');
    expect(highlight.componentIds.length).toBeGreaterThan(0);
    expect(highlight.messageFa).toContain('روشن کردن');
  });

  it('replaces main project only when explicitly requested by caller', () => {
    const main = clone(defaultProject);
    const sandbox = startLessonSandbox(main, 'lesson-4-fridge-dedicated');
    sandbox.sandboxProject.components[1].labelFa = 'یخچال تغییر کرده';

    expect(main.components.some((component) => component.labelFa === 'یخچال تغییر کرده')).toBe(false);
    const result = replaceMainProjectWithSandbox(sandbox);
    expect(result.project.components.some((component) => component.labelFa === 'یخچال تغییر کرده')).toBe(true);
    expect(result.project.useExplicitWiresOnly).toBe(false);
    expect(result.diagnostics).toBeDefined();
  });

  it('appends sandbox content while preserving the main project and regenerating ids', () => {
    const main = clone(defaultProject);
    main.components.push({
      id: 'lesson-lesson-3-standard-outlet-sandbox-outlet-1',
      type: 'outlet',
      labelFa: 'شناسه مشابه',
      roomId: 'living',
      x: 1,
      y: 1
    });
    const sandbox = startLessonSandbox(main, 'lesson-3-standard-outlet');
    sandbox.sandboxProject.wires = [
      {
        id: 'wire-outlet',
        circuitId: sandbox.sandboxProject.circuits[0].id,
        from: { componentId: `breaker:${sandbox.sandboxProject.circuits[0].id}`, terminalId: 'load-out' },
        to: { componentId: 'sandbox-outlet-1', terminalId: 'phase' },
        lengthMeters: 2,
        wireSizeMm2: 2.5,
        kind: 'phase'
      }
    ];

    const result = appendSandboxToMainProject(sandbox);
    const componentIds = result.project.components.map((component) => component.id);

    expect(main.circuits.length).toBe(defaultProject.circuits.length);
    expect(result.project.circuits.length).toBe(main.circuits.length + 1);
    expect(new Set(componentIds).size).toBe(componentIds.length);
    expect(result.summary.components).toBe(1);
    expect(result.diagnostics).toBeDefined();
  });

  it('creates, deletes, loads, and exports saved lesson examples as plain data', () => {
    const sandbox = startLessonSandbox(clone(defaultProject), 'lesson-1-one-way-lamp');
    const example = createLessonExample(sandbox, 'نمونه خوب', 'یادداشت', { technical: 80, safety: 90, cost: 70, learning: 95, final: 84 });
    const withExample = addLessonExample(sandbox, example);
    const loaded = loadLessonExampleIntoSandbox(withExample, example.id);
    const deleted = deleteLessonExample(withExample, example.id);

    expect(withExample.savedExamples).toHaveLength(1);
    expect(loaded.activeLessonId).toBe(example.lessonId);
    expect(loaded.sandboxProject).toEqual(example.projectSnapshot);
    expect(JSON.stringify(example)).toContain('نمونه خوب');
    expect(deleted.savedExamples).toHaveLength(0);
  });
});

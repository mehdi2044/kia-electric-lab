import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import type { Circuit, ElectricalComponent, ElectricalProject } from '../../types/electrical';
import { validateLesson } from './lessonValidation';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function addComponent(project: ElectricalProject, component: ElectricalComponent, circuitId: string): ElectricalProject {
  return {
    ...project,
    components: [...project.components, { ...component, circuitId }],
    circuits: project.circuits.map((circuit) =>
      circuit.id === circuitId
        ? {
            ...circuit,
            componentIds: Array.from(new Set([...circuit.componentIds, component.id])),
            applianceIds: component.applianceId ? Array.from(new Set([...circuit.applianceIds, component.applianceId])) : circuit.applianceIds
          }
        : circuit
    )
  };
}

describe('lesson validation', () => {
  it('does not fake success when lesson requirements are missing', () => {
    const project = clone(defaultProject);
    const result = validateLesson(project, 'lesson-1-one-way-lamp');

    expect(result.passed).toBe(false);
    expect(result.feedbackFa.join(' ')).toContain('کلید تک‌پل');
  });

  it('passes lesson 1 when a one-way switch controls a connected lamp through existing engines', () => {
    let project = clone(defaultProject);
    project = addComponent(
      project,
      { id: 'switch-test', type: 'one-way-switch', labelFa: 'کلید تست', roomId: 'living', x: 250, y: 150, costPointType: 'switch' },
      'c-lighting'
    );

    const result = validateLesson(project, 'lesson-1-one-way-lamp');

    expect(result.passed).toBe(true);
    expect(result.score.technical).toBe(100);
  });

  it('scores lesson 7 as failed when breaker is too large for selected wire', () => {
    const project = clone(defaultProject);
    project.circuits[0].breakerAmp = 32;

    const result = validateLesson(project, 'lesson-7-breaker-selection');

    expect(result.passed).toBe(false);
    expect(result.feedbackFa.join(' ')).toContain('فیوز');
  });

  it('passes kitchen heavy lesson after loads are split across two kitchen circuits', () => {
    const project = clone(defaultProject);
    const extraCircuit: Circuit = {
      id: 'c-kitchen-heavy-2',
      nameFa: 'مدار سنگین آشپزخانه ۲',
      roomIds: ['kitchen'],
      componentIds: [],
      applianceIds: ['dishwasher'],
      wireSizeMm2: 4,
      breakerAmp: 20,
      lengthMeters: 10,
      kind: 'heavy'
    };
    project.circuits = project.circuits.map((circuit) =>
      circuit.id === 'c-kitchen'
        ? { ...circuit, applianceIds: ['fridge'], componentIds: ['fridge-kitchen'] }
        : circuit
    );
    project.circuits.push(extraCircuit);
    project.panelboard?.breakers.push({ id: 'slot-extra', labelFa: 'فیوز آشپزخانه ۲', amp: 20, circuitId: extraCircuit.id });

    const result = validateLesson(project, 'lesson-5-kitchen-heavy-loads');

    expect(result.passed).toBe(true);
  });
});

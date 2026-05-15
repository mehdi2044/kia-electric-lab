import { describe, expect, it } from 'vitest';
import type { ElectricalProject } from '../../types/electrical';
import { simulateLiveCircuitState, isLampPowered } from './liveFlowEngine';

function lampSwitchProject(overrides: Partial<ElectricalProject> = {}): ElectricalProject {
  const project: ElectricalProject = {
    schemaVersion: 8,
    appVersion: 'test',
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
    voltage: 220,
    mainBreakerAmp: 25,
    pixelsPerMeter: 24,
    rooms: [{ id: 'panel', nameFa: 'تابلو', type: 'panel', x: 0, y: 0, width: 100, height: 100 }],
    components: [
      { id: 'main-panel', type: 'main-panel', labelFa: 'تابلو', roomId: 'panel', x: 0, y: 0 },
      { id: 'switch-1', type: 'one-way-switch', labelFa: 'کلید', roomId: 'panel', x: 100, y: 0, circuitId: 'c-light' },
      { id: 'lamp-1', type: 'lamp', labelFa: 'لامپ', roomId: 'panel', x: 200, y: 0, circuitId: 'c-light', applianceId: 'led-lamp' }
    ],
    circuits: [{
      id: 'c-light',
      nameFa: 'روشنایی',
      roomIds: ['panel'],
      componentIds: ['switch-1', 'lamp-1'],
      applianceIds: ['led-lamp'],
      wireSizeMm2: 1.5,
      breakerAmp: 10,
      lengthMeters: 6,
      kind: 'lighting'
    }],
    wires: [
      { id: 'w-panel-breaker', circuitId: 'c-light', from: { componentId: 'main-panel', terminalId: 'phase-source' }, to: { componentId: 'breaker:c-light', terminalId: 'line-in' }, lengthMeters: 1, wireSizeMm2: 1.5, kind: 'phase' },
      { id: 'w-breaker-switch', circuitId: 'c-light', from: { componentId: 'breaker:c-light', terminalId: 'load-out' }, to: { componentId: 'switch-1', terminalId: 'line-in' }, lengthMeters: 1, wireSizeMm2: 1.5, kind: 'phase' },
      { id: 'w-switch-lamp', circuitId: 'c-light', from: { componentId: 'switch-1', terminalId: 'line-out' }, to: { componentId: 'lamp-1', terminalId: 'phase' }, lengthMeters: 1, wireSizeMm2: 1.5, kind: 'switched-phase' },
      { id: 'w-lamp-neutral', circuitId: 'c-light', from: { componentId: 'lamp-1', terminalId: 'neutral' }, to: { componentId: 'main-panel', terminalId: 'neutral-source' }, lengthMeters: 1, wireSizeMm2: 1.5, kind: 'neutral' }
    ],
    panelboard: { mainBreakerAmp: 25, breakers: [{ id: 'slot-1', labelFa: 'فیوز', amp: 10, circuitId: 'c-light' }] },
    lessonProgress: { completedLessonIds: [], attemptsByLesson: {} },
    useExplicitWiresOnly: true,
    switchStates: {},
    breakerStates: {},
    loadStates: {}
  };
  return { ...project, ...overrides };
}

describe('liveFlowEngine', () => {
  it('keeps a lamp off when the switch is open', () => {
    const result = simulateLiveCircuitState(lampSwitchProject());
    expect(result.components.find((component) => component.componentId === 'lamp-1')?.powered).toBe(false);
  });

  it('powers a lamp when the switch closes the phase path', () => {
    const project = lampSwitchProject({ switchStates: { 'switch-1': { on: true } } });
    expect(isLampPowered(project, 'lamp-1')).toBe(true);
    expect(simulateLiveCircuitState(project).wires.some((wire) => wire.wireId === 'w-switch-lamp' && wire.carryingCurrent)).toBe(true);
  });

  it('turns powered components off when the breaker is disabled', () => {
    const project = lampSwitchProject({
      switchStates: { 'switch-1': { on: true } },
      breakerStates: { 'c-light': { enabled: false } }
    });
    const result = simulateLiveCircuitState(project);
    expect(result.components.find((component) => component.componentId === 'lamp-1')?.powered).toBe(false);
    expect(result.breakers.find((breaker) => breaker.circuitId === 'c-light')?.enabled).toBe(false);
  });

  it('marks overloaded wires as unsafe', () => {
    const project = lampSwitchProject({
      components: [
        ...lampSwitchProject().components.filter((component) => component.id !== 'lamp-1'),
        { id: 'lamp-1', type: 'appliance', labelFa: 'فر', roomId: 'panel', x: 200, y: 0, circuitId: 'c-light', applianceId: 'oven' }
      ],
      switchStates: { 'switch-1': { on: true } },
      wires: lampSwitchProject().wires?.map((wire) => ({ ...wire, wireSizeMm2: 1.5 })) ?? []
    });
    const result = simulateLiveCircuitState(project);
    expect(result.wires.some((wire) => wire.carryingCurrent)).toBe(true);
    expect(result.wires.some((wire) => wire.unsafe)).toBe(true);
  });
});

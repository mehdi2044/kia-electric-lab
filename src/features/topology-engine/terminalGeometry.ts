import type { ElectricalComponent, ElectricalProject, ElectricalTerminalRef, Point2D } from '../../types/electrical';

export const DEFAULT_PIXELS_PER_METER = 24;
export const GRID_SIZE = 24;

export function getBreakerPosition(circuitIndex: number): Point2D {
  return { x: 28, y: 135 + circuitIndex * 86 };
}

function componentPosition(project: ElectricalProject, componentId: string): Point2D | undefined {
  if (componentId.startsWith('breaker:')) {
    const circuitId = componentId.replace('breaker:', '');
    const index = project.circuits.findIndex((circuit) => circuit.id === circuitId);
    return index >= 0 ? getBreakerPosition(index) : undefined;
  }

  const component = project.components.find((item) => item.id === componentId);
  return component ? { x: component.x, y: component.y } : undefined;
}

function terminalOffset(component: ElectricalComponent | undefined, ref: ElectricalTerminalRef): Point2D {
  if (ref.componentId.startsWith('breaker:')) {
    return ref.terminalId === 'line-in' ? { x: 24, y: 62 } : { x: 88, y: 62 };
  }

  if (component?.type === 'main-panel') {
    if (ref.terminalId === 'phase-source') return { x: 28, y: 70 };
    if (ref.terminalId === 'neutral-source') return { x: 56, y: 70 };
    if (ref.terminalId === 'earth-source') return { x: 84, y: 70 };
  }

  if (component?.type === 'one-way-switch') {
    return ref.terminalId === 'line-in' ? { x: 34, y: 72 } : { x: 78, y: 72 };
  }

  if (component?.type === 'two-gang-switch') {
    if (ref.terminalId === 'line-in') return { x: 24, y: 72 };
    if (ref.terminalId === 'line-out-1') return { x: 56, y: 72 };
    return { x: 88, y: 72 };
  }

  if (ref.terminalId === 'phase') return { x: 30, y: 72 };
  if (ref.terminalId === 'neutral') return { x: 56, y: 72 };
  if (ref.terminalId === 'earth') return { x: 82, y: 72 };
  if (ref.terminalId === 'a') return { x: 32, y: 72 };
  if (ref.terminalId === 'b') return { x: 80, y: 72 };
  return { x: 56, y: 72 };
}

export function getTerminalCoordinate(project: ElectricalProject, ref: ElectricalTerminalRef): Point2D | undefined {
  const base = componentPosition(project, ref.componentId);
  if (!base) return undefined;
  const component = project.components.find((item) => item.id === ref.componentId);
  const offset = terminalOffset(component, ref);
  return { x: base.x + offset.x, y: base.y + offset.y };
}

export function snapPointToGrid(point: Point2D, gridSize = GRID_SIZE): Point2D {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}

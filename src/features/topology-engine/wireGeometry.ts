import type { ElectricalProject, ElectricalWire, Point2D } from '../../types/electrical';
import { DEFAULT_PIXELS_PER_METER, getTerminalCoordinate, snapPointToGrid } from './terminalGeometry';

export function pixelsToMeters(pixels: number, pixelsPerMeter = DEFAULT_PIXELS_PER_METER): number {
  return pixels / pixelsPerMeter;
}

export function distancePixels(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function getWirePathPoints(project: ElectricalProject, wire: ElectricalWire): Point2D[] {
  const start = getTerminalCoordinate(project, wire.from);
  const end = getTerminalCoordinate(project, wire.to);
  return [start, ...(wire.routePoints ?? []), end].filter((point): point is Point2D => Boolean(point));
}

export function calculateRouteLengthPixels(points: Point2D[]): number {
  return points.slice(1).reduce((sum, point, index) => sum + distancePixels(points[index], point), 0);
}

export function calculateWireGeometryLength(project: ElectricalProject, wire: ElectricalWire): number {
  if (wire.manualLengthOverride && wire.manualLengthOverride > 0) return wire.manualLengthOverride;
  const points = getWirePathPoints(project, wire);
  if (points.length < 2) return wire.lengthMeters;
  return pixelsToMeters(calculateRouteLengthPixels(points), project.pixelsPerMeter ?? DEFAULT_PIXELS_PER_METER);
}

export function insertBendPoint(wire: ElectricalWire, point: Point2D, index?: number): ElectricalWire {
  const routePoints = [...(wire.routePoints ?? [])];
  const insertionIndex = index === undefined ? routePoints.length : Math.max(0, Math.min(index, routePoints.length));
  routePoints.splice(insertionIndex, 0, snapPointToGrid(point));
  return { ...wire, routePoints };
}

export function updateBendPoint(wire: ElectricalWire, index: number, point: Point2D, snap = false): ElectricalWire {
  const routePoints = [...(wire.routePoints ?? [])];
  if (index < 0 || index >= routePoints.length) return wire;
  routePoints[index] = snap ? snapPointToGrid(point) : point;
  return { ...wire, routePoints };
}

export function removeBendPoint(wire: ElectricalWire, index: number): ElectricalWire {
  const routePoints = [...(wire.routePoints ?? [])];
  if (index < 0 || index >= routePoints.length) return wire;
  routePoints.splice(index, 1);
  return { ...wire, routePoints };
}

export function resetWireRoute(wire: ElectricalWire): ElectricalWire {
  return { ...wire, routePoints: [], manualLengthOverride: undefined };
}

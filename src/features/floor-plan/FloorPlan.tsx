import { useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Controls, type Edge, type Node, type ReactFlowInstance } from 'reactflow';
import { Icon, iconForComponent } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import type { ComponentType, ElectricalTerminalRef, ElectricalWireKind } from '../../types/electrical';
import { createComponentNode, createVirtualBreakerNode } from '../topology-engine/terminalCatalog';
import { validateTerminalConnection } from '../topology-engine/wireFactory';
import { generateTopologyWarnings } from '../validation-engine/validationEngine';
import { calculateWireGeometryLength, getWirePathPoints } from '../topology-engine/wireGeometry';
import { generateLessonHighlight } from '../lesson-mode/lessonSandbox';
import { validateLesson } from '../lesson-mode/lessonValidation';

const palette: Record<string, string> = {
  living: 'bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-900',
  kitchen: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
  bedroom: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-900',
  bathroom: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900',
  hallway: 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800',
  balcony: 'bg-lime-50 border-lime-200 dark:bg-lime-950/30 dark:border-lime-900',
  panel: 'bg-zinc-100 border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700'
};

function findRoom(projectX: number, projectY: number) {
  return useLabStore
    .getState()
    .project.rooms.find((room) => projectX >= room.x && projectX <= room.x + room.width && projectY >= room.y && projectY <= room.y + room.height);
}

const wireColors: Record<ElectricalWireKind, string> = {
  phase: '#dc2626',
  neutral: '#2563eb',
  earth: '#16a34a',
  'switched-phase': '#f59e0b'
};

function TerminalButton({
  terminal,
  active,
  onClick,
  highlighted
}: {
  terminal: { id: string; labelFa: string; role: string };
  active: boolean;
  highlighted?: boolean;
  onClick: () => void;
}) {
  const color =
    terminal.role.includes('neutral')
      ? 'bg-blue-500'
      : terminal.role.includes('earth')
        ? 'bg-emerald-500'
        : terminal.role.includes('switch')
          ? 'bg-amber-500'
          : 'bg-rose-500';

  return (
    <button
      className={`h-4 w-4 rounded-full border-2 border-white shadow ${color} ${active || highlighted ? 'ring-2 ring-tealish ring-offset-1' : ''} ${highlighted ? 'animate-pulse' : ''}`}
      title={terminal.labelFa}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    />
  );
}

export function FloorPlan() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const project = useLabStore((state) => state.project);
  const lessonSandbox = useLabStore((state) => state.lessonSandbox);
  const selectedCircuitId = useLabStore((state) => state.selectedCircuitId);
  const selectedWireId = useLabStore((state) => state.selectedWireId);
  const wireDrawingMode = useLabStore((state) => state.wireDrawingMode);
  const pendingTerminal = useLabStore((state) => state.pendingTerminal);
  const addComponent = useLabStore((state) => state.addComponent);
  const assignComponentToCircuit = useLabStore((state) => state.assignComponentToCircuit);
  const selectTerminalForWire = useLabStore((state) => state.selectTerminalForWire);
  const selectWire = useLabStore((state) => state.selectWire);
  const setWireDrawingMode = useLabStore((state) => state.setWireDrawingMode);
  const addWireBendPoint = useLabStore((state) => state.addWireBendPoint);
  const updateWireBendPoint = useLabStore((state) => state.updateWireBendPoint);
  const removeWireBendPoint = useLabStore((state) => state.removeWireBendPoint);
  const resetWireRoute = useLabStore((state) => state.resetWireRoute);
  const [draggingBend, setDraggingBend] = useState<{ wireId: string; index: number } | undefined>();
  const lessonHighlight = useMemo(() => {
    if (!lessonSandbox) return undefined;
    const preview = validateLesson(project, lessonSandbox.activeLessonId, 0);
    return generateLessonHighlight(project, lessonSandbox.activeLessonId, preview.completedStepIds.length);
  }, [lessonSandbox, project]);
  const highlightedTerminalKeys = useMemo(
    () => new Set((lessonHighlight?.terminalRefs ?? []).map((ref) => `${ref.componentId}:${ref.terminalId}`)),
    [lessonHighlight]
  );

  const topologyWarnings = useMemo(() => generateTopologyWarnings(project), [project]);
  const invalidWireIds = useMemo(
    () =>
      new Set(
        [
          ...topologyWarnings
          .map((warning) => warning.id.match(/^topology:(.+):short-circuit$/)?.[1] ?? warning.id.match(/^topology:(.+):wire-overload$/)?.[1])
          .filter((wireId): wireId is string => Boolean(wireId)),
          ...(lessonHighlight?.invalidWireIds ?? [])
        ]
      ),
    [lessonHighlight, topologyWarnings]
  );

  const virtualBreakerNodes = useMemo(
    () =>
      project.circuits.map((circuit, index) => {
        const node = createVirtualBreakerNode(circuit.id, circuit.breakerAmp, `فیوز ${circuit.nameFa}`);
        return {
          node,
          x: 28,
          y: 135 + index * 86
        };
      }),
    [project.circuits]
  );

  const roomNodes: Node[] = useMemo(
    () =>
      project.rooms.map((room) => ({
        id: `room-${room.id}`,
        type: 'default',
        position: { x: room.x, y: room.y },
        draggable: false,
        selectable: false,
        style: {
          width: room.width,
          height: room.height,
          zIndex: 0,
          borderRadius: 8,
          border: '1px solid transparent',
          padding: 0,
          background: 'transparent'
        },
        data: {
          label: (
              <div className={`h-full w-full rounded-lg border p-2 ${palette[room.type]} ${lessonHighlight?.roomIds.includes(room.id) ? 'ring-4 ring-tealish/60' : ''}`}>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{room.nameFa}</div>
              {room.highRisk ? <div className="mt-1 text-[10px] text-rose-600 dark:text-rose-300">ناحیه پرخطر</div> : null}
            </div>
          )
        }
      })),
    [lessonHighlight, project.rooms]
  );

  const componentNodes: Node[] = useMemo(
    () =>
      project.components.map((component) => {
        const topologyNode = createComponentNode(component);
        return {
        id: component.id,
        position: { x: component.x, y: component.y },
        draggable: false,
        style: {
          width: 112,
          border: lessonHighlight?.componentIds.includes(component.id) ? '3px solid #14b8a6' : component.circuitId === selectedCircuitId ? '2px solid #0f766e' : '1px solid #cbd5e1',
          borderRadius: 8,
          background: component.type === 'main-panel' ? '#111827' : '#ffffff',
          color: component.type === 'main-panel' ? '#ffffff' : '#0f172a',
          boxShadow: '0 8px 22px rgba(15, 23, 42, 0.12)'
        },
        data: {
          label: (
            <div className="flex w-full flex-col items-center gap-1 p-2 text-center text-[11px]">
              <button
                className="flex flex-col items-center gap-1"
                onClick={() => component.type !== 'main-panel' && assignComponentToCircuit(selectedCircuitId, component.id)}
                title="افزودن به مدار انتخاب‌شده"
              >
                <Icon name={iconForComponent(component.type)} className="h-4 w-4" />
                <span>{component.labelFa}</span>
              </button>
              <div className="mt-1 flex flex-wrap justify-center gap-1">
                {topologyNode.terminals.map((terminal) => {
                  const ref: ElectricalTerminalRef = { componentId: component.id, terminalId: terminal.id };
                  return (
                    <TerminalButton
                      key={terminal.id}
                      terminal={terminal}
                      active={Boolean(pendingTerminal && pendingTerminal.componentId === ref.componentId && pendingTerminal.terminalId === ref.terminalId)}
                      highlighted={highlightedTerminalKeys.has(`${ref.componentId}:${ref.terminalId}`)}
                      onClick={() => selectTerminalForWire(ref)}
                    />
                  );
                })}
              </div>
            </div>
          )
        }
      };
    }),
    [assignComponentToCircuit, highlightedTerminalKeys, lessonHighlight, pendingTerminal, project.components, selectTerminalForWire, selectedCircuitId]
  );

  const breakerNodes: Node[] = useMemo(
    () =>
      virtualBreakerNodes.map(({ node, x, y }) => ({
        id: node.id,
        position: { x, y },
        draggable: false,
        style: {
          width: 112,
          border: node.circuitId === selectedCircuitId ? '2px solid #0f766e' : '1px solid #cbd5e1',
          borderRadius: 8,
          background: '#fff7ed',
          color: '#7c2d12',
          boxShadow: '0 8px 22px rgba(15, 23, 42, 0.10)'
        },
        data: {
          label: (
            <div className="flex w-full flex-col items-center gap-1 p-2 text-center text-[11px]">
              <Icon name="CircleGauge" className="h-4 w-4" />
              <span>{node.labelFa}</span>
              <div className="mt-1 flex gap-1">
                {node.terminals.map((terminal) => {
                  const ref: ElectricalTerminalRef = { componentId: node.id, terminalId: terminal.id };
                  return (
                    <TerminalButton
                      key={terminal.id}
                      terminal={terminal}
                      active={Boolean(pendingTerminal && pendingTerminal.componentId === ref.componentId && pendingTerminal.terminalId === ref.terminalId)}
                      onClick={() => selectTerminalForWire(ref)}
                    />
                  );
                })}
              </div>
            </div>
          )
        }
      })),
    [pendingTerminal, selectTerminalForWire, selectedCircuitId, virtualBreakerNodes]
  );

  const edges: Edge[] = useMemo(
    () => [],
    []
  );

  function eventToPlanPoint(event: React.MouseEvent | React.PointerEvent) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  const routedWires = useMemo(
    () =>
      (project.wires ?? []).map((wire) => {
        const validation = validateTerminalConnection(project, wire.from, wire.to);
        const invalid = !validation.valid || invalidWireIds.has(wire.id);
        const points = getWirePathPoints(project, wire);
        return {
          wire,
          invalid,
          points,
          lengthMeters: calculateWireGeometryLength(project, wire),
          color: invalid ? '#e11d48' : wireColors[wire.kind ?? 'phase']
        };
      }),
    [invalidWireIds, project]
  );

  const ghostWirePoints = useMemo(() => {
    if (!lessonHighlight?.ghostWire) return [];
    return getWirePathPoints(project, {
      id: 'lesson-ghost-wire',
      circuitId: selectedCircuitId,
      from: lessonHighlight.ghostWire.from,
      to: lessonHighlight.ghostWire.to,
      lengthMeters: 1,
      wireSizeMm2: 2.5,
      kind: lessonHighlight.ghostWire.kind
    });
  }, [lessonHighlight, project, selectedCircuitId]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">نقشه آپارتمان ۱۰۰ متری</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            قطعه‌ها را بکش و روی اتاق‌ها رها کن. در حالت سیم‌کشی، روی دو ترمینال کلیک کن تا سیم واقعی در گراف ساخته شود.
          </p>
        </div>
        <button
          onClick={() => setWireDrawingMode(!wireDrawingMode)}
          className={`rounded-md px-3 py-2 text-xs font-bold ${
            wireDrawingMode ? 'bg-tealish text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          {wireDrawingMode ? 'حالت سیم‌کشی فعال' : 'حالت سیم‌کشی'}
        </button>
      </div>
      <div
        ref={wrapperRef}
        className="floor-grid relative h-[510px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
        data-testid="floor-plan"
        onPointerMove={(event) => {
          if (!draggingBend) return;
          updateWireBendPoint(draggingBend.wireId, draggingBend.index, eventToPlanPoint(event), true);
        }}
        onPointerUp={() => setDraggingBend(undefined)}
        onPointerLeave={() => setDraggingBend(undefined)}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(event) => {
          event.preventDefault();
          const raw = event.dataTransfer.getData('application/kia-component');
          if (!raw || !flowRef.current) return;
          const dropped = JSON.parse(raw) as { type: ComponentType; labelFa: string; applianceId?: string };
          const point = flowRef.current.screenToFlowPosition({ x: event.clientX, y: event.clientY });
          const room = findRoom(point.x, point.y) ?? project.rooms[1];
          addComponent({
            type: dropped.type,
            labelFa: dropped.labelFa,
            roomId: room.id,
            x: point.x,
            y: point.y,
            applianceId: dropped.applianceId,
            circuitId: selectedCircuitId,
            costPointType:
              dropped.type === 'outlet' || dropped.type === 'appliance'
                ? 'outlet'
                : dropped.type === 'lamp'
                  ? 'lamp'
                  : dropped.type.includes('switch')
                    ? 'switch'
                    : dropped.type === 'junction-box'
                      ? 'junction'
                      : undefined
          });
        }}
      >
        <ReactFlow
          nodes={[...roomNodes, ...breakerNodes, ...componentNodes]}
          edges={edges}
          onEdgeClick={(_, edge) => selectWire(edge.id)}
          onInit={(instance) => {
            flowRef.current = instance;
          }}
          minZoom={0.75}
          maxZoom={1.2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} color="#cbd5e1" />
          <Controls position="bottom-left" />
        </ReactFlow>
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          {ghostWirePoints.length >= 2 && lessonHighlight?.ghostWire ? (
            <g>
              <polyline
                points={ghostWirePoints.map((point) => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke="#14b8a6"
                strokeWidth={3}
                strokeDasharray="6 6"
                opacity={0.75}
              />
              <text x={ghostWirePoints[0].x + 8} y={ghostWirePoints[0].y - 8} fill="#0f766e" fontSize="12" fontWeight="700">
                {lessonHighlight.ghostWire.labelFa}
              </text>
            </g>
          ) : null}
          {routedWires.map(({ wire, invalid, points, color, lengthMeters }) => {
            if (points.length < 2) return null;
            return (
              <g key={wire.id}>
                <polyline
                  points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth={wire.id === selectedWireId ? 5 : 3}
                  strokeDasharray={invalid ? '8 5' : undefined}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => selectWire(wire.id)}
                  onDoubleClick={(event) => {
                    addWireBendPoint(wire.id, eventToPlanPoint(event));
                    selectWire(wire.id);
                  }}
                />
                <circle cx={points[0].x} cy={points[0].y} r={5} fill={color} />
                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={5} fill={color} />
                {wire.id === selectedWireId ? (
                  <text x={points[Math.floor(points.length / 2)].x + 8} y={points[Math.floor(points.length / 2)].y - 8} fill={color} fontSize="12" fontWeight="700">
                    {lengthMeters.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} m
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        {routedWires
          .filter(({ wire }) => wire.id === selectedWireId)
          .flatMap(({ wire }) =>
            (wire.routePoints ?? []).map((point, index) => (
              <button
                key={`${wire.id}-${index}`}
                className="absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-tealish shadow"
                style={{ left: point.x, top: point.y }}
                title="کشیدن برای جابه‌جایی، راست‌کلیک برای حذف"
                onPointerDown={(event) => {
                  event.preventDefault();
                  setDraggingBend({ wireId: wire.id, index });
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  removeWireBendPoint(wire.id, index);
                }}
              />
            ))
          )}
        {selectedWireId ? (
          <button
            className="absolute bottom-3 right-3 z-20 rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow"
            onClick={() => resetWireRoute(selectedWireId)}
          >
            ریست مسیر سیم
          </button>
        ) : null}
      </div>
    </section>
  );
}

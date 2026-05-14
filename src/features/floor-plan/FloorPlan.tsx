import { useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, type Edge, type Node, type ReactFlowInstance } from 'reactflow';
import { Icon, iconForComponent } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import type { ComponentType, ElectricalTerminalRef, ElectricalWireKind } from '../../types/electrical';
import { createComponentNode, createVirtualBreakerNode } from '../topology-engine/terminalCatalog';
import { validateTerminalConnection } from '../topology-engine/wireFactory';
import { generateTopologyWarnings } from '../validation-engine/validationEngine';

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
  onClick
}: {
  terminal: { id: string; labelFa: string; role: string };
  active: boolean;
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
      className={`h-4 w-4 rounded-full border-2 border-white shadow ${color} ${active ? 'ring-2 ring-tealish ring-offset-1' : ''}`}
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
  const selectedCircuitId = useLabStore((state) => state.selectedCircuitId);
  const selectedWireId = useLabStore((state) => state.selectedWireId);
  const wireDrawingMode = useLabStore((state) => state.wireDrawingMode);
  const pendingTerminal = useLabStore((state) => state.pendingTerminal);
  const addComponent = useLabStore((state) => state.addComponent);
  const assignComponentToCircuit = useLabStore((state) => state.assignComponentToCircuit);
  const selectTerminalForWire = useLabStore((state) => state.selectTerminalForWire);
  const selectWire = useLabStore((state) => state.selectWire);
  const setWireDrawingMode = useLabStore((state) => state.setWireDrawingMode);

  const topologyWarnings = useMemo(() => generateTopologyWarnings(project), [project]);
  const invalidWireIds = useMemo(
    () =>
      new Set(
        topologyWarnings
          .map((warning) => warning.id.match(/^topology:(.+):short-circuit$/)?.[1] ?? warning.id.match(/^topology:(.+):wire-overload$/)?.[1])
          .filter((wireId): wireId is string => Boolean(wireId))
      ),
    [topologyWarnings]
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
            <div className={`h-full w-full rounded-lg border p-2 ${palette[room.type]}`}>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{room.nameFa}</div>
              {room.highRisk ? <div className="mt-1 text-[10px] text-rose-600 dark:text-rose-300">ناحیه پرخطر</div> : null}
            </div>
          )
        }
      })),
    [project.rooms]
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
          border: component.circuitId === selectedCircuitId ? '2px solid #0f766e' : '1px solid #cbd5e1',
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
    [assignComponentToCircuit, pendingTerminal, project.components, selectTerminalForWire, selectedCircuitId]
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
    () =>
      (project.wires ?? []).map((wire) => {
        const validation = validateTerminalConnection(project, wire.from, wire.to);
        const invalid = !validation.valid || invalidWireIds.has(wire.id);
        const color = invalid ? '#e11d48' : wireColors[wire.kind ?? 'phase'];
        return {
          id: wire.id,
          source: wire.from.componentId,
          target: wire.to.componentId,
          animated: wire.id === selectedWireId,
          label: wire.kind === 'neutral' ? 'N' : wire.kind === 'earth' ? 'PE' : wire.kind === 'switched-phase' ? 'L↔' : 'L',
          style: { stroke: color, strokeWidth: wire.id === selectedWireId ? 4 : 2, strokeDasharray: invalid ? '6 4' : undefined },
          labelStyle: { fill: color, fontWeight: 700 },
          data: { wire }
        };
      }),
    [invalidWireIds, project, selectedWireId]
  );

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
        className="floor-grid h-[510px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
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
          fitView
          nodesDraggable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} color="#cbd5e1" />
          <Controls position="bottom-left" />
        </ReactFlow>
      </div>
    </section>
  );
}

import { useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, type Edge, type Node, type ReactFlowInstance } from 'reactflow';
import { Icon, iconForComponent } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import type { ComponentType } from '../../types/electrical';

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

export function FloorPlan() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const project = useLabStore((state) => state.project);
  const selectedCircuitId = useLabStore((state) => state.selectedCircuitId);
  const addComponent = useLabStore((state) => state.addComponent);
  const assignComponentToCircuit = useLabStore((state) => state.assignComponentToCircuit);

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
      project.components.map((component) => ({
        id: component.id,
        position: { x: component.x, y: component.y },
        draggable: false,
        style: {
          width: 92,
          border: component.circuitId === selectedCircuitId ? '2px solid #0f766e' : '1px solid #cbd5e1',
          borderRadius: 8,
          background: component.type === 'main-panel' ? '#111827' : '#ffffff',
          color: component.type === 'main-panel' ? '#ffffff' : '#0f172a',
          boxShadow: '0 8px 22px rgba(15, 23, 42, 0.12)'
        },
        data: {
          label: (
            <button
              className="flex w-full flex-col items-center gap-1 p-2 text-center text-[11px]"
              onClick={() => component.type !== 'main-panel' && assignComponentToCircuit(selectedCircuitId, component.id)}
              title="افزودن به مدار انتخاب‌شده"
            >
              <Icon name={iconForComponent(component.type)} className="h-4 w-4" />
              <span>{component.labelFa}</span>
            </button>
          )
        }
      })),
    [assignComponentToCircuit, project.components, selectedCircuitId]
  );

  const edges: Edge[] = useMemo(
    () =>
      project.circuits.flatMap((circuit) =>
        circuit.componentIds
          .filter((componentId) => project.components.some((component) => component.id === componentId))
          .map((componentId) => ({
            id: `${circuit.id}-${componentId}`,
            source: 'main-panel',
            target: componentId,
            animated: circuit.id === selectedCircuitId,
            style: { stroke: circuit.id === selectedCircuitId ? '#0f766e' : '#94a3b8', strokeWidth: 2 }
          }))
      ),
    [project.circuits, project.components, selectedCircuitId]
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">نقشه آپارتمان ۱۰۰ متری</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">قطعه‌ها را بکش و روی اتاق‌ها رها کن؛ با کلیک روی هر قطعه، به مدار انتخاب‌شده وصل می‌شود.</p>
        </div>
        <div className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">۲۲۰ ولت تک‌فاز</div>
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
          nodes={[...roomNodes, ...componentNodes]}
          edges={edges}
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

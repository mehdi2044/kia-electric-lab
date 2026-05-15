import { useState } from 'react';
import { AccessibleModal } from '../../components/AccessibleModal';
import { unitCosts, wires } from '../../data/electricalTables';
import { useLabStore } from '../../store/useLabStore';
import { formatNumber, formatToman } from '../../utils/format';
import { simulateCurrentFlow } from '../current-engine/currentEngine';
import { createTerminalLookup } from '../topology-engine/topologyEngine';
import { validateTerminalConnection } from '../topology-engine/wireFactory';
import { generateTopologyWarnings } from '../validation-engine/validationEngine';
import { getWire } from '../safety-engine/electricalMath';
import { calculateWireGeometryLength, getWirePathPoints } from '../topology-engine/wireGeometry';
import { DEFAULT_PIXELS_PER_METER } from '../topology-engine/terminalGeometry';

const kindLabels = {
  phase: 'فاز',
  neutral: 'نول',
  earth: 'ارت آموزشی',
  'switched-phase': 'فاز برگشتی'
};

const exercises = [
  'یک چراغ را با یک کلید تک‌پل سیم‌کشی کن.',
  'دو چراغ را با کلید دوپل جداگانه کنترل کن.',
  'یک پریز ساده با فاز، نول و ارت آموزشی بساز.',
  'برای آشپزخانه یک مدار پریز جدا بساز.',
  'یخچال را روی مدار اختصاصی و پایدار وصل کن.'
];

export function WireRoutingPanel() {
  const project = useLabStore((state) => state.project);
  const selectedWireId = useLabStore((state) => state.selectedWireId);
  const selectedCircuitId = useLabStore((state) => state.selectedCircuitId);
  const wireDraft = useLabStore((state) => state.wireDraft);
  const wireDrawingMode = useLabStore((state) => state.wireDrawingMode);
  const pendingTerminal = useLabStore((state) => state.pendingTerminal);
  const updateWire = useLabStore((state) => state.updateWire);
  const deleteWire = useLabStore((state) => state.deleteWire);
  const clearInvalidWires = useLabStore((state) => state.clearInvalidWires);
  const resetWiringForCircuit = useLabStore((state) => state.resetWiringForCircuit);
  const resetWiringForRoom = useLabStore((state) => state.resetWiringForRoom);
  const setWireDraft = useLabStore((state) => state.setWireDraft);
  const updateWireBendPoint = useLabStore((state) => state.updateWireBendPoint);
  const addWireBendPoint = useLabStore((state) => state.addWireBendPoint);
  const removeWireBendPoint = useLabStore((state) => state.removeWireBendPoint);
  const resetWireRoute = useLabStore((state) => state.resetWireRoute);
  const setPixelsPerMeter = useLabStore((state) => state.setPixelsPerMeter);
  const [deleteWireId, setDeleteWireId] = useState<string>();

  const flow = simulateCurrentFlow(project);
  const terminalLookup = createTerminalLookup(flow.graph);
  const selectedWire = (project.wires ?? []).find((wire) => wire.id === selectedWireId);
  const selectedWireFlow = selectedWire ? flow.wires.find((wire) => wire.wireId === selectedWire.id) : undefined;
  const selectedWireCatalog = selectedWire ? getWire(selectedWire.wireSizeMm2) : undefined;
  const validation = selectedWire ? validateTerminalConnection(project, selectedWire.from, selectedWire.to) : undefined;
  const topologyWarnings = generateTopologyWarnings(project);
  const selectedWireWarnings = selectedWire
    ? topologyWarnings.filter((warning) => warning.id.includes(selectedWire.id) || warning.circuitId === selectedWire.circuitId)
    : [];
  const selectedWireCost =
    selectedWire && selectedWireCatalog
      ? calculateWireGeometryLength(project, selectedWire) * selectedWireCatalog.pricePerMeter + calculateWireGeometryLength(project, selectedWire) * unitCosts.laborPerMeter
      : 0;

  const from = selectedWire ? terminalLookup.get(`${selectedWire.from.componentId}:${selectedWire.from.terminalId}`) : undefined;
  const to = selectedWire ? terminalLookup.get(`${selectedWire.to.componentId}:${selectedWire.to.terminalId}`) : undefined;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">سیم‌کشی ترمینالی</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            سیم‌ها در `ElectricalWire[]` ذخیره می‌شوند و گراف الکتریکی منبع حقیقت است.
          </p>
        </div>
        <div className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {wireDrawingMode ? (pendingTerminal ? 'ترمینال دوم را انتخاب کن' : 'ترمینال اول را انتخاب کن') : 'حالت مشاهده'}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">سایز پیش‌فرض سیم</span>
          <select
            value={wireDraft.wireSizeMm2}
            onChange={(event) => setWireDraft({ wireSizeMm2: Number(event.target.value) })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          >
            {wires.map((wire) => (
              <option key={wire.sizeMm2} value={wire.sizeMm2}>
                {wire.sizeMm2} mm²
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">مقیاس: {(project.pixelsPerMeter ?? DEFAULT_PIXELS_PER_METER).toLocaleString('fa-IR')} پیکسل/متر</span>
          <input
            type="range"
            min={12}
            max={60}
            value={project.pixelsPerMeter ?? DEFAULT_PIXELS_PER_METER}
            onChange={(event) => setPixelsPerMeter(Number(event.target.value))}
            className="w-full"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">طول پیش‌فرض: {wireDraft.lengthMeters.toLocaleString('fa-IR')} متر</span>
          <input
            type="range"
            min={1}
            max={60}
            value={wireDraft.lengthMeters}
            onChange={(event) => setWireDraft({ lengthMeters: Number(event.target.value) })}
            className="w-full"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            onClick={() => clearInvalidWires()}
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"
          >
            پاک‌کردن سیم‌های نامعتبر
          </button>
          <button
            onClick={() => resetWiringForCircuit(selectedCircuitId)}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
          >
            ریست مدار
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <h3 className="text-sm font-bold">بازرس سیم انتخاب‌شده</h3>
          {selectedWire ? (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between rounded-md bg-slate-50 p-2 dark:bg-slate-900">
                <span>از</span>
                <strong>{from ? `${from.node.labelFa} / ${from.terminal.labelFa}` : 'نامشخص'}</strong>
              </div>
              <div className="flex justify-between rounded-md bg-slate-50 p-2 dark:bg-slate-900">
                <span>به</span>
                <strong>{to ? `${to.node.labelFa} / ${to.terminal.labelFa}` : 'نامشخص'}</strong>
              </div>
              <label className="block space-y-1">
                <span>نوع سیم</span>
                <select
                  value={selectedWire.kind ?? 'phase'}
                  onChange={(event) => updateWire(selectedWire.id, { kind: event.target.value as typeof selectedWire.kind })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                >
                  {Object.entries(kindLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span>سایز سیم</span>
                <select
                  value={selectedWire.wireSizeMm2}
                  onChange={(event) => updateWire(selectedWire.id, { wireSizeMm2: Number(event.target.value) })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                >
                  {wires.map((wire) => (
                    <option key={wire.sizeMm2} value={wire.sizeMm2}>
                      {wire.sizeMm2} mm² - {wire.maxAmp} آمپر
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span>طول محاسبه‌شده: {formatNumber(calculateWireGeometryLength(project, selectedWire), 2)} متر</span>
                <input
                  type="range"
                  min={1}
                  max={80}
                  value={selectedWire.manualLengthOverride ?? calculateWireGeometryLength(project, selectedWire)}
                  onChange={(event) => updateWire(selectedWire.id, { manualLengthOverride: Number(event.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-slate-500">این لغزنده override آموزشی است؛ مسیر هندسی همچنان روی نقشه دیده می‌شود.</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-900">مقاومت تقریبی: {formatNumber((selectedWireCatalog?.resistanceOhmPerMeter ?? 0) * calculateWireGeometryLength(project, selectedWire), 4)} اهم</div>
                <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-900">افت ولتاژ: {formatNumber(selectedWireFlow?.voltageDrop ?? 0, 2)} ولت</div>
                <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-900">جریان سیم: {formatNumber(selectedWireFlow?.currentAmp ?? 0, 2)} آمپر</div>
                <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-900">هزینه: {formatToman(selectedWireCost)}</div>
              </div>
              <div className="rounded-md bg-sky-50 p-3 text-sm leading-7 text-sky-900 dark:bg-sky-950 dark:text-sky-100">
                هرچه مسیر سیم طولانی‌تر شود، مقاومت و افت ولتاژ و هزینه سیم بیشتر می‌شود. مسیر مرتب و کوتاه‌تر معمولا اقتصادی‌تر و قابل فهم‌تر است.
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const points = getWirePathPoints(project, selectedWire);
                    if (points.length >= 2) {
                      const a = points[0];
                      const b = points[points.length - 1];
                      addWireBendPoint(selectedWire.id, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
                    }
                  }}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                >
                  افزودن خم وسط مسیر
                </button>
                <button
                  onClick={() => resetWireRoute(selectedWire.id)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                >
                  ریست مسیر
                </button>
                <button
                  onClick={() => updateWire(selectedWire.id, { manualLengthOverride: undefined })}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                >
                  حذف override طول
                </button>
              </div>
              {(selectedWire.routePoints ?? []).map((point, index) => (
                <div key={index} className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-900">
                  <span>خم {(index + 1).toLocaleString('fa-IR')}: {formatNumber(point.x, 0)}, {formatNumber(point.y, 0)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => updateWireBendPoint(selectedWire.id, index, point, true)} className="text-teal-700 dark:text-teal-300">snap</button>
                    <button onClick={() => removeWireBendPoint(selectedWire.id, index)} className="text-rose-700 dark:text-rose-300">حذف</button>
                  </div>
                </div>
              ))}
              <div className={`rounded-md p-3 leading-7 ${validation?.valid && !selectedWireFlow?.overloaded ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100' : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-100'}`}>
                {validation?.valid && !selectedWireFlow?.overloaded
                  ? 'این سیم در مدل آموزشی فعلی از نظر نوع اتصال و جریان عبوری قابل قبول است.'
                  : validation?.messageFa ?? 'این سیم نیاز به بررسی دارد.'}
              </div>
              {selectedWireWarnings.slice(0, 3).map((warning) => (
                <div key={warning.id} className="rounded-md bg-amber-50 p-3 text-sm leading-7 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                  {warning.messageFa}
                </div>
              ))}
              <button
                onClick={() => setDeleteWireId(selectedWire.id)}
                data-testid="delete-wire-button"
                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700"
              >
                حذف سیم
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              روی یک سیم در نقشه کلیک کن تا مشخصات آن را ببینی. اگر هنوز سیمی نداری، حالت سیم‌کشی را فعال کن و دو ترمینال را انتخاب کن.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <h3 className="text-sm font-bold">تمرین‌های آموزشی</h3>
          <div className="mt-3 space-y-2">
            {exercises.map((exercise, index) => (
              <div key={exercise} className="rounded-md bg-slate-50 p-3 text-sm leading-7 dark:bg-slate-900">
                <span className="ml-2 rounded bg-teal-100 px-2 py-1 text-xs text-teal-800 dark:bg-teal-950 dark:text-teal-100">
                  تمرین {(index + 1).toLocaleString('fa-IR')}
                </span>
                {exercise}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-sm">ریست سیم‌کشی اتاق</label>
            <select
              onChange={(event) => event.target.value && resetWiringForRoom(event.target.value)}
              value=""
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">انتخاب اتاق برای ریست</option>
              {project.rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.nameFa}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <AccessibleModal
        open={Boolean(deleteWireId)}
        title="حذف سیم"
        description="این سیم از گراف الکتریکی پروژه حذف می‌شود."
        variant="danger"
        confirmTone="danger"
        confirmLabel="حذف سیم"
        onCancel={() => setDeleteWireId(undefined)}
        onConfirm={() => {
          if (deleteWireId) deleteWire(deleteWireId);
          setDeleteWireId(undefined);
        }}
        testId="delete-wire-modal"
      >
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">حذف سیم ممکن است مسیر فاز یا نول را ناقص کند و باعث هشدار آموزشی شود.</p>
      </AccessibleModal>
    </section>
  );
}

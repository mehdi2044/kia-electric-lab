import { breakers, wires } from '../../data/electricalTables';
import { appliances } from '../../data/appliances';
import { Icon } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import { calculateCircuitLoad, calculateVoltageDrop } from '../safety-engine/electricalMath';
import { generateSafetyWarnings } from '../safety-engine/safetyEngine';
import { formatNumber } from '../../utils/format';

export function CircuitBuilder() {
  const project = useLabStore((state) => state.project);
  const selectedCircuitId = useLabStore((state) => state.selectedCircuitId);
  const selectCircuit = useLabStore((state) => state.selectCircuit);
  const addCircuit = useLabStore((state) => state.addCircuit);
  const updateCircuit = useLabStore((state) => state.updateCircuit);
  const warnings = generateSafetyWarnings(project);
  const selected = project.circuits.find((circuit) => circuit.id === selectedCircuitId) ?? project.circuits[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">مدارساز</h2>
        <button
          onClick={addCircuit}
          className="inline-flex items-center gap-2 rounded-md bg-tealish px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Icon name="Plus" className="h-4 w-4" />
          مدار جدید
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {project.circuits.map((circuit) => {
          const load = calculateCircuitLoad(circuit, project.voltage);
          const hasDanger = warnings.some((warning) => warning.circuitId === circuit.id && warning.severity === 'danger');
          return (
            <button
              key={circuit.id}
              onClick={() => selectCircuit(circuit.id)}
              className={`rounded-lg border p-3 text-right text-sm transition ${
                circuit.id === selectedCircuitId
                  ? 'border-tealish bg-teal-50 dark:bg-teal-950'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">{circuit.nameFa}</span>
                <span className={`rounded px-2 py-1 text-xs ${hasDanger ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'}`}>
                  {hasDanger ? 'نیاز به اصلاح' : 'قابل بررسی'}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {formatNumber(load.totalWattage)} وات - {formatNumber(load.totalCurrent, 2)} آمپر
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600 dark:text-slate-300">نام مدار</span>
              <input
                value={selected.nameFa}
                onChange={(event) => updateCircuit(selected.id, { nameFa: event.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600 dark:text-slate-300">نوع مدار</span>
              <select
                value={selected.kind}
                onChange={(event) => updateCircuit(selected.id, { kind: event.target.value as typeof selected.kind })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="lighting">روشنایی</option>
                <option value="outlet">پریز</option>
                <option value="heavy">مصرف سنگین</option>
                <option value="mixed">مختلط</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600 dark:text-slate-300">سایز سیم</span>
              <select
                value={selected.wireSizeMm2}
                onChange={(event) => updateCircuit(selected.id, { wireSizeMm2: Number(event.target.value) })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              >
                {wires.map((wire) => (
                  <option key={wire.sizeMm2} value={wire.sizeMm2}>
                    {wire.sizeMm2} mm² - تا حدود {wire.maxAmp} آمپر
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600 dark:text-slate-300">فیوز</span>
              <select
                value={selected.breakerAmp}
                onChange={(event) => updateCircuit(selected.id, { breakerAmp: Number(event.target.value) })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              >
                {breakers.map((breaker) => (
                  <option key={breaker.amp} value={breaker.amp}>
                    {breaker.labelFa}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="text-slate-600 dark:text-slate-300">طول تقریبی سیم: {selected.lengthMeters.toLocaleString('fa-IR')} متر</span>
              <input
                type="range"
                min={5}
                max={80}
                value={selected.lengthMeters}
                onChange={(event) => updateCircuit(selected.id, { lengthMeters: Number(event.target.value) })}
                className="w-full"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <div className="rounded-md bg-white p-3 text-sm dark:bg-slate-950">توان: {formatNumber(calculateCircuitLoad(selected).totalWattage)} وات</div>
            <div className="rounded-md bg-white p-3 text-sm dark:bg-slate-950">جریان: {formatNumber(calculateCircuitLoad(selected).totalCurrent, 2)} آمپر</div>
            <div className="rounded-md bg-white p-3 text-sm dark:bg-slate-950">افت ولتاژ: {formatNumber(calculateVoltageDrop(selected), 2)} ولت</div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">وسایل روی این مدار</div>
            <div className="flex flex-wrap gap-2">
              {selected.applianceIds.length ? (
                selected.applianceIds.map((id) => {
                  const appliance = appliances.find((item) => item.id === id);
                  return (
                    <span key={id} className="rounded-md bg-white px-3 py-2 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      {appliance?.nameFa ?? id}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-slate-500">هنوز وسیله‌ای اضافه نشده است.</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

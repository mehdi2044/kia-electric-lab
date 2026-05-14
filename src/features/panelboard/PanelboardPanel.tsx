import { breakers } from '../../data/electricalTables';
import { useLabStore } from '../../store/useLabStore';
import { formatNumber } from '../../utils/format';
import { getPanelBreakers, generatePanelboardWarnings } from '../panelboard-engine/panelboardEngine';
import { calculateCircuitLoad, getWire } from '../safety-engine/electricalMath';

export function PanelboardPanel() {
  const project = useLabStore((state) => state.project);
  const assignCircuitToBreaker = useLabStore((state) => state.assignCircuitToBreaker);
  const updatePanelBreaker = useLabStore((state) => state.updatePanelBreaker);
  const selectCircuit = useLabStore((state) => state.selectCircuit);
  const panelBreakers = getPanelBreakers(project);
  const warnings = generatePanelboardWarnings(project);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">تابلو برق آموزشی</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            نظم تابلو کمک می‌کند بفهمیم هر فیوز از کدام مدار محافظت می‌کند و آیا آمپر فیوز با سیم هماهنگ است یا نه.
          </p>
        </div>
        <div className="rounded-md bg-slate-100 px-3 py-2 text-xs dark:bg-slate-900">
          فیوز اصلی {project.mainBreakerAmp.toLocaleString('fa-IR')} آمپر
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {panelBreakers.map((slot) => {
          const circuit = project.circuits.find((item) => item.id === slot.circuitId);
          const load = circuit ? calculateCircuitLoad(circuit, project.voltage) : undefined;
          const wire = circuit ? getWire(circuit.wireSizeMm2) : undefined;
          const slotWarnings = warnings.filter((warning) => warning.id.includes(slot.id) || warning.circuitId === circuit?.id);
          const danger = slotWarnings.some((warning) => warning.severity === 'danger');

          return (
            <article
              key={slot.id}
              className={`rounded-lg border p-3 ${danger ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'}`}
            >
              <div className="grid gap-3 md:grid-cols-[120px_1fr_140px]">
                <label className="space-y-1 text-sm">
                  <span className="text-slate-500">آمپر فیوز</span>
                  <select
                    value={slot.amp}
                    onChange={(event) => updatePanelBreaker(slot.id, { amp: Number(event.target.value) })}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-950"
                  >
                    {breakers.map((breaker) => (
                      <option key={breaker.amp} value={breaker.amp}>
                        {breaker.amp}A
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-500">مدار متصل</span>
                  <select
                    value={slot.circuitId ?? ''}
                    onChange={(event) => {
                      assignCircuitToBreaker(slot.id, event.target.value || undefined);
                      if (event.target.value) selectCircuit(event.target.value);
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">بدون مدار</option>
                    {project.circuits.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nameFa}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-md bg-white p-2 text-xs leading-6 dark:bg-slate-950">
                  {circuit && load && wire ? (
                    <>
                      <div>بار: {formatNumber(load.totalCurrent, 2)} آمپر</div>
                      <div>سیم: {circuit.wireSizeMm2} mm² تا {wire.maxAmp}A</div>
                    </>
                  ) : (
                    <div>این فیوز هنوز مدار ندارد.</div>
                  )}
                </div>
              </div>
              {slotWarnings.length ? (
                <div className="mt-2 space-y-2">
                  {slotWarnings.slice(0, 2).map((warning) => (
                    <div key={warning.id} className="rounded-md bg-white/70 p-2 text-xs leading-6 text-rose-800 dark:bg-slate-950 dark:text-rose-200">
                      {warning.messageFa}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-md bg-emerald-50 p-2 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
                  این جایگاه تابلو در مدل آموزشی فعلی منظم است.
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-md bg-sky-50 p-3 text-sm leading-7 text-sky-900 dark:bg-sky-950 dark:text-sky-100">
        اگر فیوز از سیم بزرگ‌تر انتخاب شود، ممکن است سیم قبل از قطع شدن فیوز گرم شود. تابلو مرتب کمک می‌کند خطاها سریع‌تر پیدا شوند.
      </div>
    </section>
  );
}

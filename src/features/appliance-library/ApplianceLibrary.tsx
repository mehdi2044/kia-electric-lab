import { appliances } from '../../data/appliances';
import { Icon } from '../../components/Icon';
import { useLabStore } from '../../store/useLabStore';
import type { ComponentType } from '../../types/electrical';

const components: { type: ComponentType; labelFa: string; icon: string }[] = [
  { type: 'outlet', labelFa: 'پریز', icon: 'Plug' },
  { type: 'lamp', labelFa: 'چراغ', icon: 'Lightbulb' },
  { type: 'junction-box', labelFa: 'جعبه تقسیم', icon: 'Box' },
  { type: 'one-way-switch', labelFa: 'کلید تک پل', icon: 'Plug' },
  { type: 'two-gang-switch', labelFa: 'کلید دو پل', icon: 'Plug' }
];

export function ApplianceLibrary() {
  const selectedCircuitId = useLabStore((state) => state.selectedCircuitId);
  const assignApplianceToCircuit = useLabStore((state) => state.assignApplianceToCircuit);

  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">جعبه ابزار</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {components.map((item) => (
            <button
              key={item.type}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-right text-sm text-slate-700 hover:border-tealish hover:bg-teal-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-teal-950"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/kia-component', JSON.stringify(item));
                event.dataTransfer.effectAllowed = 'move';
              }}
              title="روی نقشه بکش"
            >
              <Icon name={item.icon} className="h-4 w-4 text-tealish" />
              {item.labelFa}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">وسایل خانه</h2>
        <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">
          {appliances.map((appliance) => (
            <button
              key={appliance.id}
              className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white p-2 text-right text-sm hover:border-copper hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-amber-950"
              draggable
              onClick={() => assignApplianceToCircuit(selectedCircuitId, appliance.id)}
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  'application/kia-component',
                  JSON.stringify({ type: 'appliance', labelFa: appliance.nameFa, icon: appliance.icon, applianceId: appliance.id })
                );
              }}
              title="با کلیک به مدار انتخاب‌شده اضافه می‌شود"
            >
              <span className="flex items-center gap-2">
                <Icon name={appliance.icon} className="h-4 w-4 text-copper" />
                {appliance.nameFa}
              </span>
              <span className="text-xs text-slate-500">{appliance.watts.toLocaleString('fa-IR')} وات</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

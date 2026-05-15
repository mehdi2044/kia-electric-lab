import type { ElectricalProject, SafetyWarning } from '../../types/electrical';
import { calculateCircuitLoad, getWire, validateBreakerWireCompatibility } from '../safety-engine/electricalMath';

function warning(id: string, severity: SafetyWarning['severity'], titleFa: string, messageFa: string, circuitId?: string): SafetyWarning {
  return { id, severity, titleFa, messageFa, circuitId };
}

export function generatePanelboardWarnings(project: ElectricalProject): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];
  const breakers = getPanelBreakers(project);

  project.circuits.forEach((circuit) => {
    const assignedBreaker = breakers.find((breaker) => breaker.circuitId === circuit.id);
    if (!assignedBreaker) {
      warnings.push(
        warning(
          `panelboard:${circuit.id}:without-breaker`,
          'danger',
          'مدار به فیوز تابلو وصل نیست',
          'هر مدار باید در تابلو به یک فیوز مشخص وصل شود تا هنگام خطا یا اضافه‌بار قابل قطع و پیگیری باشد.',
          circuit.id
        )
      );
      return;
    }

    const load = calculateCircuitLoad(circuit, project.voltage);
    if (load.totalCurrent > assignedBreaker.amp) {
      warnings.push(
        warning(
          `panelboard:${assignedBreaker.id}:overloaded`,
          'danger',
          'فیوز تابلو اضافه‌بار دارد',
          'جریان این مدار از آمپر فیوزی که در تابلو برای آن انتخاب شده بیشتر است.',
          circuit.id
        )
      );
    }

    if (assignedBreaker.amp > getWire(circuit.wireSizeMm2).maxAmp || !validateBreakerWireCompatibility({ ...circuit, breakerAmp: assignedBreaker.amp })) {
      warnings.push(
        warning(
          `panelboard:${assignedBreaker.id}:wire-incompatible`,
          'danger',
          'فیوز با سایز سیم هماهنگ نیست',
          'فیوز باید قبل از داغ شدن سیم مدار را قطع کند. اگر آمپر فیوز از ظرفیت سیم بیشتر باشد، حفاظت کافی ایجاد نمی‌شود.',
          circuit.id
        )
      );
    }
  });

  breakers
    .filter((breaker) => !breaker.circuitId)
    .forEach((breaker) => {
      warnings.push(
        warning(
          `panelboard:${breaker.id}:empty-breaker`,
          'info',
          'فیوز بدون مدار است',
          'این جایگاه فیوز فعلا به هیچ مدار وصل نیست. برای نظم تابلو، فیوزهای خالی را برچسب‌گذاری یا حذف کن.'
        )
      );
    });

  return warnings;
}

export function getPanelBreakers(project: ElectricalProject) {
  if (project.panelboard?.breakers?.length) return project.panelboard.breakers;
  return project.circuits.map((circuit, index) => ({
    id: `slot-${index + 1}`,
    labelFa: `فیوز ${index + 1}`,
    amp: circuit.breakerAmp,
    circuitId: circuit.id
  }));
}

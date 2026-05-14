import { appliances } from '../../data/appliances';
import { wires } from '../../data/electricalTables';
import type { Circuit, ElectricalProject, SafetyWarning } from '../../types/electrical';
import {
  calculateCircuitLoad,
  calculateVoltageDrop,
  getAppliancesByIds,
  getProjectLoads,
  getWire,
  validateBreakerWireCompatibility,
  validateWireCapacity
} from './electricalMath';

function warning(
  id: string,
  severity: SafetyWarning['severity'],
  titleFa: string,
  messageFa: string,
  circuitId?: string,
  roomId?: string
): SafetyWarning {
  return { id, severity, titleFa, messageFa, circuitId, roomId };
}

export function isWireOverdesigned(circuit: Circuit): boolean {
  const { totalCurrent } = calculateCircuitLoad(circuit);
  const currentWire = getWire(circuit.wireSizeMm2);
  const smallerSafeWire = wires.some((wire) => wire.sizeMm2 < currentWire.sizeMm2 && wire.maxAmp >= totalCurrent);
  return smallerSafeWire && totalCurrent > 0;
}

export function generateSafetyWarnings(project: ElectricalProject): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];
  const projectLoad = getProjectLoads(project);

  if (projectLoad.totalCurrent > project.mainBreakerAmp) {
    warnings.push(
      warning(
        'home-overload',
        'danger',
        'مصرف کل خانه زیاد است',
        'جریان کل از فیوز اصلی ۲۵ آمپر بیشتر شده است. در دنیای واقعی این وضعیت می‌تواند باعث قطع فیوز یا خطر گرمای بیش از حد شود.'
      )
    );
  }

  project.circuits.forEach((circuit) => {
    const { totalCurrent, totalWattage } = calculateCircuitLoad(circuit, project.voltage);
    const circuitAppliances = getAppliancesByIds(circuit.applianceIds);
    const heavyAppliances = circuitAppliances.filter((appliance) => appliance.category === 'heavy');
    const hasLight = circuitAppliances.some((appliance) => appliance.category === 'light');
    const hasOutletLoad = circuitAppliances.some((appliance) => appliance.category !== 'light');

    if (totalCurrent > circuit.breakerAmp) {
      warnings.push(
        warning(
          `${circuit.id}-breaker-overload`,
          'danger',
          'جریان مدار از فیوز بیشتر است',
          'جمع مصرف این مدار زیاد است و از ظرفیت فیوز بالاتر رفته است. بهتر است بار را کم کنی یا مدار جدا بسازی.',
          circuit.id
        )
      );
    }

    if (!validateWireCapacity(circuit, project.voltage)) {
      warnings.push(
        warning(
          `${circuit.id}-thin-wire`,
          'danger',
          'سیم برای این جریان نازک است',
          'این سیم برای این مقدار جریان مناسب نیست. ممکن است در مصرف طولانی‌مدت گرم شود و خطر آتش‌سوزی ایجاد کند.',
          circuit.id
        )
      );
    }

    if (!validateBreakerWireCompatibility(circuit)) {
      warnings.push(
        warning(
          `${circuit.id}-large-breaker`,
          'danger',
          'فیوز نسبت به سیم بزرگ است',
          'فیوز باید قبل از داغ شدن سیم مدار را قطع کند. این فیوز برای این سیم بیش از حد بزرگ است و از سیم محافظت کافی نمی‌کند.',
          circuit.id
        )
      );
    }

    if (heavyAppliances.length > 1) {
      warnings.push(
        warning(
          `${circuit.id}-many-heavy`,
          'warning',
          'چند مصرف‌کننده سنگین روی یک مدار است',
          'جمع مصرف این مدار زیاد است. بهتر است مصرف‌کننده‌های سنگین مانند ماشین ظرف‌شویی، لباس‌شویی و فر روی مدارهای جدا باشند.',
          circuit.id
        )
      );
    }

    if (hasLight && hasOutletLoad) {
      warnings.push(
        warning(
          `${circuit.id}-mixed-light-outlet`,
          'warning',
          'روشنایی و پریز با هم مخلوط شده‌اند',
          'برای آموزش بهتر و عیب‌یابی ساده‌تر، مدار روشنایی و مدار پریز را جدا نگه دار.',
          circuit.id
        )
      );
    }

    if (calculateVoltageDrop(circuit, project.voltage) > project.voltage * 0.04 && totalWattage > 0) {
      warnings.push(
        warning(
          `${circuit.id}-voltage-drop`,
          'warning',
          'افت ولتاژ قابل توجه است',
          'طول سیم و جریان باعث افت ولتاژ شده است. در مدارهای بلند باید اندازه سیم و مسیر سیم‌کشی را با دقت بررسی کرد.',
          circuit.id
        )
      );
    }

    if (isWireOverdesigned(circuit)) {
      warnings.push(
        warning(
          `${circuit.id}-overdesign`,
          'info',
          'سیم بیش از نیاز انتخاب شده است',
          'از نظر فنی کار می‌کند، اما برای این مصرف بیش از حد گران است. می‌توانی با سیم مناسب‌تر هزینه را کاهش بدهی.',
          circuit.id
        )
      );
    }
  });

  const fridgeCircuit = project.circuits.find((circuit) => circuit.applianceIds.includes('fridge'));
  if (!fridgeCircuit || fridgeCircuit.applianceIds.length > 2) {
    warnings.push(
      warning(
        'fridge-dedicated',
        'warning',
        'یخچال مدار پایدار می‌خواهد',
        'یخچال بهتر است روی مدار اختصاصی یا حداقل مدار کم‌نوسان باشد تا با روشن شدن مصرف‌کننده‌های سنگین دچار مشکل نشود.'
      )
    );
  }

  const kitchenCircuits = project.circuits.filter((circuit) => circuit.roomIds.includes('kitchen'));
  if (kitchenCircuits.length < 2) {
    warnings.push(
      warning(
        'kitchen-too-few-circuits',
        'warning',
        'آشپزخانه مدار کم دارد',
        'آشپزخانه معمولا چند مصرف‌کننده پرقدرت دارد. برای آموزش بهتر، حداقل دو مدار جدا برای آشپزخانه در نظر بگیر.',
        undefined,
        'kitchen'
      )
    );
  }

  const bathroomOutlet = project.components.some((component) => component.roomId === 'bath' && component.type === 'outlet');
  if (bathroomOutlet) {
    warnings.push(
      warning(
        'bathroom-risk',
        'danger',
        'پریز حمام ناحیه پرخطر است',
        'حمام به دلیل رطوبت ناحیه پرخطر است. در دنیای واقعی نصب پریز باید با استاندارد، فاصله ایمن و حفاظت جان بررسی شود.',
        undefined,
        'bath'
      )
    );
  }

  const unknownApplianceIds = project.circuits
    .flatMap((circuit) => circuit.applianceIds)
    .filter((id) => !appliances.some((appliance) => appliance.id === id));
  if (unknownApplianceIds.length) {
    warnings.push(
      warning('unknown-appliance', 'info', 'وسیله ناشناخته', 'یک یا چند وسیله در کتابخانه آموزشی پیدا نشد و در محاسبه بار وارد نشده است.')
    );
  }

  return warnings;
}

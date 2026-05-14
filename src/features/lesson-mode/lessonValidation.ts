import { appliances } from '../../data/appliances';
import type { Circuit, ElectricalComponent, ElectricalProject, LessonScore } from '../../types/electrical';
import { calculateProjectCost } from '../cost-engine/costEngine';
import { generatePanelboardWarnings } from '../panelboard-engine/panelboardEngine';
import { generateSafetyWarnings } from '../safety-engine/safetyEngine';
import { buildTopologyGraph, traverseFromTerminal } from '../topology-engine/topologyEngine';
import { terminalKey } from '../topology-engine/types';
import { getLessonById, type LessonDefinition } from './lessonEngine';

export interface LessonValidationResult {
  lessonId: string;
  passed: boolean;
  completedStepIds: string[];
  feedbackFa: string[];
  nextActionFa: string;
  score: LessonScore;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function circuitComponents(project: ElectricalProject, circuit: Circuit): ElectricalComponent[] {
  return circuit.componentIds
    .map((componentId) => project.components.find((component) => component.id === componentId))
    .filter((component): component is ElectricalComponent => Boolean(component));
}

function hasComponent(project: ElectricalProject, circuit: Circuit, type: ElectricalComponent['type'], count = 1): boolean {
  return circuitComponents(project, circuit).filter((component) => component.type === type).length >= count;
}

function circuitHasDanger(project: ElectricalProject, circuitId: string): boolean {
  const lessonHandledTopologyIds = [':phase-open', ':neutral-open', ':incomplete-loop', ':invalid-switch-wiring'];
  return generateSafetyWarnings(project).some(
    (warning) =>
      warning.circuitId === circuitId &&
      warning.severity === 'danger' &&
      !lessonHandledTopologyIds.some((handledId) => warning.id.includes(handledId))
  );
}

function breakerAssigned(project: ElectricalProject, circuitId: string): boolean {
  return Boolean(project.panelboard?.breakers.some((breaker) => breaker.circuitId === circuitId));
}

function terminalReachable(project: ElectricalProject, circuitId: string, fromComponentId: string, fromTerminalId: string, toComponentId: string, toTerminalId: string): boolean {
  const { graph } = buildTopologyGraph(project);
  return traverseFromTerminal(graph, { componentId: fromComponentId, terminalId: fromTerminalId }, circuitId).has(
    terminalKey({ componentId: toComponentId, terminalId: toTerminalId })
  );
}

function heavyApplianceCount(circuit: Circuit): number {
  return circuit.applianceIds.filter((id) => appliances.find((appliance) => appliance.id === id)?.category === 'heavy').length;
}

function baseScore(project: ElectricalProject, passedChecks: number, totalChecks: number, hintsUsed = 0): LessonScore {
  const safetyWarnings = generateSafetyWarnings(project);
  const dangerCount = safetyWarnings.filter((warning) => warning.severity === 'danger').length;
  const warningCount = safetyWarnings.filter((warning) => warning.severity === 'warning').length;
  const overdesignCost = calculateProjectCost(project).overdesignCost;
  const technical = clampScore((passedChecks / Math.max(1, totalChecks)) * 100);
  const safety = clampScore(100 - dangerCount * 18 - warningCount * 6);
  const cost = clampScore(100 - Math.min(45, overdesignCost / 25000));
  const learning = clampScore(100 - hintsUsed * 7 + (technical >= 80 ? 5 : 0));
  return {
    technical,
    safety,
    cost,
    learning,
    final: clampScore(technical * 0.4 + safety * 0.3 + cost * 0.15 + learning * 0.15)
  };
}

function result(lesson: LessonDefinition, checks: Array<[boolean, string, string]>, project: ElectricalProject, hintsUsed = 0): LessonValidationResult {
  const completedStepIds = checks.map(([passed], index) => (passed ? lesson.steps[index]?.id : undefined)).filter((id): id is string => Boolean(id));
  const failed = checks.filter(([passed]) => !passed).map(([, message]) => message);
  const positive = checks.filter(([passed]) => passed).map(([, , message]) => message);
  const score = baseScore(project, checks.filter(([passed]) => passed).length, checks.length, hintsUsed);
  const passed = failed.length === 0;
  return {
    lessonId: lesson.id,
    passed,
    completedStepIds,
    feedbackFa: passed ? ['آفرین، مسیر آموزشی این درس کامل شد.', ...positive.slice(0, 2)] : failed,
    nextActionFa: passed ? 'می‌توانی درس بعدی را شروع کنی یا همین مدار را با مسیر کوتاه‌تر بهتر کنی.' : failed[0] ?? 'یک بار دیگر مدار را بررسی کن.',
    score: { ...score, final: passed ? score.final : Math.min(score.final, 74) }
  };
}

function validateOutletReachability(project: ElectricalProject, circuit: Circuit): boolean {
  return circuitComponents(project, circuit)
    .filter((component) => component.type === 'outlet')
    .some(
      (outlet) =>
        terminalReachable(project, circuit.id, `breaker:${circuit.id}`, 'load-out', outlet.id, 'phase') &&
        terminalReachable(project, circuit.id, 'main-panel', 'neutral-source', outlet.id, 'neutral')
    );
}

function controlledLampCount(project: ElectricalProject, circuit: Circuit, switchType: 'one-way-switch' | 'two-gang-switch'): number {
  const components = circuitComponents(project, circuit);
  const switchComponent = components.find((component) => component.type === switchType);
  if (!switchComponent) return 0;
  const breakerFeedsSwitch = terminalReachable(project, circuit.id, `breaker:${circuit.id}`, 'load-out', switchComponent.id, 'line-in');
  if (!breakerFeedsSwitch) return 0;
  const outputTerminals = switchType === 'two-gang-switch' ? ['line-out-1', 'line-out-2'] : ['line-out'];
  return components
    .filter((component) => component.type === 'lamp')
    .filter((lamp, index) => {
      const output = outputTerminals[index % outputTerminals.length];
      const switchedPhase = terminalReachable(project, circuit.id, switchComponent.id, output, lamp.id, 'phase');
      const neutral = terminalReachable(project, circuit.id, 'main-panel', 'neutral-source', lamp.id, 'neutral');
      return switchedPhase && neutral;
    }).length;
}

export function validateLesson(project: ElectricalProject, lessonId: string, hintsUsed = 0): LessonValidationResult {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    return {
      lessonId,
      passed: false,
      completedStepIds: [],
      feedbackFa: ['این درس در برنامه پیدا نشد.'],
      nextActionFa: 'یک درس دیگر انتخاب کن.',
      score: { technical: 0, safety: 0, cost: 0, learning: 0, final: 0 }
    };
  }

  const lightingCircuits = project.circuits.filter((circuit) => circuit.kind === 'lighting');
  const outletCircuits = project.circuits.filter((circuit) => circuit.kind === 'outlet' || circuit.kind === 'heavy');
  const kitchenCircuits = project.circuits.filter((circuit) => circuit.roomIds.includes('kitchen'));
  const panelWarnings = generatePanelboardWarnings(project);

  switch (lesson.id) {
    case 'lesson-1-one-way-lamp': {
      const circuit = lightingCircuits.find((item) => hasComponent(project, item, 'lamp') && hasComponent(project, item, 'one-way-switch'));
      return result(lesson, [
        [Boolean(circuit), 'یک چراغ و یک کلید تک‌پل را داخل یک مدار روشنایی قرار بده.', 'مدار چراغ و کلید پیدا شد.'],
        [Boolean(circuit && controlledLampCount(project, circuit, 'one-way-switch') >= 1), 'چراغ هنوز از خروجی کلید تک‌پل و نول تابلو مسیر کامل ندارد.', 'چراغ از کلید تک‌پل کنترل می‌شود و نول دارد.'],
        [Boolean(circuit && !circuitHasDanger(project, circuit.id)), 'این مدار هنوز هشدار خطر مرتبط دارد؛ اول آن را اصلاح کن.', 'مدار هشدار خطر مرتبط ندارد.']
      ], project, hintsUsed);
    }
    case 'lesson-2-two-gang-two-lamps': {
      const circuit = lightingCircuits.find((item) => hasComponent(project, item, 'lamp', 2) && hasComponent(project, item, 'two-gang-switch'));
      return result(lesson, [
        [Boolean(circuit), 'دو چراغ و یک کلید دوپل را داخل یک مدار روشنایی بگذار.', 'دو چراغ و کلید دوپل در یک مدار هستند.'],
        [Boolean(circuit && controlledLampCount(project, circuit, 'two-gang-switch') >= 2), 'هر دو چراغ هنوز از خروجی‌های کلید دوپل و نول تابلو مسیر کامل ندارند.', 'دو چراغ با خروجی‌های کلید دوپل کنترل می‌شوند.'],
        [Boolean(circuit && !circuitHasDanger(project, circuit.id)), 'مدار دوپل هنوز هشدار خطر مرتبط دارد.', 'مدار دوپل هشدار خطر ندارد.']
      ], project, hintsUsed);
    }
    case 'lesson-3-standard-outlet': {
      const circuit = outletCircuits.find((item) => hasComponent(project, item, 'outlet'));
      return result(lesson, [
        [Boolean(circuit), 'یک پریز را داخل مدار پریز قرار بده.', 'پریز در مدار پریز پیدا شد.'],
        [Boolean(circuit && validateOutletReachability(project, circuit)), 'فاز و نول پریز هنوز کامل به تابلو و فیوز نمی‌رسند.', 'پریز مسیر فاز و نول کامل دارد.'],
        [Boolean(circuit && circuit.wireSizeMm2 >= 2.5 && circuit.breakerAmp <= 16), 'برای پریز آموزشی از سیم ۲.۵ و فیوز حدود ۱۶ آمپر استفاده کن.', 'سیم و فیوز پریز مناسب هستند.']
      ], project, hintsUsed);
    }
    case 'lesson-4-fridge-dedicated': {
      const circuit = project.circuits.find((item) => item.applianceIds.includes('fridge'));
      return result(lesson, [
        [Boolean(circuit), 'یخچال را روی یک مدار مشخص قرار بده.', 'مدار یخچال پیدا شد.'],
        [Boolean(circuit && circuit.applianceIds.length <= 2 && heavyApplianceCount(circuit) === 0), 'یخچال را از وسایل سنگین مثل فر یا کتری جدا کن.', 'مدار یخچال سبک و پایدار است.'],
        [Boolean(circuit && breakerAssigned(project, circuit.id)), 'برای مدار یخچال یک فیوز تابلو مشخص کن.', 'مدار یخچال در تابلو فیوز مشخص دارد.']
      ], project, hintsUsed);
    }
    case 'lesson-5-kitchen-heavy-loads': {
      return result(lesson, [
        [kitchenCircuits.length >= 2, 'برای آشپزخانه حداقل دو مدار جدا بساز.', 'آشپزخانه چند مدار دارد.'],
        [kitchenCircuits.every((circuit) => heavyApplianceCount(circuit) <= 1), 'مصرف‌کننده‌های سنگین آشپزخانه را روی یک مدار جمع نکن.', 'بارهای سنگین تقسیم شده‌اند.'],
        [kitchenCircuits.every((circuit) => !circuitHasDanger(project, circuit.id)), 'یکی از مدارهای آشپزخانه هشدار خطر دارد.', 'مدارهای آشپزخانه هشدار خطر مرتبط ندارند.']
      ], project, hintsUsed);
    }
    case 'lesson-6-wire-size-comparison': {
      const sizes = new Set(project.circuits.map((circuit) => circuit.wireSizeMm2));
      return result(lesson, [
        [sizes.has(1.5), 'یک مدار با سیم ۱.۵ میلی‌متر بساز یا انتخاب کن.', 'سیم ۱.۵ در پروژه دیده شد.'],
        [sizes.has(2.5), 'یک مدار با سیم ۲.۵ میلی‌متر بساز یا انتخاب کن.', 'سیم ۲.۵ در پروژه دیده شد.'],
        [sizes.has(4), 'یک مدار با سیم ۴ میلی‌متر برای مقایسه اضافه کن.', 'سیم ۴ در پروژه دیده شد.'],
        [!generateSafetyWarnings(project).some((warning) => warning.id.includes('thin-wire')), 'حداقل یک مدار سیم نازک‌تر از نیاز دارد.', 'هشدار سیم نازک وجود ندارد.']
      ], project, hintsUsed);
    }
    case 'lesson-7-breaker-selection': {
      return result(lesson, [
        [!generateSafetyWarnings(project).some((warning) => warning.id.includes('large-breaker')), 'حداقل یک فیوز برای سیم انتخاب‌شده خیلی بزرگ است.', 'فیوزها از سیم‌ها محافظت می‌کنند.'],
        [!generateSafetyWarnings(project).some((warning) => warning.id.includes('breaker-overload')), 'حداقل یک مدار از فیوز خودش جریان بیشتری می‌کشد.', 'مدارها از فیوز خودشان بیشتر نمی‌کشند.'],
        [panelWarnings.every((warning) => !warning.id.includes('without-breaker')), 'بعضی مدارها هنوز فیوز تابلو ندارند.', 'مدارها در تابلو مشخص هستند.']
      ], project, hintsUsed);
    }
    case 'lesson-8-better-routing-cost': {
      const cost = calculateProjectCost(project);
      const explicitRoutedWire = (project.wires ?? []).some((wire) => (wire.routePoints ?? []).length > 0);
      return result(lesson, [
        [explicitRoutedWire, 'حداقل یک سیم explicit با نقطه مسیر بکش تا طول هندسی معنی داشته باشد.', 'سیم مسیر‌دار وجود دارد.'],
        [cost.overdesignCost < 250000, 'هزینه طراحی اضافه زیاد است؛ سیم یا مسیر را منطقی‌تر انتخاب کن.', 'هزینه اضافه طراحی قابل قبول است.'],
        [!generateSafetyWarnings(project).some((warning) => warning.severity === 'danger'), 'برای کم کردن هزینه، ایمنی را خراب نکن؛ هنوز هشدار خطر وجود دارد.', 'کاهش هزینه همراه با ایمنی انجام شده است.']
      ], project, hintsUsed);
    }
    default:
      return result(lesson, [[false, 'اعتبارسنجی این درس هنوز پیاده‌سازی نشده است.', '']], project, hintsUsed);
  }
}

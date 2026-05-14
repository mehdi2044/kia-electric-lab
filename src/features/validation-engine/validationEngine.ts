import type { ElectricalComponent, ElectricalProject, SafetyWarning } from '../../types/electrical';
import { simulateCurrentFlow } from '../current-engine/currentEngine';
import { buildTopologyGraph, createTerminalLookup, traverseFromTerminal } from '../topology-engine/topologyEngine';
import { terminalKey } from '../topology-engine/types';

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

export function generateTopologyWarnings(project: ElectricalProject): SafetyWarning[] {
  const { graph, issues } = buildTopologyGraph(project);
  const lookup = createTerminalLookup(graph);
  const flow = simulateCurrentFlow(project);
  const warnings: SafetyWarning[] = issues.map((issue) =>
    warning(`topology:${issue.id}`, issue.severity, issue.titleFa, issue.messageFa, issue.circuitId)
  );

  project.circuits.forEach((circuit) => {
    const breakerLine = { componentId: `breaker:${circuit.id}`, terminalId: 'line-in' };
    const breakerLoad = { componentId: `breaker:${circuit.id}`, terminalId: 'load-out' };
    const panelPhase = { componentId: 'main-panel', terminalId: 'phase-source' };
    const panelNeutral = { componentId: 'main-panel', terminalId: 'neutral-source' };
    const hasBreakerLine = lookup.has(terminalKey(breakerLine));
    const hasBreakerLoad = lookup.has(terminalKey(breakerLoad));

    if (!hasBreakerLine || !hasBreakerLoad) {
      warnings.push(
        warning(
          `topology:${circuit.id}:missing-breaker`,
          'danger',
          'فیوز مدار در گراف الکتریکی کامل نیست',
          'هر مدار باید یک مسیر فاز داشته باشد که از تابلو وارد فیوز شود و بعد از خروجی فیوز به مصرف‌کننده‌ها برسد.',
          circuit.id
        )
      );
      return;
    }

    const breakerInputReachable = traverseFromTerminal(graph, panelPhase, circuit.id).has(terminalKey(breakerLine));
    if (!breakerInputReachable) {
      warnings.push(
        warning(
          `topology:${circuit.id}:invalid-breaker-placement`,
          'danger',
          'فیوز در جای درست مسیر فاز نیست',
          'فیوز باید در مسیر فاز و قبل از مصرف‌کننده‌ها قرار بگیرد. اگر فیوز از مسیر اصلی جدا باشد، در زمان خطر نمی‌تواند مدار را درست قطع کند.',
          circuit.id
        )
      );
    }

    const circuitLoads = flow.loads.filter((load) => load.circuitId === circuit.id);
    if (circuitLoads.length === 0 && circuit.applianceIds.length > 0) {
      warnings.push(
        warning(
          `topology:${circuit.id}:load-without-component`,
          'warning',
          'وسیله مصرف‌کننده روی نقشه ترمینال ندارد',
          'یک وسیله به مدار اضافه شده، اما به عنوان قطعه دارای ترمینال روی نقشه قرار نگرفته است. برای شبیه‌سازی واقعی، مصرف‌کننده باید فاز و نول داشته باشد.',
          circuit.id
        )
      );
    }

    circuitLoads.forEach((load) => {
      if (!load.phaseConnected) {
        warnings.push(
          warning(
            `topology:${circuit.id}:${load.componentId}:phase-open`,
            'danger',
            'فاز به مصرف‌کننده نمی‌رسد',
            'این مصرف‌کننده به خروجی فیوز وصل نیست. مدار باز است و وسیله در این مدل روشن نمی‌شود.',
            circuit.id
          )
        );
      }

      if (!load.neutralConnected) {
        warnings.push(
          warning(
            `topology:${circuit.id}:${load.componentId}:neutral-open`,
            'danger',
            'نول مصرف‌کننده قطع است',
            'برای کار کردن مدار، جریان باید از فاز به مصرف‌کننده برسد و از مسیر نول برگردد. اینجا مسیر برگشت کامل نیست.',
            circuit.id
          )
        );
      }

      if (!load.phaseConnected || !load.neutralConnected) {
        warnings.push(
          warning(
            `topology:${circuit.id}:${load.componentId}:incomplete-loop`,
            'danger',
            'حلقه مدار کامل نیست',
            'مدار فقط وقتی کار می‌کند که مسیر رفت و برگشت کامل باشد. اگر فاز یا نول قطع باشد، حلقه جریان ناقص است.',
            circuit.id
          )
        );
      }
    });

    const circuitComponents = circuit.componentIds
      .map((componentId) => project.components.find((component) => component.id === componentId))
      .filter((component): component is ElectricalComponent => Boolean(component));
    const lampPhaseKeys = new Set(
      circuitComponents
        .filter((component) => component.type === 'lamp')
        .map((component) => terminalKey({ componentId: component.id, terminalId: 'phase' }))
    );

    circuitComponents
      .filter((component) => component.type === 'one-way-switch' || component.type === 'two-gang-switch')
      .forEach((component) => {
        const lineIn = { componentId: component.id, terminalId: 'line-in' };
        const lineInReachable = traverseFromTerminal(graph, breakerLoad, circuit.id).has(terminalKey(lineIn));
        if (!lineInReachable) {
          warnings.push(
            warning(
              `topology:${circuit.id}:${component.id}:switch-input-open`,
              'danger',
              'ورودی کلید به فاز مدار وصل نیست',
              'کلید باید فاز را قطع و وصل کند. اگر ورودی کلید به فاز خروجی فیوز نرسد، روشنایی درست کنترل نمی‌شود.',
              circuit.id
            )
          );
        }

        const outputTerminals = component.type === 'two-gang-switch' ? ['line-out-1', 'line-out-2'] : ['line-out'];
        const controlsLamp = outputTerminals.some((terminalId) => {
          const reachable = traverseFromTerminal(graph, { componentId: component.id, terminalId }, circuit.id);
          return [...lampPhaseKeys].some((lampKey) => reachable.has(lampKey));
        });
        if (circuit.kind === 'lighting' && lampPhaseKeys.size > 0 && !controlsLamp) {
          warnings.push(
            warning(
              `topology:${circuit.id}:${component.id}:invalid-switch-wiring`,
              'warning',
              'خروجی کلید به چراغ نرسیده است',
              'در مدار روشنایی، خروجی کلید باید به فاز چراغ برسد. اینجا کلید در گراف وجود دارد اما مسیر کنترل چراغ کامل نیست.',
              circuit.id
            )
          );
        }
      });
  });

  graph.wires.forEach((wire) => {
    const from = lookup.get(terminalKey(wire.from));
    const to = lookup.get(terminalKey(wire.to));
    if (!from || !to) return;
    const roles = new Set([from.terminal.energizedRole, to.terminal.energizedRole]);
    if (roles.has('phase') && roles.has('neutral')) {
      warnings.push(
        warning(
          `topology:${wire.id}:short-circuit`,
          'danger',
          'اتصال کوتاه فاز و نول',
          'در این مسیر فاز و نول مستقیم به هم وصل شده‌اند. اتصال کوتاه بسیار خطرناک است و در دنیای واقعی باید باعث قطع فوری حفاظت شود.',
          wire.circuitId
        )
      );
    }
  });

  flow.circuits.forEach((circuitFlow) => {
    if (circuitFlow.overloaded) {
      warnings.push(
        warning(
          `topology:${circuitFlow.circuitId}:breaker-overload`,
          'danger',
          'جریان واقعی گراف از فیوز بیشتر است',
          'با جمع جریان شاخه‌های وصل‌شده در گراف، جریان این مدار از ظرفیت فیوز بیشتر شده است.',
          circuitFlow.circuitId
        )
      );
    }
  });

  flow.wires.forEach((wireFlow) => {
    if (wireFlow.overloaded) {
      warnings.push(
        warning(
          `topology:${wireFlow.wireId}:wire-overload`,
          'danger',
          'جریان عبوری از سیم زیاد است',
          'در شبیه‌سازی گراف، جریان عبوری از این سیم از ظرفیت آموزشی آن بیشتر شده است و باید مسیر یا سایز سیم اصلاح شود.',
          wireFlow.circuitId
        )
      );
    }
  });

  return warnings;
}

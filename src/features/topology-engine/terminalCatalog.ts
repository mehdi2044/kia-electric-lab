import type { ElectricalComponent } from '../../types/electrical';
import type { ElectricalTerminal, TopologyNode } from './types';

const terminal = (
  componentId: string,
  id: string,
  role: ElectricalTerminal['role'],
  labelFa: string,
  energizedRole: ElectricalTerminal['energizedRole']
): ElectricalTerminal => ({ id, componentId, role, labelFa, energizedRole });

export function createMainPanelNode(componentId = 'main-panel'): TopologyNode {
  return {
    id: componentId,
    componentType: 'main-panel',
    labelFa: 'تابلو اصلی',
    roomId: 'panel',
    source: true,
    terminals: [
      terminal(componentId, 'phase-source', 'phase-source', 'فاز ورودی', 'phase'),
      terminal(componentId, 'neutral-source', 'neutral-source', 'نول ورودی', 'neutral')
    ]
  };
}

export function createVirtualBreakerNode(circuitId: string, breakerAmp: number, labelFa: string): TopologyNode {
  const componentId = `breaker:${circuitId}`;
  return {
    id: componentId,
    componentType: 'virtual-breaker',
    labelFa,
    circuitId,
    breakerAmp,
    terminals: [
      terminal(componentId, 'line-in', 'breaker-line', 'ورودی فیوز', 'phase'),
      terminal(componentId, 'load-out', 'breaker-load', 'خروجی فیوز', 'phase')
    ]
  };
}

export function createComponentNode(component: ElectricalComponent): TopologyNode {
  return {
    id: component.id,
    componentType: component.type,
    labelFa: component.labelFa,
    roomId: component.roomId,
    circuitId: component.circuitId,
    applianceId: component.applianceId,
    terminals: createTerminalsForComponent(component)
  };
}

export function createTerminalsForComponent(component: ElectricalComponent): ElectricalTerminal[] {
  switch (component.type) {
    case 'main-panel':
      return createMainPanelNode(component.id).terminals;
    case 'breaker':
      return [
        terminal(component.id, 'line-in', 'breaker-line', 'ورودی فیوز', 'phase'),
        terminal(component.id, 'load-out', 'breaker-load', 'خروجی فیوز', 'phase')
      ];
    case 'one-way-switch':
      return [
        terminal(component.id, 'line-in', 'switch-line', 'ورودی کلید', 'phase'),
        terminal(component.id, 'line-out', 'switch-load', 'خروجی کلید', 'phase')
      ];
    case 'two-gang-switch':
      return [
        terminal(component.id, 'line-in', 'switch-line', 'ورودی مشترک کلید', 'phase'),
        terminal(component.id, 'line-out-1', 'switch-load', 'خروجی اول', 'phase'),
        terminal(component.id, 'line-out-2', 'switch-load', 'خروجی دوم', 'phase')
      ];
    case 'junction-box':
      return [
        terminal(component.id, 'phase', 'junction', 'اتصال فاز', 'junction'),
        terminal(component.id, 'neutral', 'junction', 'اتصال نول', 'junction')
      ];
    case 'outlet':
    case 'lamp':
    case 'appliance':
      return [
        terminal(component.id, 'phase', 'phase', 'ترمینال فاز', 'phase'),
        terminal(component.id, 'neutral', 'neutral', 'ترمینال نول', 'neutral')
      ];
    case 'wire-path':
      return [
        terminal(component.id, 'a', 'junction', 'ابتدای مسیر', 'junction'),
        terminal(component.id, 'b', 'junction', 'انتهای مسیر', 'junction')
      ];
  }
}

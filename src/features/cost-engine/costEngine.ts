import { breakers, unitCosts } from '../../data/electricalTables';
import type { Circuit, CostItem, ElectricalProject } from '../../types/electrical';
import { calculateCircuitLoad, getWire } from '../safety-engine/electricalMath';
import { isWireOverdesigned } from '../safety-engine/safetyEngine';
import { calculateWireGeometryLength } from '../topology-engine/wireGeometry';

export function calculateCircuitCost(circuit: Circuit, project?: ElectricalProject) {
  const wire = getWire(circuit.wireSizeMm2);
  const breaker = breakers.find((item) => item.amp === circuit.breakerAmp) ?? breakers[0];
  const points = project?.components.filter((component) => circuit.componentIds.includes(component.id)) ?? [];
  const explicitWires = (project?.wires ?? []).filter((item) => item.circuitId === circuit.id);
  const geometricWireLength = explicitWires.reduce((sum, item) => sum + calculateWireGeometryLength(project!, item), 0);
  const costLengthMeters = explicitWires.length ? geometricWireLength : circuit.lengthMeters;
  const explicitWireMaterialCost = explicitWires.reduce((sum, item) => {
    const catalogWire = getWire(item.wireSizeMm2);
    return sum + calculateWireGeometryLength(project!, item) * catalogWire.pricePerMeter;
  }, 0);
  const wireMaterialCost = explicitWires.length ? explicitWireMaterialCost : costLengthMeters * wire.pricePerMeter;
  const outletCount = points.filter((point) => point.costPointType === 'outlet').length;
  const switchCount = points.filter((point) => point.costPointType === 'switch').length;
  const lampCount = points.filter((point) => point.costPointType === 'lamp').length;
  const junctionCount = Math.max(1, Math.ceil(points.length / 4));

  const items: CostItem[] = [
    { labelFa: explicitWires.length ? 'سیم‌ها بر اساس مسیر هندسی' : `سیم ${wire.sizeMm2} میلی‌متر مربع`, quantity: costLengthMeters, unitPrice: explicitWires.length ? 1 : wire.pricePerMeter, total: wireMaterialCost, category: 'material' },
    { labelFa: `فیوز ${breaker.amp} آمپر`, quantity: 1, unitPrice: breaker.price, total: breaker.price, category: 'material' },
    { labelFa: 'پریز', quantity: outletCount, unitPrice: unitCosts.outlet, total: outletCount * unitCosts.outlet, category: 'material' },
    { labelFa: 'کلید', quantity: switchCount, unitPrice: unitCosts.switch, total: switchCount * unitCosts.switch, category: 'material' },
    { labelFa: 'نقطه چراغ', quantity: lampCount, unitPrice: unitCosts.lamp, total: lampCount * unitCosts.lamp, category: 'material' },
    { labelFa: 'جعبه تقسیم', quantity: junctionCount, unitPrice: unitCosts.junction, total: junctionCount * unitCosts.junction, category: 'material' },
    { labelFa: 'اجرت هر نقطه', quantity: Math.max(1, points.length), unitPrice: unitCosts.laborPerPoint, total: Math.max(1, points.length) * unitCosts.laborPerPoint, category: 'labor' },
    { labelFa: 'اجرت هر متر سیم‌کشی', quantity: costLengthMeters, unitPrice: unitCosts.laborPerMeter, total: costLengthMeters * unitCosts.laborPerMeter, category: 'labor' }
  ];

  const materialCost = items.filter((item) => item.category === 'material').reduce((sum, item) => sum + item.total, 0);
  const laborCost = items.filter((item) => item.category === 'labor').reduce((sum, item) => sum + item.total, 0);
  const overdesignCost = isWireOverdesigned(circuit)
    ? Math.round(wire.pricePerMeter * costLengthMeters * 0.25)
    : 0;

  return {
    circuitId: circuit.id,
    items,
    materialCost,
    laborCost,
    totalCost: materialCost + laborCost,
    overdesignCost,
    load: calculateCircuitLoad(circuit)
  };
}

export function calculateProjectCost(project: ElectricalProject) {
  const circuitCosts = project.circuits.map((circuit) => calculateCircuitCost(circuit, project));
  const materialCost = circuitCosts.reduce((sum, item) => sum + item.materialCost, 0);
  const laborCost = circuitCosts.reduce((sum, item) => sum + item.laborCost, 0);
  const costByCircuit = Object.fromEntries(circuitCosts.map((item) => [item.circuitId, item.totalCost]));
  const costByRoom: Record<string, number> = {};

  project.rooms.forEach((room) => {
    costByRoom[room.id] = project.circuits
      .filter((circuit) => circuit.roomIds.includes(room.id))
      .reduce((sum, circuit) => sum + (costByCircuit[circuit.id] ?? 0) / Math.max(1, circuit.roomIds.length), 0);
  });

  return {
    circuitCosts,
    materialCost,
    laborCost,
    totalCost: materialCost + laborCost,
    costByCircuit,
    costByRoom,
    overdesignCost: circuitCosts.reduce((sum, item) => sum + item.overdesignCost, 0)
  };
}

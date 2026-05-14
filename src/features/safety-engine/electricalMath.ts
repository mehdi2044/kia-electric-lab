import { appliances } from '../../data/appliances';
import { wires } from '../../data/electricalTables';
import type { Appliance, Circuit, ElectricalProject } from '../../types/electrical';

export const DEFAULT_VOLTAGE = 220;

export function calculateCurrent(watt: number, voltage = DEFAULT_VOLTAGE): number {
  if (voltage <= 0) return 0;
  return watt / voltage;
}

export function calculatePower(voltage: number, ampere: number): number {
  return voltage * ampere;
}

export function calculateResistance(voltage: number, ampere: number): number {
  if (ampere <= 0) return 0;
  return voltage / ampere;
}

export function calculateTotalLoad(loads: Appliance[], voltage = DEFAULT_VOLTAGE) {
  const totalWattage = loads.reduce((sum, appliance) => sum + appliance.watts, 0);
  return {
    totalWattage,
    totalCurrent: calculateCurrent(totalWattage, voltage)
  };
}

export function getAppliancesByIds(ids: string[]): Appliance[] {
  return ids
    .map((id) => appliances.find((appliance) => appliance.id === id))
    .filter((appliance): appliance is Appliance => Boolean(appliance));
}

export function calculateCircuitLoad(circuit: Circuit, voltage = DEFAULT_VOLTAGE) {
  return calculateTotalLoad(getAppliancesByIds(circuit.applianceIds), voltage);
}

export function getWire(sizeMm2: number) {
  return wires.find((wire) => wire.sizeMm2 === sizeMm2) ?? wires[0];
}

export function validateWireCapacity(circuit: Circuit, voltage = DEFAULT_VOLTAGE): boolean {
  const { totalCurrent } = calculateCircuitLoad(circuit, voltage);
  return totalCurrent <= getWire(circuit.wireSizeMm2).maxAmp;
}

export function validateBreakerWireCompatibility(circuit: Circuit): boolean {
  return circuit.breakerAmp <= getWire(circuit.wireSizeMm2).maxAmp;
}

export function calculateVoltageDrop(circuit: Circuit, voltage = DEFAULT_VOLTAGE): number {
  const { totalCurrent } = calculateCircuitLoad(circuit, voltage);
  const wire = getWire(circuit.wireSizeMm2);
  return totalCurrent * wire.resistanceOhmPerMeter * circuit.lengthMeters;
}

export function getProjectLoads(project: ElectricalProject) {
  const applianceIds = project.circuits.flatMap((circuit) => circuit.applianceIds);
  return calculateTotalLoad(getAppliancesByIds(applianceIds), project.voltage);
}

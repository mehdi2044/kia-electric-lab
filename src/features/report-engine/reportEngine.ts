import type { ElectricalProject, ProjectReport } from '../../types/electrical';
import { calculateProjectCost } from '../cost-engine/costEngine';
import { calculateCircuitLoad, getProjectLoads } from '../safety-engine/electricalMath';
import { generateSafetyWarnings } from '../safety-engine/safetyEngine';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function generateProjectScore(project: ElectricalProject) {
  const warnings = generateSafetyWarnings(project);
  const dangerCount = warnings.filter((warning) => warning.severity === 'danger').length;
  const warningCount = warnings.filter((warning) => warning.severity === 'warning').length;
  const infoCount = warnings.filter((warning) => warning.severity === 'info').length;
  const cost = calculateProjectCost(project);
  const hasCircuits = project.circuits.length > 0;
  const hasSeparateKitchen = project.circuits.filter((circuit) => circuit.roomIds.includes('kitchen')).length >= 2;
  const configuredCircuits = project.circuits.filter((circuit) => circuit.breakerAmp && circuit.wireSizeMm2).length;

  return {
    safety: clampScore(100 - dangerCount * 22 - warningCount * 9 - infoCount * 2),
    technical: clampScore(65 + configuredCircuits * 8 + (hasSeparateKitchen ? 10 : 0) - dangerCount * 15 - warningCount * 5),
    economic: clampScore(100 - Math.round(cost.overdesignCost / 100000) * 4 - infoCount * 6 - dangerCount * 5),
    learning: clampScore(hasCircuits ? 70 + Math.min(20, project.components.length * 2) + Math.min(10, project.circuits.length * 2) : 35)
  };
}

export function generateProjectReport(project: ElectricalProject): ProjectReport {
  const loads = getProjectLoads(project);
  const cost = calculateProjectCost(project);
  const warnings = generateSafetyWarnings(project);
  const wireUsageBySize = project.circuits.reduce<Record<string, number>>((usage, circuit) => {
    const key = `${circuit.wireSizeMm2} mm²`;
    usage[key] = (usage[key] ?? 0) + circuit.lengthMeters;
    return usage;
  }, {});
  const economicSuggestions = warnings
    .filter((warning) => warning.id.includes('overdesign'))
    .map((warning) => warning.messageFa);
  const recommendedCorrections = warnings
    .filter((warning) => warning.severity !== 'info')
    .map((warning) => warning.messageFa);

  return {
    totalWattage: loads.totalWattage,
    totalAmpere: loads.totalCurrent,
    circuits: project.circuits,
    wireUsageBySize,
    materialCost: cost.materialCost,
    laborCost: cost.laborCost,
    totalCost: cost.totalCost,
    costByCircuit: cost.costByCircuit,
    costByRoom: cost.costByRoom,
    warnings,
    economicSuggestions,
    recommendedCorrections,
    scores: generateProjectScore(project)
  };
}

export function describeCircuit(circuitId: string, project: ElectricalProject): string {
  const circuit = project.circuits.find((item) => item.id === circuitId);
  if (!circuit) return 'مدار ناشناخته';
  const load = calculateCircuitLoad(circuit, project.voltage);
  return `${circuit.nameFa}: ${Math.round(load.totalWattage)} وات، ${load.totalCurrent.toFixed(1)} آمپر`;
}

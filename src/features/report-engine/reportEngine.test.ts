import { describe, expect, it } from 'vitest';
import { defaultProject } from '../../data/apartment';
import { generateProjectReport, generateProjectScore } from './reportEngine';

describe('project report', () => {
  it('generates totals, costs, warnings and scores', () => {
    const report = generateProjectReport(defaultProject);
    expect(report.totalWattage).toBeGreaterThan(0);
    expect(report.totalAmpere).toBeGreaterThan(0);
    expect(report.totalCost).toBeGreaterThan(0);
    expect(report.circuits.length).toBe(defaultProject.circuits.length);
    expect(report.scores.safety).toBeGreaterThanOrEqual(0);
  });

  it('keeps scores inside 0 to 100', () => {
    const scores = generateProjectScore(defaultProject);
    Object.values(scores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

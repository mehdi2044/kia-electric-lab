import { describe, expect, it } from 'vitest';
import type { Circuit } from '../../types/electrical';
import {
  calculateCircuitLoad,
  calculateCurrent,
  calculatePower,
  calculateResistance,
  calculateTotalLoad,
  calculateVoltageDrop,
  validateBreakerWireCompatibility,
  validateWireCapacity
} from './electricalMath';

const heavyCircuit: Circuit = {
  id: 'test-heavy',
  nameFa: 'مدار تست',
  roomIds: ['kitchen'],
  componentIds: [],
  applianceIds: ['oven', 'kettle'],
  wireSizeMm2: 2.5,
  breakerAmp: 16,
  lengthMeters: 20,
  kind: 'outlet'
};

describe('electrical educational calculations', () => {
  it('calculates current from watt and voltage', () => {
    expect(calculateCurrent(2200, 220)).toBe(10);
  });

  it('calculates power and resistance', () => {
    expect(calculatePower(220, 5)).toBe(1100);
    expect(calculateResistance(220, 10)).toBe(22);
  });

  it('sums parallel appliance load', () => {
    const load = calculateTotalLoad([
      { id: 'a', nameFa: 'الف', watts: 400, voltage: 220, category: 'small', icon: 'Plug' },
      { id: 'b', nameFa: 'ب', watts: 1800, voltage: 220, category: 'heavy', icon: 'Zap' }
    ]);
    expect(load.totalWattage).toBe(2200);
    expect(load.totalCurrent).toBe(10);
  });

  it('detects undersized wire and overloaded breaker', () => {
    const load = calculateCircuitLoad(heavyCircuit);
    expect(Math.round(load.totalCurrent)).toBe(20);
    expect(validateWireCapacity(heavyCircuit)).toBe(false);
    expect(validateBreakerWireCompatibility(heavyCircuit)).toBe(true);
  });

  it('calculates approximate voltage drop', () => {
    expect(calculateVoltageDrop(heavyCircuit)).toBeGreaterThan(0);
  });
});

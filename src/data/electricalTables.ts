import type { Breaker, Wire } from '../types/electrical';

export const wires: Wire[] = [
  { sizeMm2: 1.5, maxAmp: 10, pricePerMeter: 28000, resistanceOhmPerMeter: 0.0121, suitableForFa: 'روشنایی' },
  { sizeMm2: 2.5, maxAmp: 16, pricePerMeter: 43000, resistanceOhmPerMeter: 0.0074, suitableForFa: 'پریزهای معمولی' },
  { sizeMm2: 4, maxAmp: 25, pricePerMeter: 67000, resistanceOhmPerMeter: 0.0046, suitableForFa: 'مصرف‌کننده‌های سنگین‌تر' },
  { sizeMm2: 6, maxAmp: 32, pricePerMeter: 96000, resistanceOhmPerMeter: 0.0031, suitableForFa: 'فیدر اصلی یا بار سنگین' }
];

export const breakers: Breaker[] = [
  { amp: 6, labelFa: '۶ آمپر - روشنایی کوچک', price: 180000 },
  { amp: 10, labelFa: '۱۰ آمپر - روشنایی', price: 210000 },
  { amp: 16, labelFa: '۱۶ آمپر - پریز', price: 260000 },
  { amp: 20, labelFa: '۲۰ آمپر - پریز سنگین‌تر', price: 320000 },
  { amp: 25, labelFa: '۲۵ آمپر - اصلی یا سنگین', price: 390000 },
  { amp: 32, labelFa: '۳۲ آمپر - آموزشی سنگین', price: 480000 }
];

export const unitCosts = {
  outlet: 150000,
  switch: 120000,
  lamp: 180000,
  junction: 75000,
  laborPerPoint: 220000,
  laborPerMeter: 55000
};

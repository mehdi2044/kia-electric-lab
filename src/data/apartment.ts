import type { ElectricalComponent, ElectricalProject, Room } from '../types/electrical';

export const rooms: Room[] = [
  { id: 'panel', nameFa: 'تابلو برق', type: 'panel', x: 20, y: 20, width: 120, height: 90 },
  { id: 'living', nameFa: 'پذیرایی', type: 'living', x: 150, y: 20, width: 360, height: 210 },
  { id: 'kitchen', nameFa: 'آشپزخانه', type: 'kitchen', x: 520, y: 20, width: 250, height: 210 },
  { id: 'bed1', nameFa: 'اتاق خواب ۱', type: 'bedroom', x: 150, y: 245, width: 260, height: 175 },
  { id: 'bed2', nameFa: 'اتاق خواب ۲', type: 'bedroom', x: 420, y: 245, width: 220, height: 175 },
  { id: 'bath', nameFa: 'حمام', type: 'bathroom', x: 650, y: 245, width: 120, height: 175, highRisk: true },
  { id: 'hall', nameFa: 'راهرو', type: 'hallway', x: 20, y: 125, width: 120, height: 295 },
  { id: 'balcony', nameFa: 'بالکن', type: 'balcony', x: 780, y: 20, width: 90, height: 400 }
];

export const initialComponents: ElectricalComponent[] = [
  { id: 'main-panel', type: 'main-panel', labelFa: 'تابلو اصلی', roomId: 'panel', x: 58, y: 55 },
  { id: 'lamp-living', type: 'lamp', labelFa: 'چراغ پذیرایی', roomId: 'living', x: 310, y: 120, applianceId: 'led-lamp', costPointType: 'lamp' },
  { id: 'outlet-living', type: 'outlet', labelFa: 'پریز پذیرایی', roomId: 'living', x: 445, y: 180, applianceId: 'tv', costPointType: 'outlet' },
  { id: 'fridge-kitchen', type: 'appliance', labelFa: 'یخچال', roomId: 'kitchen', x: 620, y: 75, applianceId: 'fridge', costPointType: 'outlet' },
  { id: 'oven-kitchen', type: 'appliance', labelFa: 'فر', roomId: 'kitchen', x: 705, y: 160, applianceId: 'oven', costPointType: 'outlet' },
  { id: 'bath-outlet', type: 'outlet', labelFa: 'پریز حمام', roomId: 'bath', x: 705, y: 325, costPointType: 'outlet' }
];

export const defaultProject: ElectricalProject = {
  voltage: 220,
  mainBreakerAmp: 25,
  rooms,
  components: initialComponents,
  circuits: [
    {
      id: 'c-lighting',
      nameFa: 'مدار روشنایی',
      roomIds: ['living', 'hall', 'bed1', 'bed2'],
      componentIds: ['lamp-living'],
      applianceIds: ['led-lamp'],
      wireSizeMm2: 1.5,
      breakerAmp: 10,
      lengthMeters: 38,
      kind: 'lighting'
    },
    {
      id: 'c-kitchen',
      nameFa: 'مدار آشپزخانه',
      roomIds: ['kitchen'],
      componentIds: ['fridge-kitchen', 'oven-kitchen'],
      applianceIds: ['fridge', 'oven'],
      wireSizeMm2: 2.5,
      breakerAmp: 16,
      lengthMeters: 26,
      kind: 'outlet'
    },
    {
      id: 'c-living-outlet',
      nameFa: 'پریز پذیرایی',
      roomIds: ['living'],
      componentIds: ['outlet-living'],
      applianceIds: ['tv'],
      wireSizeMm2: 2.5,
      breakerAmp: 16,
      lengthMeters: 22,
      kind: 'outlet'
    }
  ]
};

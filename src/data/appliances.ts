import type { Appliance } from '../types/electrical';

export const appliances: Appliance[] = [
  { id: 'fridge', nameFa: 'یخچال', watts: 400, voltage: 220, category: 'stable', icon: 'Snowflake' },
  { id: 'dishwasher', nameFa: 'ماشین ظرف‌شویی', watts: 1800, voltage: 220, category: 'heavy', icon: 'Utensils' },
  { id: 'washing-machine', nameFa: 'ماشین لباس‌شویی', watts: 2000, voltage: 220, category: 'heavy', icon: 'Shirt' },
  { id: 'oven', nameFa: 'فر برقی', watts: 2500, voltage: 220, category: 'heavy', icon: 'ChefHat' },
  { id: 'kettle', nameFa: 'کتری برقی', watts: 2000, voltage: 220, category: 'heavy', icon: 'Coffee' },
  { id: 'microwave', nameFa: 'مایکروویو', watts: 1200, voltage: 220, category: 'small', icon: 'Box' },
  { id: 'tv', nameFa: 'تلویزیون', watts: 150, voltage: 220, category: 'small', icon: 'Tv' },
  { id: 'computer', nameFa: 'کامپیوتر', watts: 500, voltage: 220, category: 'small', icon: 'Monitor' },
  { id: 'air-conditioner', nameFa: 'کولر گازی', watts: 2200, voltage: 220, category: 'heavy', icon: 'Wind' },
  { id: 'led-lamp', nameFa: 'چراغ سقفی LED', watts: 20, voltage: 220, category: 'light', icon: 'Lightbulb' },
  { id: 'iron', nameFa: 'اتو', watts: 2200, voltage: 220, category: 'heavy', icon: 'Zap' },
  { id: 'vacuum', nameFa: 'جاروبرقی', watts: 1600, voltage: 220, category: 'small', icon: 'Plug' }
];

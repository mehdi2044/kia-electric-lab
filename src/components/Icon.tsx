import {
  AlertTriangle,
  Bath,
  Box,
  ChefHat,
  CircleGauge,
  Coffee,
  Cpu,
  Database,
  Download,
  FileJson,
  Home,
  Lightbulb,
  Monitor,
  Moon,
  PanelTop,
  Plug,
  Plus,
  RefreshCcw,
  Shirt,
  Snowflake,
  Sun,
  Tv,
  Utensils,
  Upload,
  Wind,
  Zap
} from 'lucide-react';
import type { ComponentType } from '../types/electrical';

const icons = {
  AlertTriangle,
  Bath,
  Box,
  ChefHat,
  CircleGauge,
  Coffee,
  Cpu,
  Database,
  Download,
  FileJson,
  Home,
  Lightbulb,
  Monitor,
  Moon,
  PanelTop,
  Plug,
  Plus,
  RefreshCcw,
  Shirt,
  Snowflake,
  Sun,
  Tv,
  Utensils,
  Upload,
  Wind,
  Zap
};

export function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const Component = icons[name as keyof typeof icons] ?? Plug;
  return <Component className={className} aria-hidden />;
}

export function iconForComponent(type: ComponentType): string {
  const map: Record<ComponentType, string> = {
    'main-panel': 'PanelTop',
    breaker: 'CircleGauge',
    'wire-path': 'Zap',
    'junction-box': 'Box',
    'one-way-switch': 'Plug',
    'two-gang-switch': 'Plug',
    outlet: 'Plug',
    lamp: 'Lightbulb',
    appliance: 'Zap'
  };
  return map[type];
}

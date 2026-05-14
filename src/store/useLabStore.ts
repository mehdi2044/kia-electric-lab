import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultProject } from '../data/apartment';
import type { Circuit, ComponentType, ElectricalComponent, ElectricalProject } from '../types/electrical';

type LabState = {
  project: ElectricalProject;
  selectedCircuitId: string;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  resetProject: () => void;
  addComponent: (component: Omit<ElectricalComponent, 'id'>) => void;
  addCircuit: () => void;
  selectCircuit: (id: string) => void;
  updateCircuit: (id: string, patch: Partial<Circuit>) => void;
  assignApplianceToCircuit: (circuitId: string, applianceId: string) => void;
  assignComponentToCircuit: (circuitId: string, componentId: string) => void;
};

const id = (prefix: string) => `${prefix}-${crypto.randomUUID?.() ?? Date.now().toString(36)}`;

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      project: defaultProject,
      selectedCircuitId: defaultProject.circuits[0]?.id ?? '',
      darkMode: false,
      setDarkMode: (value) => set({ darkMode: value }),
      resetProject: () => set({ project: defaultProject, selectedCircuitId: defaultProject.circuits[0]?.id ?? '' }),
      addComponent: (component) =>
        set((state) => {
          const componentId = id(component.type);
          const nextComponent = { ...component, id: componentId };
          return {
            project: {
              ...state.project,
              components: [...state.project.components, nextComponent],
              circuits: component.circuitId
                ? state.project.circuits.map((circuit) =>
                    circuit.id === component.circuitId
                      ? {
                          ...circuit,
                          componentIds: Array.from(new Set([...circuit.componentIds, componentId])),
                          applianceIds: component.applianceId
                            ? Array.from(new Set([...circuit.applianceIds, component.applianceId]))
                            : circuit.applianceIds,
                          roomIds: Array.from(new Set([...circuit.roomIds, component.roomId]))
                        }
                      : circuit
                  )
                : state.project.circuits
            }
          };
        }),
      addCircuit: () =>
        set((state) => {
          const circuit: Circuit = {
            id: id('circuit'),
            nameFa: `مدار ${state.project.circuits.length + 1}`,
            roomIds: [],
            componentIds: [],
            applianceIds: [],
            wireSizeMm2: 2.5,
            breakerAmp: 16,
            lengthMeters: 15,
            kind: 'outlet'
          };
          return {
            project: { ...state.project, circuits: [...state.project.circuits, circuit] },
            selectedCircuitId: circuit.id
          };
        }),
      selectCircuit: (selectedCircuitId) => set({ selectedCircuitId }),
      updateCircuit: (idToUpdate, patch) =>
        set((state) => ({
          project: {
            ...state.project,
            circuits: state.project.circuits.map((circuit) => (circuit.id === idToUpdate ? { ...circuit, ...patch } : circuit))
          }
        })),
      assignApplianceToCircuit: (circuitId, applianceId) =>
        set((state) => ({
          project: {
            ...state.project,
            circuits: state.project.circuits.map((circuit) =>
              circuit.id === circuitId
                ? { ...circuit, applianceIds: Array.from(new Set([...circuit.applianceIds, applianceId])) }
                : circuit
            )
          }
        })),
      assignComponentToCircuit: (circuitId, componentId) =>
        set((state) => {
          const component = state.project.components.find((item) => item.id === componentId);
          return {
            project: {
              ...state.project,
              components: state.project.components.map((item) => (item.id === componentId ? { ...item, circuitId } : item)),
              circuits: state.project.circuits.map((circuit) =>
                circuit.id === circuitId
                  ? {
                      ...circuit,
                      componentIds: Array.from(new Set([...circuit.componentIds, componentId])),
                      applianceIds: component?.applianceId
                        ? Array.from(new Set([...circuit.applianceIds, component.applianceId]))
                        : circuit.applianceIds,
                      roomIds: component?.roomId ? Array.from(new Set([...circuit.roomIds, component.roomId])) : circuit.roomIds
                    }
                  : circuit
              )
            }
          };
        })
    }),
    {
      name: 'kia-electric-lab-project',
      partialize: (state) => ({ project: state.project, selectedCircuitId: state.selectedCircuitId, darkMode: state.darkMode })
    }
  )
);

export const componentLabels: Record<ComponentType, string> = {
  'main-panel': 'تابلو',
  breaker: 'فیوز',
  'wire-path': 'مسیر سیم',
  'junction-box': 'جعبه تقسیم',
  'one-way-switch': 'کلید تک پل',
  'two-gang-switch': 'کلید دو پل',
  outlet: 'پریز',
  lamp: 'چراغ',
  appliance: 'وسیله'
};

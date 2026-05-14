import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultProject } from '../data/apartment';
import type { Circuit, ComponentType, ElectricalComponent, ElectricalProject, ElectricalTerminalRef, ElectricalWire, LessonExample, LessonSandboxApplyMode, LessonSandboxState, LessonScore, Point2D, PanelBreakerSlot } from '../types/electrical';
import { createElectricalWire, validateTerminalConnection } from '../features/topology-engine/wireFactory';
import { generateTopologyWarnings } from '../features/validation-engine/validationEngine';
import { terminalKey } from '../features/topology-engine/types';
import { insertBendPoint, removeBendPoint, resetWireRoute, updateBendPoint } from '../features/topology-engine/wireGeometry';
import { getPanelBreakers } from '../features/panelboard-engine/panelboardEngine';
import { CURRENT_APP_VERSION, CURRENT_SCHEMA_VERSION, createProjectTimestamp } from '../migrations/projectMigration';
import { preparePersistedProjectStorage } from '../migrations/storageSafety';
import { recordHintUsed, recordLessonAttempt, setActiveLesson } from '../features/lesson-mode/lessonProgress';
import {
  addLessonExample,
  appendSandboxToMainProject,
  createLessonExample,
  deleteLessonExample,
  loadLessonExampleIntoSandbox,
  replaceMainProjectWithSandbox,
  renameLessonExample,
  resetLessonSandbox,
  startLessonSandbox,
  type SandboxApplyResult
} from '../features/lesson-mode/lessonSandbox';

type LabState = {
  project: ElectricalProject;
  lessonSandbox?: LessonSandboxState;
  selectedCircuitId: string;
  selectedWireId?: string;
  wireDrawingMode: boolean;
  pendingTerminal?: ElectricalTerminalRef;
  wireDraft: {
    wireSizeMm2: number;
    lengthMeters: number;
  };
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  replaceProject: (project: ElectricalProject) => void;
  resetProject: () => void;
  addComponent: (component: Omit<ElectricalComponent, 'id'>) => void;
  addCircuit: () => void;
  selectCircuit: (id: string) => void;
  updateCircuit: (id: string, patch: Partial<Circuit>) => void;
  assignApplianceToCircuit: (circuitId: string, applianceId: string) => void;
  assignComponentToCircuit: (circuitId: string, componentId: string) => void;
  setWireDrawingMode: (value: boolean) => void;
  selectTerminalForWire: (terminal: ElectricalTerminalRef) => void;
  addWire: (wire: ElectricalWire) => void;
  selectWire: (wireId?: string) => void;
  updateWire: (wireId: string, patch: Partial<ElectricalWire>) => void;
  deleteWire: (wireId: string) => void;
  clearInvalidWires: () => void;
  resetWiringForCircuit: (circuitId: string) => void;
  resetWiringForRoom: (roomId: string) => void;
  setWireDraft: (patch: Partial<LabState['wireDraft']>) => void;
  addWireBendPoint: (wireId: string, point: Point2D) => void;
  updateWireBendPoint: (wireId: string, index: number, point: Point2D, snap?: boolean) => void;
  removeWireBendPoint: (wireId: string, index: number) => void;
  resetWireRoute: (wireId: string) => void;
  setPixelsPerMeter: (pixelsPerMeter: number) => void;
  assignCircuitToBreaker: (slotId: string, circuitId?: string) => void;
  updatePanelBreaker: (slotId: string, patch: Partial<PanelBreakerSlot>) => void;
  setActiveLesson: (lessonId: string) => void;
  useLessonHint: (lessonId: string) => void;
  recordLessonValidation: (lessonId: string, passed: boolean, score: LessonScore, feedbackFa: string) => void;
  resetCurrentLessonWiring: () => void;
  startLessonSandbox: (lessonId: string) => void;
  resetLessonSandbox: () => void;
  exitLessonSandbox: () => void;
  applyLessonSandboxToMainProject: (mode: LessonSandboxApplyMode, exampleTitle?: string, notes?: string) => SandboxApplyResult | undefined;
  saveSandboxAsExample: (title?: string, notes?: string) => void;
  deleteLessonExample: (exampleId: string) => void;
  loadLessonExample: (exampleId: string) => void;
  renameLessonExample: (exampleId: string, title: string, notes?: string) => void;
  importLessonExample: (example: LessonExample) => void;
};

const id = (prefix: string) => `${prefix}-${crypto.randomUUID?.() ?? Date.now().toString(36)}`;
const touchProject = (project: ElectricalProject): ElectricalProject => ({
  ...project,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  appVersion: CURRENT_APP_VERSION,
  updatedAt: createProjectTimestamp()
});

preparePersistedProjectStorage();

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      project: defaultProject,
      lessonSandbox: undefined,
      selectedCircuitId: defaultProject.circuits[0]?.id ?? '',
      selectedWireId: undefined,
      wireDrawingMode: false,
      pendingTerminal: undefined,
      wireDraft: { wireSizeMm2: 2.5, lengthMeters: 8 },
      darkMode: false,
      setDarkMode: (value) => set({ darkMode: value }),
      replaceProject: (project) =>
        set({
          project: touchProject(project),
          lessonSandbox: undefined,
          selectedCircuitId: project.circuits[0]?.id ?? '',
          selectedWireId: undefined,
          pendingTerminal: undefined
        }),
      resetProject: () =>
        set({
          project: touchProject(defaultProject),
          lessonSandbox: undefined,
          selectedCircuitId: defaultProject.circuits[0]?.id ?? '',
          selectedWireId: undefined,
          pendingTerminal: undefined
        }),
      addComponent: (component) =>
        set((state) => {
          const componentId = id(component.type);
          const nextComponent = { ...component, id: componentId };
          const nextProject = {
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
          };
          return {
            project: touchProject(nextProject)
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
            project: touchProject({ ...state.project, circuits: [...state.project.circuits, circuit] }),
            selectedCircuitId: circuit.id
          };
        }),
      selectCircuit: (selectedCircuitId) => set({ selectedCircuitId }),
      updateCircuit: (idToUpdate, patch) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            circuits: state.project.circuits.map((circuit) => (circuit.id === idToUpdate ? { ...circuit, ...patch } : circuit))
          })
        })),
      assignApplianceToCircuit: (circuitId, applianceId) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            circuits: state.project.circuits.map((circuit) =>
              circuit.id === circuitId
                ? { ...circuit, applianceIds: Array.from(new Set([...circuit.applianceIds, applianceId])) }
                : circuit
            )
          })
        })),
      assignComponentToCircuit: (circuitId, componentId) =>
        set((state) => {
          const component = state.project.components.find((item) => item.id === componentId);
          return {
            project: touchProject({
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
            })
          };
        }),
      setWireDrawingMode: (wireDrawingMode) =>
        set({
          wireDrawingMode,
          pendingTerminal: wireDrawingMode ? undefined : undefined
        }),
      selectTerminalForWire: (terminal) =>
        set((state) => {
          if (!state.wireDrawingMode) return { pendingTerminal: terminal };
          if (!state.pendingTerminal) return { pendingTerminal: terminal };
          if (terminalKey(state.pendingTerminal) === terminalKey(terminal)) return { pendingTerminal: undefined };

          const result = createElectricalWire({
            project: state.project,
            circuitId: state.selectedCircuitId,
            from: state.pendingTerminal,
            to: terminal,
            wireSizeMm2: state.wireDraft.wireSizeMm2,
            lengthMeters: state.wireDraft.lengthMeters
          });

          if (!result.wire) return { pendingTerminal: terminal };

          return {
            project: touchProject({
              ...state.project,
              wires: [...(state.project.wires ?? []), result.wire]
            }),
            selectedWireId: result.wire.id,
            pendingTerminal: undefined
          };
        }),
      addWire: (wire) =>
        set((state) => ({
          project: touchProject({ ...state.project, wires: [...(state.project.wires ?? []), wire] }),
          selectedWireId: wire.id
        })),
      selectWire: (selectedWireId) => set({ selectedWireId }),
      updateWire: (wireId, patch) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            wires: (state.project.wires ?? []).map((wire) => (wire.id === wireId ? { ...wire, ...patch } : wire))
          })
        })),
      deleteWire: (wireId) =>
        set((state) => ({
          project: touchProject({ ...state.project, wires: (state.project.wires ?? []).filter((wire) => wire.id !== wireId) }),
          selectedWireId: state.selectedWireId === wireId ? undefined : state.selectedWireId
        })),
      clearInvalidWires: () =>
        set((state) => {
          const invalidWireIds = new Set(
            generateTopologyWarnings(state.project)
              .map((warning) => warning.id.match(/^topology:(.+):short-circuit$/)?.[1])
              .filter((wireId): wireId is string => Boolean(wireId))
          );
          const nextWires = (state.project.wires ?? []).filter((wire) => {
            const validation = validateTerminalConnection(state.project, wire.from, wire.to);
            return validation.valid && !invalidWireIds.has(wire.id);
          });
          return {
            project: touchProject({ ...state.project, wires: nextWires }),
            selectedWireId: nextWires.some((wire) => wire.id === state.selectedWireId) ? state.selectedWireId : undefined
          };
        }),
      resetWiringForCircuit: (circuitId) =>
        set((state) => ({
          project: touchProject({ ...state.project, wires: (state.project.wires ?? []).filter((wire) => wire.circuitId !== circuitId) }),
          selectedWireId: (state.project.wires ?? []).find((wire) => wire.id === state.selectedWireId)?.circuitId === circuitId ? undefined : state.selectedWireId
        })),
      resetWiringForRoom: (roomId) =>
        set((state) => {
          const componentIds = new Set(state.project.components.filter((component) => component.roomId === roomId).map((component) => component.id));
          const nextWires = (state.project.wires ?? []).filter(
            (wire) => !componentIds.has(wire.from.componentId) && !componentIds.has(wire.to.componentId)
          );
          return {
            project: touchProject({ ...state.project, wires: nextWires }),
            selectedWireId: nextWires.some((wire) => wire.id === state.selectedWireId) ? state.selectedWireId : undefined
          };
        }),
      setWireDraft: (patch) => set((state) => ({ wireDraft: { ...state.wireDraft, ...patch } })),
      addWireBendPoint: (wireId, point) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            wires: (state.project.wires ?? []).map((wire) => (wire.id === wireId ? insertBendPoint(wire, point) : wire))
          })
        })),
      updateWireBendPoint: (wireId, index, point, snap) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            wires: (state.project.wires ?? []).map((wire) => (wire.id === wireId ? updateBendPoint(wire, index, point, snap) : wire))
          })
        })),
      removeWireBendPoint: (wireId, index) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            wires: (state.project.wires ?? []).map((wire) => (wire.id === wireId ? removeBendPoint(wire, index) : wire))
          })
        })),
      resetWireRoute: (wireId) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            wires: (state.project.wires ?? []).map((wire) => (wire.id === wireId ? resetWireRoute(wire) : wire))
          })
        })),
      setPixelsPerMeter: (pixelsPerMeter) =>
        set((state) => ({ project: touchProject({ ...state.project, pixelsPerMeter }) })),
      assignCircuitToBreaker: (slotId, circuitId) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            panelboard: {
              mainBreakerAmp: state.project.panelboard?.mainBreakerAmp ?? state.project.mainBreakerAmp,
              breakers: getPanelBreakers(state.project).map((breaker) => (breaker.id === slotId ? { ...breaker, circuitId } : breaker))
            }
          })
        })),
      updatePanelBreaker: (slotId, patch) =>
        set((state) => ({
          project: touchProject({
            ...state.project,
            panelboard: {
              mainBreakerAmp: state.project.panelboard?.mainBreakerAmp ?? state.project.mainBreakerAmp,
              breakers: getPanelBreakers(state.project).map((breaker) => (breaker.id === slotId ? { ...breaker, ...patch } : breaker))
            }
          })
        })),
      setActiveLesson: (lessonId) =>
        set((state) => {
          const project = touchProject(setActiveLesson(state.project, lessonId));
          return {
            project,
            lessonSandbox: state.lessonSandbox
              ? { ...state.lessonSandbox, activeLessonId: lessonId, sandboxProject: project, sandboxProgress: project.lessonProgress ?? state.lessonSandbox.sandboxProgress }
              : state.lessonSandbox
          };
        }),
      useLessonHint: (lessonId) =>
        set((state) => {
          const project = touchProject(recordHintUsed(state.project, lessonId));
          return {
            project,
            lessonSandbox: state.lessonSandbox
              ? { ...state.lessonSandbox, sandboxProject: project, sandboxProgress: project.lessonProgress ?? state.lessonSandbox.sandboxProgress }
              : state.lessonSandbox
          };
        }),
      recordLessonValidation: (lessonId, passed, score, feedbackFa) =>
        set((state) => {
          const project = touchProject(recordLessonAttempt(state.project, lessonId, passed, score, feedbackFa));
          return {
            project,
            lessonSandbox: state.lessonSandbox
              ? {
                  ...state.lessonSandbox,
                  sandboxProject: project,
                  sandboxProgress: project.lessonProgress ?? state.lessonSandbox.sandboxProgress,
                  attemptsCount: state.lessonSandbox.attemptsCount + 1
                }
              : state.lessonSandbox
          };
        }),
      resetCurrentLessonWiring: () =>
        set((state) => {
          const selectedCircuit = state.project.circuits.find((circuit) => circuit.id === state.selectedCircuitId);
          if (!selectedCircuit) return {};
          return {
            project: touchProject({
              ...state.project,
              wires: (state.project.wires ?? []).filter((wire) => wire.circuitId !== selectedCircuit.id)
            }),
            selectedWireId: undefined,
            pendingTerminal: undefined
          };
        }),
      startLessonSandbox: (lessonId) =>
        set((state) => {
          const sandbox = startLessonSandbox(state.lessonSandbox?.mainProject ?? state.project, lessonId);
          return {
            lessonSandbox: sandbox,
            project: sandbox.sandboxProject,
            selectedCircuitId: sandbox.sandboxProject.circuits[0]?.id ?? '',
            selectedWireId: undefined,
            pendingTerminal: undefined,
            wireDrawingMode: true
          };
        }),
      resetLessonSandbox: () =>
        set((state) => {
          if (!state.lessonSandbox) return {};
          const sandbox = resetLessonSandbox(state.lessonSandbox);
          return {
            lessonSandbox: sandbox,
            project: sandbox.sandboxProject,
            selectedCircuitId: sandbox.sandboxProject.circuits[0]?.id ?? '',
            selectedWireId: undefined,
            pendingTerminal: undefined,
            wireDrawingMode: true
          };
        }),
      exitLessonSandbox: () =>
        set((state) => {
          if (!state.lessonSandbox) return {};
          return {
            project: touchProject(state.lessonSandbox.mainProject),
            lessonSandbox: undefined,
            selectedCircuitId: state.lessonSandbox.mainProject.circuits[0]?.id ?? '',
            selectedWireId: undefined,
            pendingTerminal: undefined,
            wireDrawingMode: false
          };
        }),
      applyLessonSandboxToMainProject: (mode, exampleTitle, notes) => {
        let result: SandboxApplyResult | undefined;
        set((state) => {
          if (!state.lessonSandbox) return {};
          const sandbox = { ...state.lessonSandbox, sandboxProject: state.project };
          const score = state.project.lessonProgress?.attemptsByLesson[sandbox.activeLessonId]?.score;
          if (mode === 'save-example') {
            const example = createLessonExample(sandbox, exampleTitle ?? 'نمونه درس', notes, score);
            return {
              lessonSandbox: addLessonExample(sandbox, example)
            };
          }
          result = mode === 'append' ? appendSandboxToMainProject(sandbox) : replaceMainProjectWithSandbox(sandbox);
          const applied = result.project;
          return {
            project: touchProject(applied),
            lessonSandbox: undefined,
            selectedCircuitId: applied.circuits[0]?.id ?? '',
            selectedWireId: undefined,
            pendingTerminal: undefined,
            wireDrawingMode: false
          };
        });
        return result;
      },
      saveSandboxAsExample: (title, notes) =>
        set((state) => {
          if (!state.lessonSandbox) return {};
          const sandbox = { ...state.lessonSandbox, sandboxProject: state.project };
          const score = state.project.lessonProgress?.attemptsByLesson[sandbox.activeLessonId]?.score;
          const example = createLessonExample(sandbox, title ?? 'نمونه درس', notes, score);
          return {
            lessonSandbox: addLessonExample(sandbox, example)
          };
        }),
      deleteLessonExample: (exampleId) =>
        set((state) => ({
          lessonSandbox: state.lessonSandbox ? deleteLessonExample(state.lessonSandbox, exampleId) : state.lessonSandbox
        })),
      renameLessonExample: (exampleId, title, notes) =>
        set((state) => ({
          lessonSandbox: state.lessonSandbox ? renameLessonExample(state.lessonSandbox, exampleId, title, notes) : state.lessonSandbox
        })),
      importLessonExample: (example) =>
        set((state) => {
          if (!state.lessonSandbox) return {};
          return {
            lessonSandbox: addLessonExample(state.lessonSandbox, example)
          };
        }),
      loadLessonExample: (exampleId) =>
        set((state) => {
          if (!state.lessonSandbox) return {};
          const sandbox = loadLessonExampleIntoSandbox(state.lessonSandbox, exampleId);
          return {
            lessonSandbox: sandbox,
            project: sandbox.sandboxProject,
            selectedCircuitId: sandbox.sandboxProject.circuits[0]?.id ?? '',
            selectedWireId: undefined,
            pendingTerminal: undefined,
            wireDrawingMode: true
          };
        })
    }),
    {
      name: 'kia-electric-lab-project',
      version: CURRENT_SCHEMA_VERSION,
      partialize: (state) => ({
        project: state.project,
        lessonSandbox: state.lessonSandbox,
        selectedCircuitId: state.selectedCircuitId,
        selectedWireId: state.selectedWireId,
        wireDraft: state.wireDraft,
        darkMode: state.darkMode
      })
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

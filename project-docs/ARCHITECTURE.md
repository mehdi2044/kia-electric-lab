# Kia Electric Lab - Architecture

Architecture policy: append architectural decisions and changes with timestamps. Do not silently change architecture. Any major module movement, state model change, rule-engine change, or persistence change must be documented here for Mehdi and Vi.

## 2026-05-14 13:05 Europe/Istanbul - Phase 1 Architecture Baseline

### Architectural Intent

Kia Electric Lab Phase 1 is a local-first educational simulator. The architecture is intentionally frontend-only for MVP speed, but it is structured so the core simulation logic can later move into a shared package or Tauri/SQLite desktop architecture.

The most important Phase 1 architectural principle is separation of concerns:

- UI renders and collects user actions.
- Store owns editable project state.
- Data files define educational assumptions.
- Engine files calculate electrical, safety, cost, and report outputs.
- Type files define contracts between all modules.

### Current Folder Structure

```text
src/
  components/
    Icon.tsx
    StatCard.tsx
  data/
    apartment.ts
    appliances.ts
    electricalTables.ts
  features/
    appliance-library/
      ApplianceLibrary.tsx
    circuit-builder/
      CircuitBuilder.tsx
    cost-engine/
      CostPanel.tsx
      costEngine.ts
    floor-plan/
      FloorPlan.tsx
    report-engine/
      ReportPanel.tsx
      reportEngine.ts
      reportEngine.test.ts
    safety-engine/
      electricalMath.ts
      electricalMath.test.ts
      SafetyPanel.tsx
      safetyEngine.ts
  store/
    useLabStore.ts
  types/
    electrical.ts
  utils/
    format.ts
  App.tsx
  main.tsx
  styles.css
```

### Module Responsibilities

#### `src/types/electrical.ts`

Defines the shared domain contract for the entire simulator:

- Appliance model
- Room model
- Electrical component model
- Circuit model
- Wire model
- Breaker model
- Cost item model
- Safety warning model
- Project report model
- Complete electrical project model

This file is the current source of truth for project data shape.

#### `src/data/appliances.ts`

Defines the Phase 1 common appliance library. Each appliance has:

- ID
- Persian display name
- Wattage
- Voltage
- Category
- Icon key

The category is used by the safety engine to identify lights, heavy loads, stable loads, and normal small loads.

#### `src/data/electricalTables.ts`

Defines the simplified educational tables for:

- Wire size
- Wire ampacity
- Wire price per meter
- Wire resistance per meter
- Breaker ratings
- Breaker prices
- Unit material and labor costs

Future architecture recommendation: convert this into a versioned profile file so cost and rule assumptions can vary by lesson, market, or country.

#### `src/data/apartment.ts`

Defines:

- Room geometry for the default 100 sqm apartment.
- Initial visible components.
- Default demo project and starter circuits.

This is currently static data. Future versions should allow selectable apartment templates.

#### `src/store/useLabStore.ts`

Owns application state:

- `project`
- `selectedCircuitId`
- `darkMode`

Owns state mutations:

- Reset project
- Add component
- Add circuit
- Select circuit
- Update circuit
- Assign appliance to circuit
- Assign component to circuit

Persistence:

- Uses Zustand `persist` middleware.
- Storage key: `kia-electric-lab-project`.
- Persists project, selected circuit, and dark mode.

Architectural risk:

- No schema version or migration exists. This must be addressed before long-term persistence or Tauri migration.

#### `src/features/safety-engine/electricalMath.ts`

Pure electrical calculation layer:

- Current
- Power
- Resistance
- Total load
- Circuit load
- Wire lookup
- Wire capacity validation
- Breaker/wire compatibility validation
- Approximate voltage drop
- Project total load

This file should remain UI-independent.

#### `src/features/safety-engine/safetyEngine.ts`

Rule evaluation layer:

- Creates Persian warnings.
- Checks whole-project overload.
- Checks circuit overload.
- Checks wire capacity.
- Checks breaker-wire compatibility.
- Checks multiple heavy appliances.
- Checks mixed lighting/outlet loads.
- Checks approximate voltage drop.
- Checks overdesign.
- Checks refrigerator stability/dedication.
- Checks kitchen circuit count.
- Checks bathroom outlet risk.
- Checks unknown appliance IDs.

Architectural risk:

- Rules are currently procedural. As the platform grows, this should become a rule registry or profile-based rule engine.

#### `src/features/cost-engine/costEngine.ts`

Cost calculation layer:

- Calculates circuit-level cost items.
- Calculates material cost.
- Calculates labor cost.
- Calculates total circuit cost.
- Calculates approximate overdesign cost.
- Aggregates project cost.
- Calculates cost by circuit and room.

Architectural risk:

- Cost model is hardcoded.
- Currency is implicit.
- Cost values have no effective date/version.
- Room cost distribution is approximate.

#### `src/features/report-engine/reportEngine.ts`

Report and scoring layer:

- Generates full `ProjectReport`.
- Aggregates loads, costs, warnings, wire usage, economic suggestions, recommended corrections, and scores.
- Calculates scores from warning counts, configured circuit count, kitchen separation, and overdesign cost.

Architectural risk:

- Scoring weights are hardcoded and should eventually be configurable by lesson mode.

#### UI Components

UI modules consume state and engine outputs:

- `App.tsx`: page layout, RTL enforcement, dashboard cards.
- `ApplianceLibrary.tsx`: component/appliance palette and drag data.
- `FloorPlan.tsx`: apartment visualization and drag/drop placement.
- `CircuitBuilder.tsx`: circuit list and circuit configuration controls.
- `SafetyPanel.tsx`: warning display.
- `CostPanel.tsx`: cost summary display.
- `ReportPanel.tsx`: final report display.

### State Flow

Current flow:

1. Static defaults are loaded from `src/data/apartment.ts`.
2. Zustand initializes `project` state with `defaultProject`.
3. Zustand persistence restores previous local browser state if available.
4. User actions mutate state through store actions.
5. UI components read project state through `useLabStore`.
6. UI components call pure engines with current project data.
7. Engines return derived values.
8. UI renders Persian dashboard, safety warnings, cost outputs, and report.

Important: derived values are not currently stored. They are recalculated from project state. This is good for correctness and avoids stale derived state.

### Simulation Engine Design

Phase 1 does not have a single `simulationEngine` module. Instead, simulation concerns are split by responsibility:

- Electrical math: `electricalMath.ts`
- Safety rules: `safetyEngine.ts`
- Cost calculations: `costEngine.ts`
- Report and scoring: `reportEngine.ts`

This is acceptable for MVP. For Phase 2 or Phase 3, consider introducing:

- `simulation-profile`
- `rule-registry`
- `project-normalizer`
- `project-validator`
- `report-snapshot`

### UI Architecture

The UI is card-based and Persian RTL. It uses TailwindCSS classes directly in components.

Layout:

- Header and top KPI cards in `App.tsx`.
- Main content grid with:
  - Left: palette/library
  - Center: floor plan, circuit builder, report
  - Right: safety and cost panels

React Flow architecture:

- Rooms are rendered as non-draggable background nodes.
- Components are rendered as nodes over rooms.
- Circuit membership is visualized with edges from main panel to assigned components.
- Drag/drop uses `dataTransfer` payloads and `screenToFlowPosition`.

Limitations:

- Nodes are not draggable after placement.
- Wire path geometry is not modeled.
- Edges are not true electrical topology.

### Safety Engine Architecture

Current safety engine inputs:

- `ElectricalProject`
- Each `Circuit`
- Appliance table
- Wire table

Current safety engine output:

- Array of `SafetyWarning`.

Warning levels:

- `danger`
- `warning`
- `info`

Current safety engine behavior:

- Evaluates whole-project rules first.
- Evaluates each circuit.
- Evaluates cross-cutting room/appliance conditions.
- Returns warnings for UI and report engine.

Future safety architecture:

- Convert rules to typed rule objects.
- Add rule IDs and categories.
- Add severity policy by lesson mode.
- Add unit tests per rule.
- Add explainable rule metadata:
  - trigger
  - formula
  - educational explanation
  - recommended correction
  - professional disclaimer

### Cost Engine Architecture

Current cost engine inputs:

- `Circuit`
- Optional `ElectricalProject`
- Wire table
- Breaker table
- Unit cost table

Current cost engine output:

- Circuit-level items and totals.
- Project-level aggregate totals.

Current cost categories:

- material
- labor

Current cost limitations:

- Costs are static placeholders.
- Currency is displayed as toman in UI but not encoded in data model.
- No supplier or date metadata.
- No regional pricing.
- No uncertainty range.

Future cost architecture:

- Versioned cost profile.
- Currency metadata.
- Effective date.
- Editable cost assumptions.
- Import/export of cost profiles.
- Overdesign explanation with exact alternative wire recommendation.

### Report Engine Architecture

The report engine composes:

- Project load from electrical math.
- Cost totals from cost engine.
- Safety warnings from safety engine.
- Wire usage from circuits.
- Economic suggestions from overdesign warnings.
- Recommended corrections from non-info warnings.
- Scores from warning and configuration heuristics.

This module is the correct place to prepare AI tutor context in later phases, because it already composes the complete educational state.

### Data Model Relationships

High-level relationship:

```text
ElectricalProject
  voltage
  mainBreakerAmp
  rooms[]
  components[]
  circuits[]

Circuit
  roomIds[] -> Room.id
  componentIds[] -> ElectricalComponent.id
  applianceIds[] -> Appliance.id
  wireSizeMm2 -> Wire.sizeMm2
  breakerAmp -> Breaker.amp
```

Important current design note:

- Appliances are not component instances. Circuits store `applianceIds`, and components may also reference `applianceId`.
- This is enough for MVP but may become limiting when the same appliance type appears multiple times.

Future recommendation:

- Introduce `PlacedLoad` or `LoadInstance` with unique ID, appliance type, room, circuit, and custom wattage override.

### Persistence Architecture

Current:

- Browser local storage via Zustand.

Missing:

- Version number.
- Migration system.
- Data validation.
- Project import/export.
- Conflict recovery.

Future:

- Add `schemaVersion` to `ElectricalProject`.
- Add local migrations.
- Add JSON import/export.
- Add SQLite adapter for Tauri.
- Keep engines storage-agnostic.

### Testing Architecture

Current:

- Vitest configured.
- Tests exist for electrical math and report generation.

Missing:

- UI tests.
- Store tests.
- Rule-by-rule safety tests.
- Cost engine tests.
- Persistence migration tests.
- Visual regression tests.

Recommended testing direction:

1. Add cost engine unit tests.
2. Add safety warning unit tests per rule.
3. Add store mutation tests.
4. Add Playwright/Codex browser smoke tests after UI stabilizes.

### Architecture Quality Assessment

The current architecture is strong for Phase 1. It satisfies the most important principle: calculation logic is not embedded directly inside UI components. The data model is clear, and feature directories make ownership reasonably obvious.

The largest architectural gap is that the simulator does not yet distinguish visual topology from electrical topology. React Flow currently renders visual nodes and simple edges, but the true circuit model is still a list of circuits with IDs. This is fine for MVP but must be addressed before advanced circuit simulation, automatic wire-length calculation, or multiplayer editing.

### Architectural Risks

- UI can become too large if future features are added directly to existing components.
- Procedural safety rules can become hard to manage without a rule registry.
- Static data tables can become hard to version without profiles.
- Local storage can break across schema changes.
- Appliance IDs as load references are too coarse for repeated identical appliances.
- No single source of truth exists for visual wire path geometry.

### Architectural Next Steps

Recommended Phase 2 architecture work:

- Add `.gitignore` and initialize repository.
- Add schema version to `ElectricalProject`.
- Introduce `LoadInstance` or `PlacedLoad`.
- Add safety rule registry abstraction.
- Add cost profile abstraction.
- Add project import/export.
- Add circuit/component deletion and editing.
- Add tests around safety and cost engines.

## 2026-05-14 13:25 Europe/Istanbul - Version Control Architecture

### Change Type

Engineering-process architecture. No runtime source architecture changed.

### Git Branch Architecture

The project now uses:

- `main` for stable releases.
- `develop` for active integration.
- `feature/*` for isolated work.
- `experimental/*` for risky prototypes and research.

### Baseline Anchor

The tag `v0.1-phase1-baseline` marks the stable Phase 1 baseline. This tag is the first formal recovery anchor for the project.

### Documentation Coupling

Future architecture, electrical-rule, cost-rule, and persistence changes must include corresponding updates under `project-docs/` before they are considered complete.

### Reason

Kia Electric Lab is expected to grow into a larger educational simulator and AI-assisted platform. Branch strategy and tagged baselines are required to preserve architectural continuity and allow safe rollback.

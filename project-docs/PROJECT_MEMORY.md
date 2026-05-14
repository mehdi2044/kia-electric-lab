# Kia Electric Lab - Project Memory

Persistent memory policy: this file is append-first. Future phases must add dated entries rather than deleting prior history. Corrections should be recorded as new notes with context, not silently rewritten.

## 2026-05-14 13:05 Europe/Istanbul - Governance Memory Bootstrap

### Ownership And Roles

- Mehdi is the Project Owner and Product Architect.
- Vi is the Technical Project Manager and Lead System Architect.
- Codex is the Senior Software Engineer responsible for implementation.
- Codex must follow architecture and product direction from Mehdi and Vi.
- Codex must not silently change architecture decisions.
- Every completed implementation step, fix, feature, or phase must produce an engineering report for Mehdi.
- Persistent documentation must remain current so another engineer can continue the project without depending on chat history.

### Overall Project Vision

Kia Electric Lab is a local Persian RTL educational simulator for teaching a teenager the fundamentals of residential electrical wiring. It models a simplified 220V single-phase apartment environment where a learner can place electrical components and appliances, build circuits, choose wire sizes and breakers, calculate load, estimate cost, and receive educational feedback.

The product is explicitly not a professional installation, permitting, inspection, or design approval system. Its role is educational: it should explain electricity, safety risk, circuit planning, and economic tradeoffs in simple Persian.

Long-term product direction:

- Advanced visual electrical simulator
- Educational platform for home wiring concepts
- AI-assisted electrical tutor
- Cost estimation engine
- Safety analysis engine
- Potential multiplayer classroom simulator
- Later desktop packaging with Tauri
- Later persistence using SQLite

### Current Architecture

The current Phase 1 application is a Vite React TypeScript frontend with a feature-oriented folder structure. It runs locally in the browser and stores project state in local storage through Zustand persistence.

Current major modules:

- `src/types/electrical.ts`: domain model interfaces and discriminated domain types.
- `src/data/appliances.ts`: common appliance library.
- `src/data/electricalTables.ts`: educational wire, breaker, and unit-cost tables.
- `src/data/apartment.ts`: default apartment layout, starter components, and starter circuits.
- `src/features/safety-engine/electricalMath.ts`: pure electrical formulas and load calculations.
- `src/features/safety-engine/safetyEngine.ts`: warning generation and safety rule checks.
- `src/features/cost-engine/costEngine.ts`: material/labor cost calculations and overdesign cost estimate.
- `src/features/report-engine/reportEngine.ts`: final report generation and scoring.
- `src/store/useLabStore.ts`: editable project state, selected circuit, theme state, local persistence, and mutation actions.
- `src/features/floor-plan/FloorPlan.tsx`: visual floor plan and component placement using React Flow.
- `src/features/circuit-builder/CircuitBuilder.tsx`: manual circuit creation and circuit configuration UI.
- `src/features/appliance-library/ApplianceLibrary.tsx`: draggable components and appliances.
- `src/features/safety-engine/SafetyPanel.tsx`: Persian safety feedback UI.
- `src/features/cost-engine/CostPanel.tsx`: Persian cost summary UI.
- `src/features/report-engine/ReportPanel.tsx`: final report UI.

### Engineering Goals

Priority order defined by governance:

1. Clean architecture
2. Correct electrical logic
3. Educational clarity
4. Scalability
5. UI polish
6. Performance optimization

Practical interpretation:

- Calculation logic must stay separated from React UI.
- Safety/cost/report functions should remain pure or mostly pure where possible.
- UI should be a consumer of state and calculated outputs, not the owner of formulas.
- Persian RTL wording must be simple, educational, and non-professional in tone.
- All future changes should update project documentation and phase reports.

### Completed Systems In Phase 1

- Vite/React/TypeScript project scaffold.
- TailwindCSS styling setup.
- React Flow floor plan surface.
- Zustand store with local browser persistence.
- Persian RTL shell with dark/light support.
- Basic apartment model for a 100 sqm two-bedroom unit.
- Component palette for outlet, lamp, junction box, switches, and appliances.
- Appliance library with common home loads.
- Drag and drop placement onto the floor plan.
- Circuit creation and selection.
- Component/appliance assignment to circuits.
- Wire size and breaker selection per circuit.
- Current, wattage, approximate voltage drop, and cost display.
- Safety warning generation.
- Final report generation.
- Scoring system for safety, technical, economic, and learning dimensions.
- Unit tests for calculation and report functions.
- README with safety disclaimer and run instructions.

### Pending Systems

- True wire path drawing and editable routing.
- Reliable component repositioning after placement.
- Circuit deletion, component deletion, and appliance removal.
- Import/export of project JSON.
- Tauri packaging.
- SQLite persistence.
- Guided lessons and quiz mode.
- AI tutor layer.
- Full validation test suite for every safety rule.
- Better visual report export/print mode.
- More complete cost model with currency/version metadata.
- Room-level editing and multiple apartment templates.
- Accessibility audit and keyboard-first interactions.

### Important Decisions

1. The simulator uses 220V as the default single-phase residential voltage.
   - Reason: matches the requested educational model and keeps formulas understandable for a teenager.

2. The current main household breaker limit is 25A.
   - Reason: requested baseline; gives approximate max power of 5500W using `P = V x I`.

3. The wire table is intentionally simplified.
   - Reason: this is not a professional sizing tool; simplified limits help teach the relationship between current, wire size, and overheating risk.

4. Calculation logic is implemented in pure TypeScript functions.
   - Reason: enables unit testing and protects architecture as the simulator grows.

5. React Flow is used for the floor plan surface.
   - Reason: supports visual nodes and future graph/circuit interactions.

6. Zustand with local persistence is used for Phase 1 state.
   - Reason: simple local-first architecture, compatible with later migration to Tauri + SQLite.

7. Persian RTL is enforced in `index.html` and at runtime in `App.tsx`.
   - Reason: UI language and reading direction are product requirements, not optional styling.

### Simulation Limitations

The current simulator is educational only and does not model:

- National electrical code requirements.
- Real protective earth/grounding design.
- RCD/GFCI/RCCB protection behavior.
- Short-circuit current.
- Fault loop impedance.
- Cable grouping, installation method, ambient temperature, insulation derating, or conduit fill.
- Three-phase systems.
- Diversity/demand factors.
- Starting/inrush current for motors and compressors.
- Real circuit topology or conductor length derived from drawn geometry.
- Real material market prices.
- Professional bathroom/kitchen zone rules.

### Educational Assumptions

- Appliances connected in parallel are modeled by summing watts.
- Circuit current is calculated from total watts divided by 220V.
- Wire current capacity uses a simplified teaching table:
  - 1.5 mm2: about 10A, lighting
  - 2.5 mm2: about 16A, outlets
  - 4 mm2: about 25A, heavier circuits
  - 6 mm2: about 32A, feeder/heavier loads
- Breaker selection is evaluated against circuit current and selected wire capacity.
- Heavy appliances should preferably have separate circuits.
- Refrigerator should preferably be on a stable or dedicated circuit.
- Bathroom outlets are always treated as high-risk educational items.
- Kitchen should have multiple circuits because many kitchen appliances are high load.

### Important Formulas

- Current: `I = P / V`
- Power: `P = V x I`
- Resistance: `R = V / I`
- Total parallel load: `TotalPower = sum(appliance watts)`
- Total current: `TotalCurrent = TotalPower / 220`
- Approximate voltage drop: `VoltageDrop = Current x CableResistance`
- Current implementation uses `VoltageDrop = totalCurrent x resistanceOhmPerMeter x lengthMeters`

### Electrical Standards Used

No formal national or international electrical standard is implemented in Phase 1. The application uses the simplified educational rules provided by Mehdi/Vi in the Phase 1 brief. All warnings are teaching guidance, not approval rules.

Future architecture should isolate standard profiles if professional-like educational scenarios are added, for example:

- `EducationalSimplified220VProfile`
- `IranResidentialTeachingProfile`
- `IECConceptualProfile`

Those profiles should remain explicitly educational unless Mehdi and Vi approve a different product scope.

### UI/UX Principles

- Persian RTL first.
- Simple Persian educational explanations.
- Teenager-friendly visual simulator.
- Modern clean cards and clear warning colors.
- Dark/light support.
- Immediate feedback after circuit edits.
- Warning language should explain why a choice is unsafe or expensive, not merely mark it wrong.
- The first screen should be the simulator itself, not a marketing page.

### Persian RTL Requirements

- `html` must use `lang="fa"` and `dir="rtl"`.
- App runtime should preserve RTL by setting `document.documentElement.dir = 'rtl'`.
- Main educational explanations must be Persian.
- Numeric output can use Persian locale formatting through `toLocaleString('fa-IR')` and `Intl.NumberFormat('fa-IR')`.

### Current Verification State

Phase 1 was verified with:

- `npm test`: passed 7 tests.
- `npm run build`: passed.
- Local Vite server responded at `http://localhost:5173/` with HTTP 200.

Known verification gap:

- In-app browser automation timed out during visual verification. Manual browser view is available at the local URL, but automated screenshot verification was not completed.

## 2026-05-14 13:25 Europe/Istanbul - Version Control Governance Established

### Change Summary

The project entered long-term engineering development mode. A professional Git workflow was initialized for Kia Electric Lab with stable release, integration, feature, and experimental branch rules.

### New Governance Files

- `.gitignore`
- `CONTRIBUTING.md`
- `DEVELOPMENT_WORKFLOW.md`

### Branch Strategy Decision

- `main` is the stable release branch.
- `develop` is the active integration branch.
- `feature/*` branches are for isolated implementation work.
- `experimental/*` branches are for risky prototypes and uncertain architecture.

### Baseline Version Decision

The current Phase 1 source, documentation, and governance baseline is tagged as:

```text
v0.1-phase1-baseline
```

### Reason

The project is expected to grow into a larger simulator and educational platform. Version control is now required for rollback, continuity, reviewability, and release discipline.

### Continuity Rule

Future tasks must update `project-docs/` before committing when they affect implementation, architecture, electrical logic, cost logic, known issues, or project direction.

## 2026-05-14 13:40 Europe/Istanbul - Phase 2 Real Electrical Topology Engine

### Change Summary

Phase 2 introduced the first real internal electrical topology engine. React Flow remains a visualization layer; it is no longer the only representation of electrical connectivity. The new engine creates typed electrical terminals, real wire entities, a deterministic graph, traversal functions, current-flow simulation, and topology validation warnings.

### New Engine Modules

- `src/features/topology-engine/types.ts`
- `src/features/topology-engine/terminalCatalog.ts`
- `src/features/topology-engine/topologyEngine.ts`
- `src/features/current-engine/currentEngine.ts`
- `src/features/validation-engine/validationEngine.ts`
- `src/features/topology-engine/topologyEngine.test.ts`

### Data Model Additions

The electrical domain model now supports:

- `ElectricalTerminalRole`
- `ElectricalTerminalRef`
- `ElectricalWire`
- Optional `ElectricalProject.wires`

This means future UI work can create explicit wires and feed them directly into the simulation engine.

### Engineering Decision

The current Phase 1 project data did not contain explicit wire geometry. To preserve compatibility, the topology engine generates deterministic educational topology from existing circuit/component membership when `project.wires` is empty. If explicit wires exist, the engine uses those instead.

Reason:

- Avoids fake UI-only simulation.
- Allows existing projects to run through a real graph engine immediately.
- Provides a clean migration path toward real wire-routing UI.

### Current Engine Capability

The engine can now detect and/or calculate:

- Graph traversal from terminals.
- Breaker nodes per circuit.
- Phase and neutral terminal reachability.
- Open phase path.
- Open neutral path.
- Incomplete loops.
- Invalid breaker feed placement.
- Invalid switch wiring in lighting circuits.
- Direct phase-neutral short circuits.
- Topology-derived breaker overload.
- Wire current overload.
- Parallel branch load current.
- Voltage drop per wire using current, wire resistance, and length.

### Educational Persian Integration

Topology warnings are integrated into `generateSafetyWarnings(project)`, so the existing safety panel and final report now receive graph-based explanations in Persian.

### Current Limitation

The engine is real and deterministic, but the UI still does not allow users to draw explicit wire paths. Until that UI exists, normal Phase 1 projects use generated topology based on circuit membership. Explicit malformed wire cases are already supported and tested at the engine level.

## 2026-05-14 14:20 Europe/Istanbul - Phase 3 Terminal-Aware Wire Routing UI

### Change Summary

Phase 3 added user-authored terminal-aware wiring. The visual simulator can now create explicit `ElectricalWire[]` records by clicking source and target terminals. When explicit wires exist, Phase 2 topology uses them as the source of truth instead of generated fallback topology.

### New UI Capability

- Components expose clickable terminals.
- Virtual breaker nodes are visible on the floor plan.
- Wire drawing mode creates real `ElectricalWire` records.
- Wires render visually from project state.
- Selected wire is highlighted.
- Invalid wires are visually marked by dashed red styling.
- Wire inspector shows endpoints, type, wire size, length, resistance, voltage drop, current, safety status, and estimated cost.
- Users can delete wires, edit size, edit length, assign kind, clear invalid wires, reset circuit wiring, and reset room wiring.
- Guided mini-exercises were added for lamp/switch, two-gang switch, outlet, kitchen circuit, and refrigerator circuit practice.

### New Pure Logic

- `wireFactory.ts` validates terminal connections and creates explicit wires.
- `wireFactory.test.ts` covers terminal ref creation, wire kind inference, invalid connections, explicit short circuits, and incomplete loops.

### Engineering Decision

React Flow remains a visual surface only. It renders nodes, terminals, and wire edges from `ElectricalWire[]`, but does not define electrical truth.

### Verification

- `npm test`: 18 tests passed.
- `npm run build`: passed.
- Local server check: HTTP 200 from `http://localhost:5173/`.

Known verification gap:

- In-app browser automation timed out again while trying to inspect the updated UI. This should be retried when the browser automation runtime is stable.

## 2026-05-14 15:00 Europe/Istanbul - Phase 4 Geometric Wire Routing And Panelboard UI

### Change Summary

Phase 4 made wire routing spatially meaningful. Explicit `ElectricalWire[]` remains the source of truth, but wires now support route points, calculated geometric length, scale conversion, bend editing, and route-based cost/voltage-drop calculations. A simple educational panelboard UI was also added.

### New Capabilities

- Wires can store `routePoints`.
- Project can store `pixelsPerMeter`.
- Wire length is calculated from terminal coordinates and route geometry.
- Manual length override remains as an advanced educational option.
- Selected wires show bend handles.
- Users can add, drag, remove, snap, and reset bend points.
- Wire visuals render as SVG polylines instead of React Flow edge truth.
- Wire cost uses geometric length when explicit wires exist.
- Current/voltage-drop calculations use geometric length through topology graph construction.
- Panelboard UI shows main breaker, branch breakers, circuit assignments, breaker amps, circuit loads, and warning badges.

### Verification

- `npm test`: 26 tests passed.
- `npm run build`: passed.
- Local server returned HTTP 200.

Known verification gap:

- In-app browser automation timed out during visual inspection. Manual viewing remains available at `http://localhost:5173/`.

## 2026-05-14 15:25 Europe/Istanbul - Phase 5 Project Schema Versioning And Migration System

### Change Summary

Phase 5 introduced long-term data-governance infrastructure for Kia Electric Lab. The project now carries explicit schema metadata, has a pure TypeScript migration engine, protects local storage before hydration, and exposes a Persian Project Data panel for export, import, reset, corrupted-data export, and backup restoration.

### Project Metadata Now Stored

Each `ElectricalProject` now includes:

- `schemaVersion`
- `appVersion`
- `createdAt`
- `updatedAt`

Current values:

- Current schema version: `5`
- Current app version marker: `0.5-phase5-migrations`

### Completed Systems

- Pure project migration engine under `src/migrations/`.
- Version detection for Phase 1, Phase 2, Phase 3, Phase 4, and latest Phase 5 project shapes.
- Migration to latest schema while preserving explicit wires, route points, manual length overrides, panelboard assignments, scale, rooms, components, and circuits.
- Local-storage preparation before Zustand hydration.
- Automatic backup before migration.
- Corrupted-storage quarantine instead of app crash.
- Manual JSON export/import.
- Backup restore list.
- Persian UI feedback for import, export, migration, corrupted data, and backup restoration.
- Unit tests for version detection, legacy migration, wire preservation, panelboard preservation, corrupt-data handling, and latest schema validation.

### Engineering Decisions

- Migration logic is isolated from React UI so future Tauri/SQLite persistence can reuse the same migration path.
- Zustand remains the application-state owner, but storage is preflighted before the store hydrates.
- Historical project data is not silently discarded. When storage is incompatible or corrupt, the raw data is copied to backups and to a migration-error key for debugging/export.
- `ElectricalWire[]` remains the electrical source of truth. Phase 5 only protects persistence and does not alter simulation behavior.

### Simulation Limitations Preserved

- The tool remains educational and not a professional installation approval system.
- Schema migration validates data integrity but does not certify electrical correctness.
- Corrupt references can be warnings instead of fatal errors when the project can still load safely for educational correction.

### Next Memory Note

Future phases should treat schema migration as mandatory whenever adding new persistent fields, especially for grounding, advanced routing, panelboard slot models, multi-phase simulation, or AI tutor history.

## 2026-05-14 15:45 Europe/Istanbul - Phase 6 Project Diagnostics, Repair Tools, And Export Integrity

### Change Summary

Phase 6 added a professional project health layer above the Phase 5 migration system. Kia Electric Lab can now diagnose project integrity problems, explain them in Persian, repair only safe issues, manage backups more completely, and export project JSON with an integrity checksum envelope.

### New Completed Systems

- Pure diagnostics engine under `src/diagnostics/diagnosticsEngine.ts`.
- Pure conservative repair engine under `src/diagnostics/repairEngine.ts`.
- Export integrity envelope under `src/migrations/exportIntegrity.ts`.
- Persian Diagnostics panel under `src/features/project-diagnostics/ProjectDiagnosticsPanel.tsx`.
- Enhanced Project Data panel backup management.
- Browser-level localStorage migration fixture tests for Phase 1 through Phase 4 shapes.
- Import checksum validation with Persian warning on mismatch.

### Current Diagnostics Coverage

Diagnostics now detect:

- missing schema metadata
- invalid `pixelsPerMeter`
- duplicated ids
- components without valid room
- circuits without components
- circuits without panelboard breaker assignment
- circuits referencing missing components
- orphan wires
- wires referencing missing components
- wires referencing missing terminals
- invalid route geometry
- breakers assigned to missing circuits
- invalid cost catalog settings

### Repair Philosophy

Repairs are conservative:

- Safe repairs can be applied automatically.
- Non-safe issues remain visible and require human decision.
- Invalid/orphan wires may be removed because they cannot represent a valid electrical connection.
- Invalid panelboard assignments can be cleared without deleting the breaker slot.
- Invalid scale can be normalized to the educational default.
- Missing schema metadata can be regenerated.

### Export Integrity

Project export now uses a JSON envelope:

- format marker
- exported timestamp
- checksum algorithm
- checksum
- project body

The checksum is an educational/local integrity check, not a cryptographic trust or security system. It catches accidental edits or incomplete export/import changes.

### Engineering Continuity Note

Phase 6 establishes the basis for future project-repair workflows, AI tutor explanations, and Vi/Codex debug tools. Future schema changes should add both migration tests and diagnostics checks.

## 2026-05-14 16:10 Europe/Istanbul - Phase 7 Guided Lesson Mode For Kiarash

### Change Summary

Phase 7 turned Kia Electric Lab from only an engineering simulator into a guided Persian educational experience for Kiarash. The app now includes structured wiring missions, step-by-step lesson guidance, teenager-friendly feedback, scoring, hints, progress persistence, and schema-safe migration for lesson progress.

### New Educational Systems

- `lessonEngine.ts` defines lesson content and educational structure.
- `lessonValidation.ts` validates lessons using existing topology, safety, panelboard, current, and cost engines.
- `lessonProgress.ts` stores and updates progress immutably.
- `LessonPanel.tsx` provides Persian RTL lesson list, current lesson, checklist, hints, validation, scoring, and completion badges.

### Initial Lessons Implemented

1. روشن کردن یک لامپ با کلید تک‌پل
2. روشن کردن دو لامپ با کلید دوپل
3. ساخت یک پریز استاندارد فاز و نول
4. مدار اختصاصی یخچال
5. مدار آشپزخانه با مصرف‌کننده‌های سنگین
6. مقایسه سیم ۱.۵، ۲.۵ و ۴ میلی‌متر
7. انتخاب فیوز مناسب برای مدار
8. کاهش هزینه با مسیر سیم‌کشی بهتر

### Progress Persistence

Project schema advanced to version `6` and now stores:

- completed lessons
- attempts by lesson
- last active lesson
- score per lesson
- hints used
- last feedback

### Engineering Decision

Lesson validation does not duplicate electrical calculation formulas. It calls existing engines and adds only educational success criteria. For switch lessons, validation checks the educational switching path explicitly because the current topology model does not yet simulate internal closed-switch conduction as a physical component state.

### Current Limitation

Lesson reset currently clears explicit wires for the selected circuit, not a fully isolated lesson sandbox. This is safe for MVP but should become lesson-scoped workspace reset later.

## 2026-05-14 18:35 Europe/Istanbul - Phase 8 Lesson Sandbox Templates And Guided Floor-Plan Highlighting

### Change Summary

Phase 8 added a safe lesson sandbox mode so Kiarash can practice inside isolated lesson templates without damaging the main apartment project. The main project is preserved while the sandbox is active, and sandbox results can only replace the main project after explicit confirmation.

### New Educational Safety Model

- Main project is stored as a snapshot when a sandbox starts.
- Lesson project is generated from a data-driven template.
- Sandbox project uses `useExplicitWiresOnly` so generated fallback topology cannot fake lesson success.
- Exiting sandbox restores the untouched main project.
- Applying sandbox result to the main project is an explicit user action with Persian confirmation.

### Template And Guidance Systems

- `lessonSandbox.ts` creates lesson templates, sandbox state, reset behavior, apply behavior, and floor-plan highlights.
- Templates place required components, circuits, and panelboard breaker assignments for each lesson.
- Step guidance maps lesson steps to expected action type, target room, expected wire kind, and validation hint.
- Floor plan now highlights target rooms, required components, highlighted terminals, invalid wires, and ghost wire suggestions.

### Schema And Persistence

Project schema advanced to version `7`.

New persisted capability:

- active sandbox lesson id
- active sandbox project
- sandbox progress
- sandbox attempts
- sandbox startedAt
- main project snapshot during sandbox
- saved sandbox examples

### Important Decision

`useExplicitWiresOnly` was added to prevent sandbox templates from passing through generated topology fallback. This preserves educational honesty: Kiarash must draw the required wires to complete wiring lessons.

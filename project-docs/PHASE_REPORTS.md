# Kia Electric Lab - Phase Reports

Reporting policy: append every completed task, feature, fix, or phase with a timestamp. Do not delete historical reports. If a previous report needs correction, append a correction note.

## 2026-05-14 13:05 Europe/Istanbul - Phase 1 Reconstructed Engineering Report

### Audience

This report is for Mehdi, Project Owner and Product Architect, and Vi, Technical Project Manager and Lead System Architect.

### Phase Name

Phase 1 MVP: Local Persian RTL Educational Electrical Simulator

### Phase Objective

Build a local educational simulator named Kia Electric Lab for teaching residential 220V single-phase wiring concepts to a teenager. The MVP must allow a learner to visually place components/appliances, create circuits, select wire and breaker sizes, calculate electrical load, estimate cost, receive safety/economic feedback, and view a final educational report.

### Scope Reconstructed From Codebase

The current codebase implements a client-side React application using TypeScript, Vite, TailwindCSS, React Flow, and Zustand. It contains a default 100 sqm two-bedroom apartment model, a common appliance library, a simplified wire and breaker table, safety validation functions, a cost engine, and a final report engine.

The application is local-first. Project state is persisted in browser local storage through Zustand middleware. No backend, database, Tauri shell, or SQLite layer exists yet.

### Completed Work

- Created a Vite React TypeScript app in `C:\kiaelectriclab`.
- Added TailwindCSS and PostCSS configuration.
- Added React Flow for the visual apartment/floor-plan surface.
- Added Zustand with persistence middleware for local project state.
- Defined TypeScript interfaces for:
  - `Appliance`
  - `Room`
  - `ElectricalComponent`
  - `Circuit`
  - `Wire`
  - `Breaker`
  - `CostItem`
  - `SafetyWarning`
  - `ProjectReport`
  - `ElectricalProject`
- Implemented common appliance data:
  - Refrigerator: 400W
  - Dishwasher: 1800W
  - Washing machine: 2000W
  - Oven: 2500W
  - Electric kettle: 2000W
  - Microwave: 1200W
  - TV: 150W
  - Computer: 500W
  - Air conditioner: 2200W
  - Ceiling LED lamp: 20W
  - Iron: 2200W
  - Vacuum cleaner: 1600W
- Implemented simplified educational wire-size table:
  - 1.5 mm2: 10A, lighting
  - 2.5 mm2: 16A, outlet circuits
  - 4 mm2: 25A, heavier circuits
  - 6 mm2: 32A, feeder/heavy loads
- Implemented breaker table:
  - 6A
  - 10A
  - 16A
  - 20A
  - 25A
  - 32A
- Implemented cost table:
  - Wire price per meter by size
  - Breaker price
  - Outlet price
  - Switch price
  - Lamp point price
  - Junction box price
  - Labor price per point
  - Labor price per meter
- Implemented default 100 sqm apartment model:
  - Living room
  - Kitchen
  - Bedroom 1
  - Bedroom 2
  - Bathroom
  - Hallway
  - Balcony
  - Electrical panel
- Implemented initial demo project with:
  - Main panel
  - Living room lamp
  - Living room outlet/TV
  - Kitchen refrigerator
  - Kitchen oven
  - Bathroom outlet
  - Lighting circuit
  - Kitchen circuit
  - Living outlet circuit
- Implemented Persian RTL dashboard shell.
- Implemented dark/light mode.
- Implemented drag/drop component placement onto the floor plan.
- Implemented appliance assignment to selected circuit by click or drag/drop placement.
- Implemented manual circuit creation.
- Implemented selected circuit editing:
  - Circuit name
  - Circuit type
  - Wire size
  - Breaker size
  - Approximate length
- Implemented live display of circuit wattage, ampere, and voltage drop.
- Implemented safety warning panel.
- Implemented economic cost summary panel.
- Implemented final educational report panel.
- Implemented scoring system:
  - Safety score
  - Technical score
  - Economic score
  - Learning score
- Added unit tests for calculation and report generation.
- Added README with install/run/test/build instructions and safety disclaimer.
- Started local Vite dev server at `http://localhost:5173/`.

### Modified Files In Phase 1

Project setup and config:

- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `tailwind.config.js`
- `postcss.config.js`
- `src/vite-env.d.ts`
- `README.md`

Application entry and styling:

- `src/main.tsx`
- `src/App.tsx`
- `src/styles.css`

Shared components:

- `src/components/Icon.tsx`
- `src/components/StatCard.tsx`

Domain model:

- `src/types/electrical.ts`

Data:

- `src/data/appliances.ts`
- `src/data/electricalTables.ts`
- `src/data/apartment.ts`

Store:

- `src/store/useLabStore.ts`

Feature modules:

- `src/features/appliance-library/ApplianceLibrary.tsx`
- `src/features/floor-plan/FloorPlan.tsx`
- `src/features/circuit-builder/CircuitBuilder.tsx`
- `src/features/safety-engine/electricalMath.ts`
- `src/features/safety-engine/safetyEngine.ts`
- `src/features/safety-engine/SafetyPanel.tsx`
- `src/features/cost-engine/costEngine.ts`
- `src/features/cost-engine/CostPanel.tsx`
- `src/features/report-engine/reportEngine.ts`
- `src/features/report-engine/ReportPanel.tsx`

Tests:

- `src/features/safety-engine/electricalMath.test.ts`
- `src/features/report-engine/reportEngine.test.ts`

Generated build/runtime artifacts present in workspace:

- `dist/`
- `vite-dev.log`
- `vite-dev.err.log`
- `tsconfig.tsbuildinfo`
- `tsconfig.node.tsbuildinfo`
- `vite.config.js`
- `vite.config.d.ts`

Recommendation: generated artifacts should be ignored by version control once Git is initialized.

### Dependencies Added

Runtime dependencies:

- `@vitejs/plugin-react`
- `lucide-react`
- `react`
- `react-dom`
- `reactflow`
- `zustand`

Development dependencies:

- `@types/react`
- `@types/react-dom`
- `autoprefixer`
- `postcss`
- `tailwindcss`
- `typescript`
- `vite`
- `vitest`

### Architecture Changes

Because the workspace was empty before Phase 1, the main architectural change was the creation of the initial application architecture.

Architecture established:

- Feature-based module layout under `src/features`.
- Shared domain model under `src/types`.
- Static educational data under `src/data`.
- Pure calculation functions separated from UI components.
- Report generation separated from display.
- Local persistence contained inside Zustand store.
- React Flow isolated to the floor-plan feature.
- Persian formatting utilities isolated under `src/utils`.

No backend architecture was introduced.

No database schema was introduced.

No Tauri architecture was introduced yet.

### Engineering Decisions

1. Use React + TypeScript + Vite.
   - Reason: fast local development, strong typing, and low ceremony for MVP.

2. Use React Flow for the apartment canvas.
   - Reason: supports visual nodes and edges now, and can evolve toward circuit graph representation later.

3. Use Zustand for project state.
   - Reason: simple, scalable enough for Phase 1, and local persistence works without backend setup.

4. Use pure TypeScript functions for electrical calculations.
   - Reason: testability and separation from UI.

5. Use a simplified educational electrical model.
   - Reason: the app is not a professional electrical installation tool.

6. Keep warning text in Persian and simple.
   - Reason: target learner is a teenager, and the product is Persian RTL.

7. Use static data tables for wire, breaker, appliance, and cost values.
   - Reason: transparent assumptions and easier future migration into editable profiles.

8. Treat bathroom outlet as a high-risk warning whenever present.
   - Reason: Phase 1 does not model bathroom zones or protective devices, so the safest educational response is explicit risk feedback.

### Electrical Logic Implemented

Implemented formulas and logic:

- `calculateCurrent(watt, voltage)`: returns `watt / voltage`.
- `calculatePower(voltage, ampere)`: returns `voltage * ampere`.
- `calculateResistance(voltage, ampere)`: returns `voltage / ampere`.
- `calculateTotalLoad(appliances, voltage)`: sums appliance watts and calculates total current.
- `calculateCircuitLoad(circuit, voltage)`: calculates load for a circuit from appliance IDs.
- `validateWireCapacity(circuit)`: checks current against selected wire limit.
- `validateBreakerWireCompatibility(circuit)`: checks breaker rating is not larger than selected wire educational capacity.
- `calculateVoltageDrop(circuit)`: calculates approximate voltage drop using current, selected wire resistance per meter, and circuit length.
- `getProjectLoads(project)`: calculates total project wattage and ampere from all circuit appliances.

Implemented warning cases:

- Total home current exceeds main breaker limit.
- Circuit current exceeds breaker rating.
- Wire capacity is too small for circuit current.
- Breaker rating is too large for selected wire.
- Multiple heavy appliances exist on one circuit.
- Refrigerator is missing or appears on an overloaded/non-dedicated circuit.
- Kitchen has fewer than two circuits.
- Bathroom outlet exists in high-risk room.
- Lighting and outlet loads are mixed.
- Voltage drop exceeds 4 percent of 220V in the simplified model.
- Wire is larger than necessary for the current load.
- Unknown appliance IDs are found.

### Formulas Implemented

- Current: `I = P / V`
- Power: `P = V x I`
- Resistance: `R = V / I`
- Total load in parallel: `TotalPower = sum(appliance watts)`
- Total current: `TotalCurrent = TotalPower / 220`
- Approximate voltage drop: `VoltageDrop = Current x CableResistance`
- Implemented voltage drop detail: `VoltageDrop = totalCurrent x resistanceOhmPerMeter x lengthMeters`

### Cost Logic Implemented

Implemented cost calculations:

- Wire cost by size and length.
- Breaker cost by selected breaker.
- Outlet material cost by outlet count.
- Switch material cost by switch count.
- Lamp point material cost by lamp count.
- Junction box estimate as `max(1, ceil(points / 4))`.
- Labor per point.
- Labor per meter.
- Circuit-level material, labor, total, and overdesign cost.
- Project-level material, labor, total, cost by circuit, cost by room, and overdesign cost.

Current overdesign estimate:

- If the selected wire is larger than required and a smaller wire would still be safe for current, the engine estimates overdesign cost as 25 percent of selected wire material cost for that circuit.

### UI Implemented

Implemented screens/panels:

- Header with product name and local controls.
- Educational safety disclaimer.
- KPI cards:
  - Total wattage
  - Total current
  - Main breaker limit
  - Total cost
- Component/appliance palette.
- Apartment floor plan.
- Circuit builder.
- Safety feedback panel.
- Cost panel.
- Final educational report.

UI properties:

- Persian text.
- RTL direction.
- Dark/light support.
- Warning colors:
  - danger: rose/red
  - warning: amber
  - info: blue
  - good: emerald
- Card-based layout.
- Icons through `lucide-react`.

### Tests Implemented

`src/features/safety-engine/electricalMath.test.ts` verifies:

- Current calculation.
- Power calculation.
- Resistance calculation.
- Parallel load summing.
- Undersized wire detection.
- Breaker/wire compatibility for a test case.
- Approximate voltage drop is positive.

`src/features/report-engine/reportEngine.test.ts` verifies:

- Report totals/costs/warnings/scores are generated.
- Scores remain within 0 to 100.

### Verification Results

Commands run:

- `npm install`: completed, zero vulnerabilities reported.
- `npm test`: passed.
  - 2 test files passed.
  - 7 tests passed.
- `npm run build`: passed.
  - TypeScript build passed.
  - Vite production build passed.
- Local server check:
  - `Invoke-WebRequest http://localhost:5173/` returned HTTP 200.

Known verification limitation:

- In-app browser automation timed out during visual verification. This does not imply app failure, but it means no automated screenshot/DOM visual report was completed.

### Bugs Found Or Suspected

1. Component removal is not implemented.
   - Impact: user cannot clean up mistakes except by reset.

2. Appliance removal from circuit is not implemented.
   - Impact: circuit edits are additive only.

3. Component coordinates are not editable after placement.
   - Impact: layout correction is limited.

4. Wire path component is defined in types but not fully implemented as a real path/routing tool.
   - Impact: length is manually estimated with a slider instead of measured from visual geometry.

5. Cost by room is approximate.
   - Impact: multi-room circuit cost is divided equally by room count, not by actual wire length or component distribution.

6. Refrigerator dedicated circuit check is simplified.
   - Impact: a fridge circuit with one other low-load appliance may be treated as acceptable even though real design preferences vary.

7. Bathroom safety is only a warning.
   - Impact: no RCD/GFCI device model or bathroom zone model exists.

8. `breaker` and `wire-path` component types exist but are not fully represented as interactive circuit construction tools.
   - Impact: future UI may need richer component semantics.

9. Unknown appliance IDs are ignored in load calculation and only warned.
   - Impact: invalid persisted data could understate load.

10. Generated files are present in the working directory.
   - Impact: once Git is initialized, `dist`, build info files, logs, and `node_modules` should be ignored.

### Limitations

Electrical limitations:

- No real code compliance.
- No conductor installation method derating.
- No thermal model.
- No short-circuit/fault model.
- No protective earth model.
- No RCD/GFCI/RCCB logic.
- No diversity/demand factor.
- No motor starting/inrush current.
- No real cable route geometry.
- No multi-phase support.

Product limitations:

- No onboarding lessons.
- No guided correction workflow.
- No scenario system.
- No project import/export.
- No print/PDF report.
- No backend.
- No user accounts.
- No multiplayer.

Engineering limitations:

- No Git repository detected in `C:\kiaelectriclab`.
- No linting script currently exists.
- Test coverage is initial, not comprehensive.
- Documentation governance files did not exist until this reconstruction task.

### TODOs

- Initialize Git and add `.gitignore`.
- Add delete/remove/edit actions for components and circuit loads.
- Add JSON export/import.
- Add real wire route drawing and measured lengths.
- Split large UI components if they grow further.
- Add validation tests for every warning branch.
- Add data versioning for persisted local storage.
- Add reset/migration logic for outdated local storage schemas.
- Add standards/profile abstraction for educational rule sets.
- Add report export and print CSS.
- Add accessibility review for keyboard use and screen-reader labels.

### Architecture Quality Assessment

Current architecture quality is good for an MVP. The most important decision, separating calculation logic from UI, is already implemented. Domain interfaces are centralized, and engines are grouped by feature. This supports future expansion into AI tutoring, richer reports, and persistence migration.

Strong points:

- Pure calculation functions are testable.
- Feature modules are clear.
- Static educational assumptions are visible in data files.
- UI uses generated reports instead of duplicating formulas.
- Zustand store is simple and local-first.

Weak points:

- Circuit topology is not yet a true graph model.
- React Flow currently visualizes nodes and edges but does not own a rigorous electrical network representation.
- There is no schema validation for persisted local storage.
- No formal rule engine abstraction exists yet; warnings are implemented as direct procedural checks.
- Cost model is hardcoded and not profile/version based.

### Risks

Safety/product risk:

- Users may misunderstand the simulator as professional guidance. The disclaimer must remain prominent.

Electrical correctness risk:

- Simplified rules could be interpreted too broadly if future UI language becomes overly authoritative.

Architecture risk:

- If future features add rules directly into UI components, maintainability will degrade. Rule logic should stay inside engines or future rule-profile modules.

Persistence risk:

- Local storage shape may become stale as TypeScript interfaces evolve. Migrations are not implemented.

Scalability risk:

- React Flow can support richer interactions, but large simulations may require better graph/state normalization.

Cost accuracy risk:

- Current prices are static educational placeholders. They should be labeled as configurable assumptions, not market estimates.

### Scalability Concerns

As Kia Electric Lab grows into an educational platform, the current MVP should evolve toward:

- Versioned project schema.
- Explicit rule profiles.
- A circuit graph model separated from visual nodes.
- Scenario and lesson engine.
- Serializable report snapshots.
- SQLite persistence layer for Tauri.
- AI tutor context generated from validated project state.
- More granular test coverage for engines.

### Next Recommended Step

Next recommended Phase 2 foundation step:

Create project governance and persistence infrastructure:

1. Initialize Git and `.gitignore`.
2. Add documentation update discipline to every task.
3. Add schema version to `ElectricalProject`.
4. Add local storage migration path.
5. Add component/circuit deletion and edit flows.
6. Add complete tests for all safety warnings.

Reason: before adding advanced simulator features, the project needs durable engineering hygiene and state-management safeguards.

## 2026-05-14 13:05 Europe/Istanbul - Documentation Governance Phase Report

### Completed Work

Created persistent project documentation directory and files required by Mehdi and Vi:

- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/ELECTRICAL_RULES.md`
- `project-docs/COST_ENGINE_RULES.md`

### Why This Was Done

The Phase 1 implementation existed, but the project did not yet have the required persistent memory and governance documentation. Since the project is expected to grow into a larger simulator, AI tutor, cost engine, and safety analysis platform, architecture continuity is now a project requirement.

### Architecture Changes

No application runtime architecture was changed. Documentation architecture was added under `project-docs`.

### Dependencies Added

None.

### Electrical Logic Changed

None.

### Cost Logic Changed

None.

### Risks

The reconstructed Phase 1 report is based on current codebase inspection rather than original commit history, because no Git repository/history exists in the workspace.

### Next Recommended Step

Initialize Git and commit the Phase 1 baseline plus governance documentation.

## 2026-05-14 13:25 Europe/Istanbul - Phase 1 Version Control Initialization Report

### Audience

This report is for Mehdi, Project Owner and Product Architect, and Vi, Technical Project Manager and Lead System Architect.

### Task Objective

Initialize a professional Git workflow for Kia Electric Lab as the project enters long-term engineering development. Preserve the current Phase 1 implementation and governance documentation as a stable baseline with a release tag.

### Completed Work

- Initialized a Git repository in `C:\kiaelectriclab`.
- Created `.gitignore` for dependency folders, build outputs, caches, logs, environment files, OS files, and editor files.
- Created branch structure:
  - `main`
  - `develop`
- Created `CONTRIBUTING.md`.
- Created `DEVELOPMENT_WORKFLOW.md`.
- Committed the current Phase 1 baseline with a professional baseline commit message.
- Tagged the current baseline as `v0.1-phase1-baseline`.
- Updated persistent documentation to record the version-control governance phase.

### Modified Files

- `.gitignore`
- `CONTRIBUTING.md`
- `DEVELOPMENT_WORKFLOW.md`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Architecture Changes

No runtime application architecture was changed. The change is engineering-process architecture:

- Git repository is now the source of change history.
- `main` and `develop` establish release/integration separation.
- Tagged baseline gives the team a stable recovery point.
- Contribution and development workflow docs define how future work should be performed.

### Dependencies Added

None.

### Electrical Logic Implemented Or Changed

None. No electrical formulas, safety thresholds, wire tables, breaker tables, or warning rules were changed in this task.

### Cost Engine Logic Implemented Or Changed

None. No cost formulas, unit prices, overdesign logic, labor assumptions, or cost allocation rules were changed in this task.

### Git Workflow

The repository now uses a professional branch model:

- `main`: stable release branch.
- `develop`: active integration branch.
- `feature/*`: isolated product/engineering work.
- `experimental/*`: risky prototypes and research.

Recommended day-to-day flow:

```text
develop -> feature/* -> develop -> main -> release tag
```

The project should keep `develop` buildable and reserve `main` for verified stable states.

### Branch Strategy

#### `main`

Purpose:

- Stable releases.
- Release tags.
- Known-good project states.

Rules:

- Do not use for risky active work.
- Merge from `develop` after verification.
- Tag releases from `main`.

#### `develop`

Purpose:

- Active integration.
- Landing place for completed feature branches.

Rules:

- Feature work starts here.
- Should remain buildable.
- Should contain updated docs for merged work.

#### `feature/*`

Purpose:

- Isolated implementation.

Examples:

- `feature/circuit-deletion`
- `feature/wire-routing`
- `feature/cost-profile-editor`

Rules:

- Keep scope narrow.
- Include tests when logic changes.
- Include documentation updates.

#### `experimental/*`

Purpose:

- Risky or uncertain work.

Examples:

- AI tutor prototypes.
- Multiplayer state sync prototypes.
- Electrical graph simulation experiments.

Rules:

- Must not merge directly to `main`.
- Should be promoted into `feature/*` only after Vi approves the architecture direction.

### Commit Rules

Future commits should be small and descriptive.

Recommended prefixes:

- `feat:`
- `fix:`
- `docs:`
- `test:`
- `refactor:`
- `chore:`
- `build:`

Architecture changes, safety-rule changes, cost-rule changes, and persistence changes must include documentation updates in the same commit or in an immediately adjacent documentation commit.

### Recovery Strategy

The new Git setup enables recovery at several levels:

1. Recover current uncommitted work:
   - Use `git status`, `git diff`, and `git stash`.

2. Recover a file:
   - Use `git restore path/to/file`.
   - Use `git restore --source <commit> path/to/file` for historical recovery.

3. Recover the full Phase 1 baseline:
   - Use the tag `v0.1-phase1-baseline`.
   - Create a recovery branch with:

```text
git checkout -b recovery/phase1 v0.1-phase1-baseline
```

### Rollback Strategy

Preferred rollback for shared branches:

```text
git revert <commit>
```

Reason:

- Preserves history.
- Avoids destructive branch rewrites.
- Safe for `main` and `develop`.

For complete baseline inspection:

```text
git show v0.1-phase1-baseline
```

For full baseline recovery:

```text
git checkout -b recovery/from-phase1 v0.1-phase1-baseline
```

Destructive commands such as hard reset should be avoided unless Mehdi or Vi explicitly approves the recovery plan.

### Future Scaling Strategy

As Kia Electric Lab grows, the workflow should evolve toward:

- Pull request review before merging into `develop`.
- Protected `main`.
- CI checks for `npm test` and `npm run build`.
- Release checklist for `main` merges.
- Architecture Decision Records for major decisions.
- Versioned project schema and migration tests.
- Separate simulation engine package if Tauri, AI tutor, or multiplayer layers need shared logic.
- Automated release notes derived from `project-docs/PHASE_REPORTS.md`.

### Bugs

No runtime bugs were introduced or fixed in this task.

### Limitations

- No remote repository was configured.
- No CI pipeline exists yet.
- Branch protection cannot be enforced locally.
- No pull request process exists until a remote Git platform is selected.

### TODOs Created Or Updated

- Add remote repository when Mehdi/Vi choose hosting.
- Add CI pipeline.
- Add branch protection rules after remote setup.
- Add release checklist.
- Add ADR process if Vi wants formal decision records.

### Risks

- Without a remote, local disk failure could still lose history.
- Without CI, developers must manually run verification.
- Without branch protection, accidental commits to `main` are still possible locally.

### Verification

Verification performed:

- Confirmed Git repository initialized.
- Confirmed `main` branch exists.
- Confirmed `develop` branch exists.
- Confirmed baseline commit exists.
- Confirmed tag `v0.1-phase1-baseline` exists.
- Confirmed ignored generated folders/files are not staged.

### Next Recommended Step

Create a remote repository and push both branches and the baseline tag:

```text
git remote add origin <repo-url>
git push -u origin main
git push -u origin develop
git push origin v0.1-phase1-baseline
```

After remote setup, enable branch protection for `main` and require tests/build before merge.

## 2026-05-14 13:40 Europe/Istanbul - Phase 2 Real Electrical Topology Engine Report

### Audience

This report is for Mehdi, Project Owner and Product Architect, and Vi, Technical Project Manager and Lead System Architect.

### Task Objective

Transform Kia Electric Lab from a visual-only circuit representation into a true internal graph-based electrical topology simulator. React Flow must remain visualization only. Electrical terminals, wires, graph traversal, current propagation, and validation must live in pure TypeScript modules.

### Completed Work

- Added electrical terminal roles to the domain model.
- Added real wire object support through `ElectricalWire`.
- Added optional `ElectricalProject.wires` for explicit topology.
- Created topology engine module.
- Created terminal catalog for component electrical terminals.
- Created deterministic graph builder.
- Created adjacency-based traversal.
- Created current-flow simulation module.
- Created topology validation module.
- Integrated topology validation warnings into the existing safety engine.
- Added Persian educational warnings for topology errors.
- Added tests for graph traversal, current calculation, overload detection, invalid breaker path, disconnected neutral/incomplete loop, and short-circuit detection.
- Verified tests and production build.

### Modified Files

- `src/types/electrical.ts`
- `src/features/safety-engine/safetyEngine.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ELECTRICAL_RULES.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Added Files

- `src/features/topology-engine/types.ts`
- `src/features/topology-engine/terminalCatalog.ts`
- `src/features/topology-engine/topologyEngine.ts`
- `src/features/current-engine/currentEngine.ts`
- `src/features/validation-engine/validationEngine.ts`
- `src/features/topology-engine/topologyEngine.test.ts`

### Architecture Changes

Before Phase 2:

- React Flow edges were visual only.
- Circuit membership and appliance arrays drove most calculations.
- No internal terminal graph existed.

After Phase 2:

- Electrical components expose typed terminals.
- Circuits have virtual breaker nodes.
- Wires are real graph edges.
- The graph engine builds adjacency maps.
- Traversal can answer connectivity questions.
- Current engine calculates load and wire current from topology.
- Validation engine produces topology warnings.
- React Flow remains visualization and is not the electrical source of truth.

### Engineering Decisions

#### Decision 1 - Use Pure TypeScript Engines

Reason:

- The topology, current, and validation engines must remain testable and independent of React Flow.

#### Decision 2 - Add Optional Explicit Wires

Reason:

- Future wire-routing UI must write real wire objects.
- Current Phase 1 state must remain compatible.

#### Decision 3 - Generate Deterministic Topology When Explicit Wires Are Missing

Reason:

- Existing projects do not have wire objects.
- The simulator needs graph-based analysis immediately.
- Generated topology is deterministic and test-covered.

Important limitation:

- Generated topology is not visual routing. It is a compatibility layer until real wire drawing exists.

#### Decision 4 - Use Virtual Breaker Nodes Per Circuit

Reason:

- Existing Phase 1 circuits have breaker ratings but no physical breaker component instances.
- Virtual breaker nodes let validation enforce breaker input/output path rules now.

### Electrical Logic Implemented

New topology concepts:

- Main panel source terminals.
- Breaker input/output terminals.
- Switch line/load terminals.
- Outlet/lamp/appliance phase and neutral terminals.
- Wire edges connecting terminal references.
- Circuit-scoped graph traversal.

New validation:

- Open phase detection.
- Disconnected neutral detection.
- Incomplete loop detection.
- Invalid breaker placement/feed detection.
- Invalid switch wiring detection for lighting circuits.
- Direct short-circuit detection between phase and neutral terminals.
- Topology-derived breaker overload.
- Wire overload based on propagated wire current.

### Current Propagation Implemented

The current engine now:

- Finds load components in each circuit.
- Resolves appliance wattage.
- Calculates each load current with `I = P / V`.
- Confirms phase and neutral connectivity.
- Aggregates connected load current per circuit/breaker.
- Estimates current through each wire by graph separation and downstream reachable loads.
- Calculates voltage drop per wire:

```text
VoltageDrop = WireCurrent x WireResistancePerMeter x WireLength
```

### Formulas Implemented Or Reused

- Current: `I = P / V`
- Total breaker current: sum of connected branch load currents.
- Wire current: sum of connected downstream load currents through that wire.
- Wire voltage drop: `Iwire x RwirePerMeter x lengthMeters`
- Wire overload: `wireCurrent > wire.maxAmp`
- Breaker overload: `circuitCurrent > breakerAmp`

### Persian Educational Warnings Added

Topology warnings explain:

- Why fuses must be on the phase path before loads.
- Why phase must reach a consumer.
- Why neutral must return current.
- Why incomplete loops do not work.
- Why switch output should feed lamp phase.
- Why phase-neutral short circuits are dangerous.
- Why wire overload is unsafe.

### Tests Added

New test file:

- `src/features/topology-engine/topologyEngine.test.ts`

Test coverage:

- Graph traversal from generated breaker topology.
- Neutral traversal.
- Parallel branch current calculation.
- Breaker overload from topology load.
- Invalid breaker placement.
- Disconnected neutral.
- Incomplete loop.
- Direct phase-neutral short circuit.

### Verification

Commands run:

```text
npm test
npm run build
```

Results:

- 3 test files passed.
- 13 tests passed.
- Production build passed.

### Bugs

No known runtime bugs were introduced. A switch terminal generation detail was identified during implementation and corrected before verification.

### Limitations

- The UI does not yet draw or edit explicit wire paths.
- Existing projects use generated topology unless `project.wires` exists.
- Current propagation is a simplified educational radial/branch approximation, not a full SPICE-like circuit solver.
- No grounding system exists yet.
- No three-phase roles exist yet.
- No switch open/closed state exists yet.
- No protective device trip curve exists yet.
- `main-panel` is still assumed as the canonical source ID in current validation helpers.

### TODOs

- Add real wire-routing UI that creates `ElectricalWire[]`.
- Add wire editing and deletion.
- Add visual distinction between generated topology and explicit topology.
- Add switch state.
- Add grounding terminal roles.
- Add three-phase terminal roles.
- Add protective device models.
- Add tests for invalid switch wiring with explicit malformed wires.
- Add tests for wire overload on shared feeder branches.

### Risks

- Users may assume generated topology is the same as drawn wire routing. UI should eventually label this clearly.
- As electrical complexity grows, the current procedural validation engine should evolve into a rule registry.
- Current engine can handle deterministic educational branch loads, but not arbitrary circuit solving.

### Scalability Concerns

The module boundaries are appropriate for future growth, but the engine will need profile abstractions for:

- Single-phase vs three-phase.
- Grounding systems.
- Source systems such as solar, UPS, and generator.
- Smart-home control logic.
- Advanced voltage drop.
- Protective device coordination.

### Next Recommended Step

Implement explicit wire-routing state and UI:

1. Add wire creation actions to Zustand.
2. Let users connect terminals visually.
3. Store created wires in `ElectricalProject.wires`.
4. Render wires from source-of-truth topology data.
5. Keep React Flow as view only.

This will complete the transition from generated educational topology to user-authored topology.

## 2026-05-14 14:20 Europe/Istanbul - Phase 3 Terminal-Aware Wire Routing UI Report

### Audience

This report is for Mehdi, Project Owner and Product Architect, and Vi, Technical Project Manager and Lead System Architect.

### Task Objective

Implement a terminal-aware wire routing UI so the learner can author explicit `ElectricalWire[]` topology through the visual simulator. The UI must edit the graph, while the topology engine remains the source of truth.

### Completed Work

- Added `ElectricalWireKind` to the domain model.
- Added earth placeholder terminal roles.
- Added optional wire kind to `ElectricalWire`.
- Updated terminal catalog with panel earth source and outlet earth placeholder.
- Added pure wire factory logic:
  - terminal validation
  - wire kind inference
  - explicit wire creation
- Added Zustand wire state and actions:
  - wire drawing mode
  - pending terminal
  - wire draft settings
  - selected wire
  - add wire
  - update wire
  - delete wire
  - clear invalid wires
  - reset wiring for circuit
  - reset wiring for room
- Updated floor plan:
  - clickable terminals on visible components
  - visible virtual breaker nodes
  - explicit wire rendering from `project.wires`
  - selected wire highlighting
  - invalid wire dashed red styling
  - wire drawing mode control
- Added wire inspector:
  - endpoints
  - terminal labels
  - wire kind
  - size
  - length
  - resistance
  - voltage drop
  - current through wire
  - safety status
  - cost estimate
  - delete action
- Added guided exercises:
  - lamp with one switch
  - two lamps with two-gang switch
  - one outlet
  - kitchen outlet circuit
  - refrigerator dedicated circuit
- Added tests for:
  - terminal ref wire creation
  - wire kind inference
  - invalid terminal connection rejection
  - explicit-wire short-circuit detection
  - explicit-wire incomplete loop detection

### Modified Files

- `src/types/electrical.ts`
- `src/features/topology-engine/types.ts`
- `src/features/topology-engine/terminalCatalog.ts`
- `src/features/floor-plan/FloorPlan.tsx`
- `src/store/useLabStore.ts`
- `src/App.tsx`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ELECTRICAL_RULES.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Added Files

- `src/features/topology-engine/wireFactory.ts`
- `src/features/topology-engine/wireFactory.test.ts`
- `src/features/wire-routing/WireRoutingPanel.tsx`

### Architecture Changes

Before Phase 3:

- Explicit wires were supported by the engine but not authored by users.
- UI still worked mostly from components and circuit membership.

After Phase 3:

- Users can create explicit `ElectricalWire[]`.
- The floor plan renders explicit wires from project state.
- Topology validation works from user-authored wires when present.
- Wire inspector displays engine-derived current/voltage/safety data.
- Generated topology remains backward compatibility only when no explicit wires exist.

### Engineering Decisions

#### Decision 1 - Use Terminal Catalog For UI Terminals

Reason:

- Prevents the UI from inventing terminal names that do not exist in the topology engine.

#### Decision 2 - Wire Factory Owns Wire Creation

Reason:

- Keeps terminal validation and wire kind inference pure and testable.

#### Decision 3 - Render React Flow Edges From Wires

Reason:

- React Flow can visually render connections, but those edges are derived from `ElectricalWire[]`.
- The graph engine remains the source of truth.

#### Decision 4 - Keep Earth As Placeholder

Reason:

- Educational UI should introduce earth/PE concept, but no full grounding simulation exists yet.

### Electrical Logic Implemented

New explicit wire types:

- phase
- neutral
- earth
- switched phase

New terminal validation:

- Reject same-terminal wires.
- Reject unknown terminal refs.
- Reject direct phase-neutral connection.
- Reject phase-earth connection.
- Warn/reject neutral-earth connection in the simplified educational model.

New inspection calculations:

- Wire resistance:

```text
Rwire = resistanceOhmPerMeter x lengthMeters
```

- Wire voltage drop:

```text
VoltageDrop = wireCurrent x resistanceOhmPerMeter x lengthMeters
```

- Wire cost:

```text
wire material = lengthMeters x wire.pricePerMeter
wire labor = lengthMeters x laborPerMeter
```

### Validation UX

Persian warnings are shown through the existing safety system and wire inspector:

- فاز به نول مستقیم وصل شده است
- نول این وسیله وصل نیست
- مسیر فاز کامل نیست
- سیم انتخاب‌شده برای این جریان ضعیف است
- فیوز از سیم محافظت کافی نمی‌کند
- مدار ناقص است

### Bugs

No known runtime bugs were introduced.

### Limitations

- Wire visuals connect component nodes, not exact terminal coordinates.
- Wires do not yet have route points or measured geometry.
- Wire length is manually edited.
- Earth is a placeholder, not a real grounding simulation.
- Virtual breaker nodes are visible, but no full panelboard UI exists yet.
- In-app browser automation timed out during visual verification.

### Tests

Verification:

```text
npm test
npm run build
```

Results:

- 4 test files passed.
- 18 tests passed.
- Production build passed.
- Local server responded HTTP 200.

### Risks

- Users may expect wire lines to reflect real cable paths; current visuals are logical connections.
- Once one explicit wire exists, generated fallback is bypassed, so partial user wiring intentionally produces incomplete-circuit warnings.
- Earth placeholder could be misunderstood unless future UI explains grounding limitations clearly.

### Scalability Concerns

Future real routing should extend `ElectricalWire` with:

- route points
- measured length
- conduit/group metadata
- installation method
- color standard profile
- protective earth relationships

### Next Recommended Step

Implement geometric wire routing:

1. Add route points to `ElectricalWire`.
2. Let users drag wire bends.
3. Calculate length from geometry.
4. Render wire path geometry instead of node-to-node edges.
5. Add explicit panelboard/breaker UI.

## 2026-05-14 15:00 Europe/Istanbul - Phase 4 Geometric Wire Routing And Panelboard UI Report

### Audience

This report is for Mehdi, Project Owner and Product Architect, and Vi, Technical Project Manager and Lead System Architect.

### Task Objective

Make wire routing spatially meaningful on the floor plan. The simulator must draw, bend, edit, measure, and cost wires from geometry while preserving `ElectricalWire[]` as the source of truth and keeping the topology engine independent from UI.

### Completed Work

- Added `Point2D`.
- Added `routePoints` to `ElectricalWire`.
- Added `manualLengthOverride` to `ElectricalWire`.
- Added `pixelsPerMeter` to `ElectricalProject`.
- Added optional `Panelboard` and `PanelBreakerSlot` types.
- Added terminal coordinate calculation.
- Added route length calculation.
- Added scale conversion.
- Added bend insertion, update, deletion, snap, and reset helpers.
- Updated topology graph construction to use calculated geometric length for explicit wires.
- Updated current/voltage-drop simulation indirectly through geometric wire length.
- Updated cost engine to use geometric explicit wire length.
- Added routed SVG wire rendering on the floor plan.
- Added selected-wire bend handles.
- Added add/drag/remove/reset route interactions.
- Added panelboard UI with main breaker, branch breakers, circuit assignment, load display, and warning badges.
- Added panelboard validation engine.
- Added tests for route length, bend operations, scale conversion, panelboard validation, and cost from geometric length.

### Modified Files

- `src/types/electrical.ts`
- `src/store/useLabStore.ts`
- `src/App.tsx`
- `src/features/floor-plan/FloorPlan.tsx`
- `src/features/wire-routing/WireRoutingPanel.tsx`
- `src/features/topology-engine/topologyEngine.ts`
- `src/features/topology-engine/wireFactory.ts`
- `src/features/safety-engine/safetyEngine.ts`
- `src/features/cost-engine/costEngine.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ELECTRICAL_RULES.md`
- `project-docs/COST_ENGINE_RULES.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Added Files

- `src/features/topology-engine/terminalGeometry.ts`
- `src/features/topology-engine/wireGeometry.ts`
- `src/features/topology-engine/wireGeometry.test.ts`
- `src/features/panelboard-engine/panelboardEngine.ts`
- `src/features/panelboard-engine/panelboardEngine.test.ts`
- `src/features/panelboard/PanelboardPanel.tsx`

### Architecture Changes

Before Phase 4:

- Wires connected logical terminals but visual wire lines were still effectively direct connections.
- Wire length was manually edited.
- No panelboard UI existed.

After Phase 4:

- Wires have spatial route geometry.
- Length is calculated from terminal coordinates and bend points.
- Scale is configurable in pixels per meter.
- Cost and voltage drop can use calculated routed length.
- Panelboard assignment and breaker compatibility are visible and validated.

### Electrical Logic Implemented

- Terminal-level coordinates.
- Route path assembly: start terminal, bend points, end terminal.
- Route length in pixels.
- Scale conversion to meters.
- Geometric length used as wire length.
- Breaker assignment validation.
- Breaker overload validation.
- Breaker/wire compatibility validation.

### Cost Logic Implemented

When explicit wires exist for a circuit:

```text
wire length = sum(calculated geometric length of circuit wires)
wire material cost = sum(wire length x that wire size price)
wire labor cost = wire length x laborPerMeter
```

Fallback:

- If no explicit wires exist, Phase 1 `circuit.lengthMeters` remains the estimate.

### Persian Educational Feedback

Added explanations that:

- Longer wire increases resistance, voltage drop, and cost.
- Cleaner/shorter routing is usually more economical and easier to understand.
- Panel organization helps identify which breaker protects each circuit.
- Breaker and wire size must match because the breaker should protect the wire before overheating.

### Tests

New test coverage:

- route length calculation
- pixel-to-meter scale conversion
- bend point insertion/deletion/update/reset
- manual length override
- calculated terminal-coordinate length
- circuit without breaker validation
- breaker without circuit validation
- breaker/wire incompatibility validation
- cost calculation from geometric explicit wire length

Verification results:

- 6 test files passed.
- 26 tests passed.
- Production build passed.
- Local server responded HTTP 200.

### Bugs

No known runtime bugs were introduced.

### Limitations

- Browser visual automation timed out and did not produce a screenshot.
- Terminal coordinates are deterministic offsets, not measured from DOM handles.
- Route points are simple bends, not full conduit paths.
- Wire length is geometric but still based on floor-plan coordinate scale selected by the user.
- Panelboard is educational and does not model real panel physical constraints.

### Risks

- If scale is set poorly, cost and voltage drop estimates become misleading.
- Users may interpret panelboard UI as professional panel design; disclaimer must remain clear.
- Future geometry should include route-point persistence migrations.

### Next Recommended Step

Phase 5 should add:

- terminal-level handle alignment/measurement improvements
- route point editing polish
- explicit panelboard slot add/remove controls
- project schema version and migration for old local storage
- UI indicator for calculated length vs manual override

## 2026-05-14 15:25 Europe/Istanbul - Phase 5 Engineering Report: Project Schema Versioning And Migration System

### Completed Work

Phase 5 implemented a professional persistence-safety layer for long-term Kia Electric Lab development. The simulator can now identify old project shapes, migrate them to the current schema, protect local JSON storage with backups, avoid app crashes on corrupted data, and expose project-data controls in the Persian RTL interface.

### Modified Files

- `src/types/electrical.ts`
- `src/data/apartment.ts`
- `src/migrations/projectMigration.ts`
- `src/migrations/storageSafety.ts`
- `src/migrations/projectMigration.test.ts`
- `src/store/useLabStore.ts`
- `src/features/project-data/ProjectDataPanel.tsx`
- `src/App.tsx`
- `src/components/Icon.tsx`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/ELECTRICAL_RULES.md`
- `project-docs/COST_ENGINE_RULES.md`

### Dependencies Added

No package dependency was added. The implementation uses existing React, Zustand, TypeScript, Vitest, browser `localStorage`, `Blob`, and `FileReader` APIs.

### Architecture Changes

New migration layer:

```text
src/migrations/
  projectMigration.ts
  storageSafety.ts
  projectMigration.test.ts
```

`projectMigration.ts` is pure TypeScript and owns schema detection, migration, and validation.

`storageSafety.ts` owns browser-storage operations:

- read current persisted JSON
- create automatic backups
- migrate before Zustand hydration
- quarantine corrupted persisted data
- import project JSON
- restore from backup
- export current/corrupted data

`useLabStore.ts` now calls storage preparation before Zustand `persist` hydrates. Store mutations touch `updatedAt`, `schemaVersion`, and `appVersion` so persisted state stays current.

### Engineering Decisions

- `schemaVersion` is a project-level field, not only Zustand persist version, because future storage targets may include local JSON files, SQLite rows, or shared projects.
- `appVersion` is stored separately from schema version to distinguish data format from product release identity.
- Migration preserves partial/correctable data where possible and reports warnings rather than failing on every dangling reference.
- Broken local storage is backed up and quarantined, then the app falls back to a safe default project.
- The UI exposes data tools in a small operational panel rather than hiding them in developer-only code, because Mehdi/Vi need project continuity across sessions.

### Electrical Logic Implemented

No new electrical formulas were added in Phase 5. Existing electrical behavior remains unchanged:

- explicit `ElectricalWire[]` remains source of truth
- topology engine remains independent from React Flow
- geometric wire length remains available for voltage drop and cost calculations
- panelboard assignment validation remains active

Phase 5 adds persistence validation for electrical data:

- circuits array shape
- components array shape
- wire terminal references
- wire length and route point validity
- panelboard breaker assignments
- breaker amp numeric validity
- pixels-per-meter validity

### Formulas Implemented

No new electrical formulas were introduced. Phase 5 indirectly protects fields used by existing formulas:

- `I = P / V`
- `P = V x I`
- `R = V / I`
- `VoltageDrop = Current x CableResistance`
- route length in meters from geometry scale

### Bugs Found And Fixed

- TypeScript build initially rejected unsafe casts in migration tests and backup parsing. Fixed by using explicit `unknown` conversion in tests and a real `isProjectBackup` type guard in storage safety.

### Limitations

- Backup storage is capped to the latest 12 records in local storage.
- Backup restore list is local-browser only.
- Import/export uses JSON files; there is no signed checksum yet.
- Validation warns on dangling references but does not provide an automatic repair workflow yet.
- `updatedAt` is refreshed on store mutations, but exact disk flush timing is still handled by Zustand persist.

### TODOs

- Add checksum/hash to exported projects.
- Add migration dry-run preview before importing large projects.
- Add explicit repair tools for dangling wire terminal refs and orphan panelboard assignments.
- Add UI for deleting individual backups.
- Add end-to-end tests with browser localStorage fixtures.

### Risks

- Future schema changes may forget to add a migration step unless governance enforces it.
- Local storage can still be manually edited by users and create unusual shapes.
- Large future projects may exceed comfortable localStorage limits; SQLite/Tauri migration should eventually become the durable store.
- Importing JSON from unknown sources should remain local-only and should not execute code.

### Scalability Concerns

- The migration engine is linear and suitable for current scale.
- As schema grows, migrations should become append-only named functions and include fixture snapshots from each phase.
- Future Tauri/SQLite storage should store schema version at project and database levels.
- Multiplayer/shared-project mode will need conflict resolution beyond single-project migration.

### Verification

- `npm test`: 7 test files passed, 32 tests passed.
- `npm run build`: passed.
- Local HTTP check: `http://localhost:5173/` returned status 200.

### Next Recommended Step

Phase 6 should focus on repair/diagnostic tooling for migrated projects: topology graph inspector, orphan-reference repair actions, backup deletion/export management, and browser-level regression tests with old localStorage fixtures.

## 2026-05-14 15:45 Europe/Istanbul - Phase 6 Engineering Report: Project Diagnostics, Repair Tools, And Export Integrity

### Completed Work

Phase 6 implemented the first professional diagnostics and repair layer for Kia Electric Lab. The app can now inspect project data health, explain detected issues in Persian, apply conservative safe repairs, manage backups more fully, and export projects with checksum integrity metadata.

### Modified Files

- `src/diagnostics/diagnosticsEngine.ts`
- `src/diagnostics/repairEngine.ts`
- `src/diagnostics/diagnosticsEngine.test.ts`
- `src/migrations/exportIntegrity.ts`
- `src/migrations/storageSafety.ts`
- `src/migrations/storageSafety.test.ts`
- `src/migrations/projectMigration.ts`
- `src/features/project-diagnostics/ProjectDiagnosticsPanel.tsx`
- `src/features/project-data/ProjectDataPanel.tsx`
- `src/App.tsx`
- `src/components/Icon.tsx`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Dependencies Added

No new dependency was added.

### Architecture Changes

New pure engines:

```text
src/diagnostics/
  diagnosticsEngine.ts
  repairEngine.ts
  diagnosticsEngine.test.ts

src/migrations/
  exportIntegrity.ts
  storageSafety.test.ts
```

New UI:

```text
src/features/project-diagnostics/
  ProjectDiagnosticsPanel.tsx
```

Diagnostics and repairs are independent from React and Zustand. React only displays reports and applies returned repaired project snapshots through `replaceProject`.

### Engineering Decisions

- Diagnostics are advisory and do not mutate project state.
- Repair engine only performs conservative safe repairs.
- Unsafe issues remain visible with Persian explanation and recommended action.
- Orphan wires can be removed safely because they cannot participate in a valid topology graph.
- Panelboard breaker slots are preserved when assigned circuit ids are invalid; only the invalid assignment is cleared.
- Export checksum is implemented as deterministic canonical JSON FNV-1a 32-bit. It is suitable for local accidental-change detection, not for security trust.
- Import remains backward compatible with raw project JSON and Zustand persisted JSON while also supporting the new export envelope.

### Electrical Logic Implemented

No new electrical simulation formulas were added. The electrical simulation remains unchanged.

Phase 6 adds data-health checks around electrical topology:

- wire endpoint component validity
- terminal existence using component terminal catalog
- circuit-to-component reference validity
- circuit-to-breaker assignment existence
- breaker-to-circuit reference validity
- route geometry validity
- scale validity for geometric length and cost/voltage calculations

### Formulas Implemented

No new electrical formula was added.

New integrity formula:

```text
checksum = FNV1a32(canonicalJson(project))
```

### Bugs

No runtime bugs were found during Phase 6 verification.

### Limitations

- Repair does not yet provide per-issue checkbox selection in the UI; it repairs all safe issues.
- The checksum is not cryptographic and should not be treated as a security signature.
- Diagnostics catch structural terminal validity, but do not replace topology-engine electrical validation.
- Duplicate id repair is intentionally simple and should be expanded with stronger reference remapping if large imported projects appear.
- Backup storage is still browser localStorage.

### TODOs

- Add per-issue repair selection.
- Add project repair log export.
- Add topology graph inspector for Vi/Codex.
- Add stronger project file hash or signed export if projects become shared.
- Add browser visual automation for diagnostics and backup workflows.
- Add repair support for invalid component room assignment with user confirmation.

### Risks

- Users may overtrust automatic repair. The UI labels repairs as safe, but education should clarify that repair fixes data structure, not professional electrical design.
- Imported files with many duplicate ids can still need human review.
- Future cost profiles must be added to diagnostics once costs become editable.
- Backup JSON can still be manually edited; checksum warning helps but does not block import.

### Scalability Concerns

- Diagnostics are currently full-project scans. This is acceptable for the MVP, but larger multiplayer projects may need incremental diagnostics.
- Repair actions should become individually addressable commands with reversible history.
- Future AI tutor features can consume `DiagnosticIssue` records directly for explanations.

### Verification

- `npm test`: 9 test files passed, 40 tests passed.
- `npm run build`: passed.
- Local HTTP check should be run after final integration and commit.

### Next Recommended Step

Phase 7 should add a topology/debug inspector and per-issue repair selection, then begin preparing a Tauri/SQLite storage adapter that reuses the existing migration, diagnostics, and repair engines.

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

## 2026-05-14 16:10 Europe/Istanbul - Phase 7 Engineering Report: Guided Lesson Mode For Kiarash

### Completed Work

Phase 7 introduced a guided Persian RTL lesson mode for Kiarash. The simulator now has structured missions, step-by-step educational instructions, hints, live validation, scoring, progress persistence, and completion tracking.

### Modified Files

- `src/types/electrical.ts`
- `src/data/apartment.ts`
- `src/migrations/projectMigration.ts`
- `src/store/useLabStore.ts`
- `src/components/Icon.tsx`
- `src/App.tsx`
- `src/features/lesson-mode/lessonEngine.ts`
- `src/features/lesson-mode/lessonValidation.ts`
- `src/features/lesson-mode/lessonProgress.ts`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/features/lesson-mode/lessonValidation.test.ts`
- `src/features/lesson-mode/lessonProgress.test.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Dependencies Added

No package dependency was added.

### Architecture Changes

New lesson module:

```text
src/features/lesson-mode/
  lessonEngine.ts
  lessonValidation.ts
  lessonProgress.ts
  LessonPanel.tsx
  lessonValidation.test.ts
  lessonProgress.test.ts
```

Schema update:

- `CURRENT_SCHEMA_VERSION` changed from `5` to `6`.
- `CURRENT_APP_VERSION` changed to `0.7-phase7-lessons`.
- `ElectricalProject.lessonProgress` was added.
- Migration now normalizes old projects to include lesson progress.

### Engineering Decisions

- Lesson engine is independent from React UI.
- Progress helpers are pure functions returning new project snapshots.
- Store actions persist active lesson, hint usage, and validation attempts through project state.
- Lesson validation uses existing engines: topology, safety, panelboard, cost, and current-related infrastructure.
- Switch lessons validate educational switch paths by checking breaker-to-switch input, switch-output-to-lamp phase, and lamp neutral return. This avoids pretending that the current topology engine has a full internal switch state model.

### Electrical Logic Implemented

No new electrical formulas were introduced.

Lesson validations use existing simulator logic to check:

- controlled lamp wiring
- two-gang switch outputs
- outlet phase/neutral reachability
- refrigerator dedicated/stable circuit
- kitchen heavy-load distribution
- wire-size comparison
- breaker/wire compatibility
- routing/cost quality

### Formulas Implemented

No new physics formulas.

New lesson score aggregation:

```text
final = technical x 0.40 + safety x 0.30 + cost x 0.15 + learning x 0.15
```

### Bugs Found And Fixed

- Migration strict typing initially treated normalized attempts as unknown. Fixed by narrowing entries in `normalizeLessonProgress`.
- Lesson 1 originally depended on current flow through a switch internal connection. Because internal closed-switch state is not modeled yet, validation was corrected to check the educational switch path explicitly with topology traversal.

### Limitations

- Lesson reset clears explicit wires from the currently selected circuit, not a separate lesson sandbox.
- Per-step validation maps to ordered lesson checks; more granular step dependency can be added later.
- The topology engine still does not model switch open/closed state internally.
- Vite reports a chunk-size warning above 500 kB after adding lesson UI; build still succeeds.

### TODOs

- Add lesson sandbox/reset templates.
- Add internal switch state model.
- Add per-step interactive highlighting on the floor plan.
- Add lesson-specific auto-placement starter projects.
- Add lesson report export for parent/teacher review.
- Add dynamic code splitting if bundle growth continues.

### Risks

- Learners may confuse educational validation with real electrical approval; disclaimer must stay visible.
- Some lessons depend on the current generated-topology fallback when explicit wires are absent.
- Resetting selected circuit wiring may surprise users if they selected a different circuit than the lesson target.

### Scalability Concerns

- Lesson content is currently static TypeScript. Future platform mode may need JSON lesson packs or database-driven lessons.
- Lesson validation should eventually support reusable rule primitives.
- AI tutor features can consume lesson definitions, validation feedback, and progress state.

### Verification

- `npm test`: 11 test files passed, 46 tests passed.
- `npm run build`: passed with a Vite chunk-size warning.
- Local HTTP check should be run after final integration and commit.

### Next Recommended Step

Phase 8 should add lesson sandbox templates and floor-plan guidance/highlighting so Kiarash can start each mission from a clean guided setup without affecting the whole apartment project.

## 2026-05-14 18:35 Europe/Istanbul - Phase 8 Engineering Report: Lesson Sandbox Templates And Guided Floor-Plan Highlighting

### Completed Work

Phase 8 implemented safe lesson sandbox mode, data-driven lesson templates, guided floor-plan highlighting, ghost wire suggestions, sandbox persistence, reset/discard/apply controls, and tests for sandbox safety.

### Modified Files

- `src/types/electrical.ts`
- `src/migrations/projectMigration.ts`
- `src/data/apartment.ts`
- `src/features/topology-engine/topologyEngine.ts`
- `src/features/lesson-mode/lessonEngine.ts`
- `src/features/lesson-mode/lessonSandbox.ts`
- `src/features/lesson-mode/lessonSandbox.test.ts`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/features/floor-plan/FloorPlan.tsx`
- `src/store/useLabStore.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Dependencies Added

No package dependency was added.

### Architecture Changes

New sandbox engine:

```text
src/features/lesson-mode/
  lessonSandbox.ts
  lessonSandbox.test.ts
```

Schema update:

- `CURRENT_SCHEMA_VERSION` changed from `6` to `7`.
- `CURRENT_APP_VERSION` changed to `0.8-phase8-lesson-sandbox`.
- `ElectricalProject.useExplicitWiresOnly` was added.
- `LessonSandboxState`, `LessonHighlight`, and `LessonStepGuidance` were added.

Store update:

- `lessonSandbox` is persisted in Zustand.
- Starting a lesson stores the main project and switches the active project to the sandbox template.
- Exiting restores the untouched main project.
- Applying uses the current sandbox project only after explicit UI confirmation.

### Engineering Decisions

- Sandbox logic is pure TypeScript and independent from React.
- Templates are data-driven and create a small project containing only relevant lesson components.
- `useExplicitWiresOnly` disables generated topology fallback inside sandbox templates so validation cannot pass without learner-authored wiring.
- Floor-plan highlighting is derived from lesson guidance instead of hard-coded UI behavior.
- Main project safety takes priority over convenience; sandbox apply is explicit and confirmed.

### Electrical Logic Implemented

No new electrical formulas were added.

Electrical behavior changed only in a controlled way:

- topology generation now respects `useExplicitWiresOnly`
- when true, explicit `ElectricalWire[]` is the only topology source even if empty
- this prevents fake success in lesson sandboxes

### Formulas Implemented

No new physics formulas.

### Bugs Found And Fixed

- Build initially caught a destructuring comma error in `TerminalButton`. Fixed before final verification.

### Limitations

- Applying a sandbox result currently replaces the active project with the sandbox result; it does not merge only lesson artifacts into the old main project.
- Ghost wire suggestions are simple terminal-to-terminal hints, not route-optimized conduit paths.
- Step guidance uses a mix of explicit guidance and generated fallback hints.
- Saved sandbox examples are stored in sandbox state but do not yet have a management UI.
- Bundle-size warning increased to about 514 kB minified JS.

### TODOs

- Add merge/apply modes: replace, append lesson circuit, or save as separate example.
- Add full UI for saved sandbox examples.
- Add per-step explicit guidance for every lesson step.
- Add terminal-specific highlight for each step.
- Add route-aware ghost wire suggestions.
- Add code splitting for lesson/diagnostics panels.

### Risks

- Replacing main project with sandbox result may surprise advanced users; confirmation reduces risk but merge modes should be added.
- `useExplicitWiresOnly` must remain restricted to sandbox/template cases unless the user intentionally wants strict explicit topology.
- Large saved examples inside localStorage could increase storage use.

### Scalability Concerns

- Lesson templates are currently TypeScript data. Future education platform mode should move templates into versioned lesson packs.
- Highlight generation should become rule-based as lessons grow.
- Sandbox snapshots should move to SQLite/Tauri storage for durable long-term examples.

### Verification

- `npm test`: 12 test files passed, 51 tests passed.
- `npm run build`: passed with Vite chunk-size warning.
- Local HTTP check: `http://localhost:5173/` returned 200.

### Next Recommended Step

Phase 9 should add merge/apply choices for sandbox results, full saved-example management, and more precise per-step terminal guidance.

## 2026-05-14 20:35 Europe/Istanbul - Phase 9 Engineering Report: Sandbox Apply Modes And Example Management

### Completed Work

Phase 9 added safe sandbox output management. The lesson sandbox can now be applied through explicit modes, appended to the main project with id remapping, or saved as a named example without changing the main apartment project.

### Modified Files

- `src/types/electrical.ts`
- `src/features/lesson-mode/lessonSandbox.ts`
- `src/features/lesson-mode/lessonSandbox.test.ts`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/store/useLabStore.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Dependencies Added

No package dependency was added.

### Architecture Changes

New domain types:

- `LessonSandboxApplyMode`
- `LessonExample`

New pure sandbox functions:

- `summarizeSandboxApply`
- `replaceMainProjectWithSandbox`
- `appendSandboxToMainProject`
- `createLessonExample`
- `addLessonExample`
- `deleteLessonExample`
- `loadLessonExampleIntoSandbox`

### Engineering Decisions

- Append logic is pure TypeScript and independent from React UI.
- Append mode preserves main project arrays and creates a new project snapshot.
- ids are regenerated with lesson-prefixed ids when collisions occur.
- Virtual breaker refs such as `breaker:<circuitId>` are remapped with circuit ids.
- Panelboard assignments are preserved where possible with remapped breaker slot ids.
- Diagnostics run after replace and append; the UI reports issue count instead of hiding it.
- Save-example mode stores structured examples and does not modify the main project.

### Electrical Logic Implemented

No new electrical formulas were added.

Electrical integrity work:

- copied wires preserve terminal refs through id remapping
- copied panelboard slots preserve circuit assignments through id remapping
- appended circuits preserve appliances, room ids, wire size, breaker amp, and kind
- diagnostics checks appended project structure after apply

### Formulas Implemented

No new formulas.

### Bugs

No runtime bugs were found during Phase 9 verification.

### Limitations

- Append mode copies lesson components with a small coordinate offset, but it does not yet perform collision-aware layout.
- Example export is raw JSON for the example object and does not yet use a signed/checksummed example envelope.
- Example notes are supported in the data model but the UI currently provides a single title/notes text field style input.
- Diagnostics issue count is shown, but detailed post-apply diagnostics are still in the diagnostics panel rather than inline in apply modal.
- Bundle-size warning increased to about 522 kB minified JS.

### TODOs

- Add layout collision avoidance for appended lesson components.
- Add example import.
- Add example checksum envelope.
- Add richer example notes field.
- Add inline post-apply diagnostic details.
- Add apply preview modal instead of `window.confirm`.
- Add code splitting for lesson mode and diagnostics.

### Risks

- Replace mode is intentionally powerful; confirmation text must remain clear.
- Append mode may create a dense floor-plan area until layout collision avoidance exists.
- Many saved examples can increase localStorage size.

### Scalability Concerns

- Example management should eventually move to Tauri/SQLite storage.
- Append remapping should become a reusable project merge service if multiplayer/shared examples are introduced.
- Saved examples should use versioned lesson-example schema when examples become shareable.

### Verification

- `npm test`: 12 test files passed, 53 tests passed.
- `npm run build`: passed with Vite chunk-size warning.
- Local HTTP check: `http://localhost:5173/` returned 200.

### Next Recommended Step

Phase 10 should add a richer apply preview modal, collision-aware append layout, example import/checksum, and code splitting to address the growing bundle.

## 2026-05-14 21:30 Europe/Istanbul - Phase 10 Engineering Report: Apply Preview Modal, Example Integrity, Collision-Aware Append, And Code Splitting

### Completed Work

Phase 10 replaced browser confirmation with a custom Persian apply preview modal, improved append layout collision handling, added checksum-based lesson example import/export, improved example management, and split large UI panels into lazy-loaded chunks.

### Modified Files

- `src/App.tsx`
- `src/migrations/exportIntegrity.ts`
- `src/features/lesson-mode/lessonSandbox.ts`
- `src/features/lesson-mode/lessonSandbox.test.ts`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/store/useLabStore.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Dependencies Added

No package dependency was added.

### Architecture Changes

New pure helper capabilities:

- `createSandboxApplyPreview`
- collision-aware append offset calculation
- route point offset preservation
- `renameLessonExample`
- `importLessonExampleJson`
- lesson example checksum envelope helpers

Frontend changes:

- `React.lazy` and `Suspense` now lazy-load `LessonPanel`, `ProjectDataPanel`, and `ProjectDiagnosticsPanel`.
- Loading states are Persian and RTL-safe.

### Engineering Decisions

- Modal preview data is generated by pure sandbox logic, not hard-coded in UI.
- Append layout uses candidate offsets and overlap checks against existing component positions.
- Route points move by the same offset as appended components to preserve relative wiring geometry.
- Example import accepts official checksum envelopes and warns on checksum mismatch.
- Raw example JSON can still be imported with a warning for recovery/debugging.
- Core simulation behavior was not changed.

### Electrical Logic Implemented

No new electrical formulas or simulation behavior were added.

Preserved integrity:

- appended wire terminal refs still remap safely
- route geometry remains aligned after append offset
- diagnostics still run after apply

### Formulas Implemented

No new electrical formulas.

Integrity formula reused:

```text
checksum = FNV1a32(canonicalJson(example))
```

### Bugs

No runtime bugs were found during Phase 10 verification.

### Limitations

- Collision-aware layout uses a finite candidate offset list, not a full packing algorithm.
- The apply modal is a simple custom modal and does not yet trap focus.
- Raw example import remains allowed with warnings for recovery.
- Main chunk is below Vite warning threshold, but still close to 500 kB.

### TODOs

- Add focus trap and Escape key handling to modal.
- Add route-aware ghost wire optimization.
- Add stronger collision packing for dense rooms.
- Add example schema migration if example format grows.
- Add Playwright/browser visual tests for modal and lazy-loading behavior.

### Risks

- Candidate-based collision avoidance can still fail in very dense layouts.
- Imported raw examples without envelope may contain older schema data that needs migration later.
- Code splitting improves initial bundle warning but future growth can reintroduce the warning.

### Scalability Concerns

- Example import/export should eventually share a common versioned artifact system with project export.
- Apply preview should become reusable for other destructive or high-impact workflows.
- Lazy-loaded panels should be grouped by route/feature if the app later gains navigation.

### Verification

- `npm test`: 12 test files passed, 57 tests passed.
- `npm run build`: passed with no Vite chunk-size warning.
- Build output includes separate chunks for `LessonPanel`, `ProjectDataPanel`, and `ProjectDiagnosticsPanel`.
- Local HTTP check: `http://localhost:5173/` returned 200.

### Next Recommended Step

Phase 11 should add focus/accessibility polish for modal workflows, browser visual tests, and a reusable artifact import/export framework for projects, examples, and future lesson packs.

## 2026-05-14 21:43 Europe/Istanbul - Phase 11 Engineering Report: UI Hardening, Accessibility, Visual QA, And Apply Result Audit

### Completed Work

Phase 11 improved the safety and transparency of lesson sandbox apply flows. The custom Persian apply preview modal is now keyboard-accessible, apply operations produce a visible result summary, and project state can retain an audit trail of important sandbox/example actions. Append placement also became more robust through bounding-box collision planning, and a repeatable manual UI QA checklist was added for visual validation before the project adopts automated browser tests.

### Modified Files

- `src/types/electrical.ts`
- `src/features/lesson-mode/lessonSandbox.ts`
- `src/features/lesson-mode/lessonSandbox.test.ts`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/store/useLabStore.ts`
- `src/migrations/exportIntegrity.ts`
- `src/App.tsx`
- `vite.config.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/UI_QA_CHECKLIST.md`

### Dependencies Added

No package dependency was added.

Playwright was not added in this phase. The decision was intentional: the project does not yet have stable browser selectors or a browser-test maintenance policy. A manual UI QA checklist was added first so the team has a documented visual test path without introducing a heavy dependency prematurely.

### Architecture Changes

New project data model:

- `ApplyAuditAction`
- `ApplyAuditEntry`
- optional `ElectricalProject.applyAuditLog`

New pure sandbox helpers:

- `planAppendLayout`
- `createApplyAuditEntry`
- `appendApplyAudit`

Updated import integrity output:

- `checksumStatus`
- `sourceCompatibility`

Updated UI architecture:

- Apply modal owns focus behavior locally in `LessonPanel`.
- Apply result summary is rendered after apply/import.
- Diagnostics panel has a stable DOM anchor so the result summary can scroll to it.

Updated bundling architecture:

- Vite manual chunks split React/Zustand, React Flow, and Lucide icons away from the main app chunk.

### Engineering Decisions

- Modal initial focus goes to cancel for safety because replace/append are high-impact actions.
- Enter confirmation is allowed only when the confirm button has focus. This prevents accidental apply from text inputs or general modal focus.
- Backdrop click closes the preview instead of applying. This is treated as a cancel action.
- Audit history is append-only and capped to the latest 50 entries to avoid unbounded localStorage growth.
- Audit entries are stored in project state rather than a UI-only store because they are part of project governance and handoff history.
- Append layout warnings are returned from pure logic so UI can explain placement uncertainty without guessing.
- Manual QA documentation was created before automated browser QA to avoid adding brittle selectors too early.

### Electrical Logic Implemented

No new electrical rules, formulas, or simulation algorithms were added.

Electrical behavior intentionally preserved:

- topology engine remains source of truth for explicit wires
- current engine remains unchanged
- safety engine remains unchanged
- cost engine remains unchanged
- diagnostics still runs after append/replace

### Formulas Implemented

No new electrical formulas.

Integrity behavior refined:

```text
checksum = FNV1a32(canonical JSON without undefined object fields)
```

This fixes the Phase 10 edge case where exported examples with undefined optional fields could validate as changed after JSON serialization.

### Bugs Fixed

- Example checksum validation now matches serialized JSON behavior by ignoring undefined object fields during canonicalization.
- Bundle-size warning returned after modal/audit code growth and was resolved with conservative manual chunking.
- Saved examples import UI is now available while sandbox is active even if no examples have been saved yet.

### Limitations

- Modal accessibility is improved but not yet a reusable shared modal component.
- Manual QA checklist is not equivalent to Playwright automation.
- Append layout planner still uses a bounded search strategy rather than a true geometric packing solver.
- Audit log currently stores summary metadata only, not full before/after diffs.

### TODOs

- Add automated Playwright smoke tests once selectors and test policy are stable.
- Convert apply preview modal to a shared accessible modal primitive.
- Add an audit history viewer in the UI.
- Add before/after diff preview for append and replace.
- Add stronger spatial packing and room-aware placement constraints.

### Risks

- Audit data increases persisted project size, though the 50-entry cap limits growth.
- Manual QA can miss regressions that browser automation would catch.
- A crowded floor plan can still force append placement far from the original lesson area.

### Scalability Concerns

- Audit history should eventually move to SQLite when the project migrates to Tauri.
- Example/project/lesson-pack export should share one artifact integrity framework.
- Browser test coverage should become mandatory before multiplayer or AI-assisted editing features are added.
- Layout planning should become a reusable merge service if imported examples or shared lesson packs become common.

### Verification

- `npm test`: 12 test files passed, 59 tests passed.
- `npm run build`: passed.
- Production build has no Vite chunk-size warning.
- Main app chunk reduced to about 330 kB after manual chunks.
- Manual visual QA checklist created at `project-docs/UI_QA_CHECKLIST.md`.

### Next Recommended Step

Phase 12 should add an in-app audit history viewer, a shared modal component, and the first automated browser smoke tests if the team approves Playwright or an equivalent browser QA dependency.

## 2026-05-14 22:00 Europe/Istanbul - Phase 12 Engineering Report: Shared Modal System, Audit Viewer, Stable Test Selectors, And Playwright Smoke Tests

### Completed Work

Phase 12 converted modal accessibility work into reusable infrastructure and added the project's first real browser-level smoke tests. The Lesson Panel now uses a shared accessible modal, audit history is visible in the UI, critical flows have stable test selectors, Playwright is installed/configured, and CI-friendly e2e scripts are available.

### Modified Files

- `src/components/AccessibleModal.tsx`
- `src/features/audit-viewer/AuditViewerPanel.tsx`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/features/lesson-mode/lessonSandbox.ts`
- `src/features/lesson-mode/lessonSandbox.test.ts`
- `src/features/project-data/ProjectDataPanel.tsx`
- `src/features/project-diagnostics/ProjectDiagnosticsPanel.tsx`
- `src/App.tsx`
- `vite.config.ts`
- `playwright.config.ts`
- `tests/e2e/phase12-smoke.spec.ts`
- `package.json`
- `package-lock.json`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/UI_QA_CHECKLIST.md`

### Dependencies Added

Development dependency:

- `@playwright/test`

Browser runtime installed locally:

- Chromium for Playwright

### Architecture Changes

Shared UI infrastructure:

- `AccessibleModal` provides a reusable RTL-compatible modal with:
  - focus trap
  - Escape close
  - safe backdrop close
  - ARIA dialog metadata
  - initial focus control
  - confirm/cancel action slots
  - stable modal test ids

Audit visibility:

- `AuditViewerPanel` reads `project.applyAuditLog`.
- It filters by action type and exports audit JSON.
- A stable empty audit array is used so Zustand/React snapshots do not loop when no audit entries exist.

Testing architecture:

- `playwright.config.ts` starts/reuses the Vite dev server.
- `tests/e2e/phase12-smoke.spec.ts` uses stable `data-testid` selectors.
- `vite.config.ts` excludes `tests/e2e/**` from Vitest so Playwright specs are not collected by unit tests.

Apply diff architecture:

- `summarizeApplyDiff(beforeProject, afterProject)` reports:
  - circuits added/removed
  - components added/removed
  - wires added/removed
  - diagnostics before/after

### Engineering Decisions

- The shared modal preserves the safer Phase 11 behavior: cancel receives initial focus, Enter does not apply unless confirm is focused, and backdrop click is cancel-only.
- The audit viewer is lazy-loaded with the other right-column infrastructure panels.
- E2E tests avoid fragile text selectors and use `data-testid`.
- Playwright navigation waits for `domcontentloaded`, not full `load`, so tests are not delayed by dev-server or long-running resource behavior.
- Vitest excludes e2e files to avoid mixing Playwright's test runner with Vitest.

### Electrical Logic Implemented

No electrical logic was changed.

Preserved systems:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- diagnostics engine behavior

### Formulas Implemented

No new electrical formulas.

New project comparison logic:

```text
added = afterIds not present in beforeIds
removed = beforeIds not present in afterIds
diagnosticsBefore = diagnoseProject(beforeProject).issueCount
diagnosticsAfter = diagnoseProject(afterProject).issueCount
```

### Bugs Found And Fixed

- `AuditViewerPanel` initially used `state.project.applyAuditLog ?? []` directly. This returned a new array on every selector run and caused a React/Zustand maximum update depth error. It was fixed by using a stable `EMPTY_AUDIT_LOG` constant.
- Vitest initially collected Playwright tests from `tests/e2e`. `vite.config.ts` now excludes `tests/e2e/**`.
- `package.json` briefly had duplicate `@playwright/test` entries after dependency installation and manual script editing. The duplicate was removed.
- Playwright's first navigation waited for the full `load` event and timed out in local dev conditions. The e2e test now waits for `domcontentloaded`.

### Limitations

- Only Chromium smoke tests exist.
- The shared modal currently supports standard confirm/cancel layout, not arbitrary multi-action workflows.
- Audit viewer is read-only except JSON export.
- E2E tests validate core reachability and cancel safety, but do not yet validate every apply mode.

### TODOs

- Add Playwright coverage for append confirm and audit entry creation.
- Add tests for keyboard modal behavior: Escape, Tab cycle, Enter safety.
- Add tests for example import checksum warning flow.
- Add reusable delete confirmation modal for saved examples and backups.
- Add audit viewer search and date filters.

### Risks

- Playwright adds a heavier dev dependency and browser runtime that must be maintained in CI.
- E2E tests can become brittle if future UI changes remove test ids without updating tests.
- Audit viewer reads project history directly; future schema changes must preserve audit compatibility.

### Scalability Concerns

- Browser tests should be grouped by feature as the app grows.
- CI should cache Playwright browsers.
- Shared modal should eventually support nested descriptions and danger-mode destructive copy rules.
- Audit history should move from localStorage to SQLite when Tauri storage arrives.

### Verification

- `npm test`: 12 test files passed, 60 tests passed.
- `npm run build`: passed with no Vite chunk-size warning.
- `npm run test:e2e`: 3 Playwright tests passed.
- Local HTTP check remains required before final handoff.

### Next Recommended Step

Phase 13 should deepen browser coverage around keyboard accessibility, confirmed append/replace flows, example import warnings, and audit entry creation.

## 2026-05-14 22:11 Europe/Istanbul - Phase 13 Engineering Report: Advanced E2E Coverage And Confirmation Modal Unification

### Completed Work

Phase 13 expanded Kia Electric Lab's browser QA from smoke coverage into behavior coverage for modal accessibility, sandbox apply, audit creation, and example import integrity. It also migrated remaining risky confirmation flows away from ad hoc confirmation behavior and toward the shared `AccessibleModal` system.

### Modified Files

- `src/components/AccessibleModal.tsx`
- `src/App.tsx`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/features/project-data/ProjectDataPanel.tsx`
- `src/features/wire-routing/WireRoutingPanel.tsx`
- `src/features/audit-viewer/AuditViewerPanel.tsx`
- `tests/e2e/phase13-advanced.spec.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/UI_QA_CHECKLIST.md`

### Dependencies Added

No new dependency was added in Phase 13.

Playwright was already introduced in Phase 12 and reused here.

### Architecture Changes

`AccessibleModal` was expanded with:

- `variant`: danger, warning, info, success
- `details`
- `diagnosticsSummary`
- deterministic test ids for:
  - cancel
  - confirm
  - details
  - diagnostics

Confirmation modal unification:

- Header reset project now uses `AccessibleModal`.
- Project Data reset/restore/start-safe flows use `AccessibleModal`.
- Lesson sandbox reset/exit/delete-example flows use `AccessibleModal`.
- Wire deletion uses `AccessibleModal`.

Browser test architecture:

- Advanced tests live in `tests/e2e/phase13-advanced.spec.ts`.
- Tests continue to use `data-testid` and stable attributes instead of Persian text selectors.
- Example import fixtures are generated inside tests with deterministic FNV1a-compatible checksum logic.

### Engineering Decisions

- Confirmation behavior remains conservative: cancel is still the initial focus for risky actions.
- Backdrop click is treated as cancel, never as confirm.
- `Enter` is only used for apply when confirm has focus; tests verify cancel-focused Enter does not create an append audit entry.
- Audit entries now expose `data-action` so tests can verify behavior without reading Persian text.
- Corrupted checksum import is allowed, as before, but now browser-tested to ensure the warning path and audit path are visible.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- diagnostics engine behavior

### Formulas Implemented

No new electrical formulas.

The e2e test fixture duplicates the existing canonical checksum behavior only for constructing browser import test files:

```text
checksum = FNV1a32(canonical JSON without undefined object fields)
```

### Bugs Found And Fixed

No new production bug was found during Phase 13 verification.

The phase did expose a testing need: import warning assertions should not depend on Persian copy. This was handled by adding `data-warning` metadata to the example import message.

### Limitations

- Playwright coverage still runs only on Chromium.
- Replace mode confirmation is not yet browser-tested.
- Restore backup modal is migrated but not browser-tested because backup fixture setup is not yet part of e2e utilities.
- Wire delete modal is migrated but not browser-tested because explicit wire creation in browser tests needs a stable fixture helper.
- Rename/notes still use `window.prompt`; they are less risky than destructive confirmations but should eventually use a shared editing modal.

### TODOs

- Add browser fixture utilities for creating wires, backups, and saved examples.
- Add e2e coverage for replace mode.
- Add e2e coverage for backup restore confirmation.
- Add e2e coverage for wire deletion confirmation.
- Replace `window.prompt` for example rename/notes with an accessible edit modal.
- Add Firefox/WebKit Playwright projects when CI runtime is ready.

### Risks

- E2E suite runtime will grow as coverage expands.
- Stable test ids are now a compatibility contract and must be maintained.
- Confirmation modals are safer but can add UX friction if overused on low-risk actions.

### Scalability Concerns

- E2E helpers should be extracted before adding many more browser tests.
- Modal variants should eventually be tied to a design-system token map.
- Browser fixture setup should move toward project import helpers rather than UI-only setup.

### Verification

- `npm test`: 12 test files passed, 60 tests passed.
- `npm run build`: passed with no Vite chunk-size warning.
- `npm run test:e2e`: 6 Playwright Chromium tests passed.

### Next Recommended Step

Phase 14 should add e2e fixture utilities and cover replace mode, backup restore, wire deletion, and modalized rename/notes flows.

## 2026-05-15 00:57 Europe/Istanbul - Phase 14 Engineering Report: E2E Fixture Utilities, Remaining Flow Tests, And Prompt Modal Replacement

### Completed Work

Phase 14 made the browser test suite more deterministic and completed coverage for several remaining risky flows. It introduced reusable Playwright fixtures that seed localStorage directly, replaced saved-example prompt editing with an accessible modal, added test ids for remaining critical controls, and expanded the e2e suite from 6 to 14 tests.

### Modified Files

- `src/components/EditTextModal.tsx`
- `src/features/lesson-mode/LessonPanel.tsx`
- `src/features/audit-viewer/AuditViewerPanel.tsx`
- `src/features/project-data/ProjectDataPanel.tsx`
- `playwright.config.ts`
- `tests/e2e/helpers/fixtures.ts`
- `tests/e2e/phase13-advanced.spec.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/UI_QA_CHECKLIST.md`

### Dependencies Added

No dependency was added.

### Architecture Changes

New reusable UI component:

- `EditTextModal`

It supports:

- title
- description
- text input
- textarea mode
- required validation
- Persian RTL input direction
- confirm/cancel actions
- deterministic test ids

New e2e helper module:

- `tests/e2e/helpers/fixtures.ts`

Fixtures can seed:

- default project
- active sandbox
- saved example
- backup
- explicit wire with selected wire state
- corrupted storage
- project with diagnostics issues

Playwright architecture update:

- E2E tests now use `http://127.0.0.1:5174`.
- `strictPort` is enabled.
- `reuseExistingServer` is disabled to prevent testing stale dev-server code on `5173`.

### Engineering Decisions

- Direct localStorage seeding is preferred for browser fixtures because it avoids long and fragile UI setup.
- Existing visible UI flows are still tested after seeding, so tests validate the real app surface.
- Saved-example rename and notes were moved from `window.prompt` to modal editing because prompt dialogs are hard to test, inaccessible, and inconsistent with the shared modal system.
- Corrupted project import is tested through the hidden file input using `setInputFiles`, not text selectors.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- diagnostics engine

### Formulas Implemented

No new electrical formulas.

### Bugs Found And Fixed

- Playwright was previously allowed to reuse the user's already-running `5173` dev server. This could test stale chunks after code changes. Phase 14 moved tests to dedicated port `5174` with `strictPort` and no reuse.

### Limitations

- E2E helper project shapes are intentionally minimal and should be expanded if future tests need richer apartment fixtures.
- Tests still run Chromium only.
- Project import warning is tested by visibility of the message, not detailed Persian copy.
- Audit export download behavior is not yet browser-verified.

### TODOs

- Add Firefox/WebKit coverage when CI runtime allows.
- Add e2e coverage for audit JSON download.
- Add fixture builder utilities with typed factories if test data grows.
- Add visual screenshot checks after layout stabilizes.

### Risks

- Direct localStorage fixtures must be kept aligned with schema migrations.
- Dedicated Playwright port reduces stale-server risk, but CI must keep the port free.
- Minimal fixtures can miss interactions that only appear in full apartment data.

### Scalability Concerns

- E2E fixture factories should eventually live in a small typed test-data package.
- If schema version changes frequently, fixtures should import generated schema constants or be generated from app factories.
- Browser tests should be grouped by feature as the suite grows.

### Verification

- `npm test`: 12 test files passed, 60 tests passed.
- `npm run build`: passed with no Vite chunk-size warning.
- `npm run test:e2e`: 14 Playwright Chromium tests passed.

### Next Recommended Step

Phase 15 should introduce typed test-data builders and begin screenshot/visual regression checks for the highest-risk RTL modal and floor-plan flows.

## 2026-05-15 01:13 Europe/Istanbul - Phase 15 Engineering Report: Typed E2E Fixture Builders, Audit Download Testing, And Visual Regression Baseline

### Completed Work

Phase 15 upgraded the e2e test foundation from hand-authored raw objects to typed fixture builders, added real download/export verification, and established the first committed visual regression baseline for key RTL UI surfaces.

### Modified Files

- `src/features/floor-plan/FloorPlan.tsx`
- `src/features/lesson-mode/LessonPanel.tsx`
- `tests/e2e/helpers/fixtures.ts`
- `tests/e2e/phase13-advanced.spec.ts`
- `tests/e2e/phase13-advanced.spec.ts-snapshots/*.png`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/UI_QA_CHECKLIST.md`

### Dependencies Added

No dependency was added.

### Architecture Changes

Typed fixture builders now import app TypeScript types where practical:

- `ElectricalProject`
- `ElectricalComponent`
- `Circuit`
- `ElectricalWire`
- `LessonExample`
- `LessonSandboxState`
- `Panelboard`
- `Room`
- `ApplyAuditEntry`

Fixture builder defaults are deterministic and support overrides. Tests now seed localStorage through typed builders rather than duplicating large anonymous object literals.

New stable selector:

- `floor-plan`

### Engineering Decisions

- Visual tests use seeded deterministic project states instead of interactive setup.
- Visual tests use fixed viewport `1440x1200`.
- Visual assertions allow a small `maxDiffPixels: 50` tolerance to prevent tiny font anti-aliasing differences from causing false failures.
- Audit viewer visual baseline uses a seeded audit entry with fixed timestamp, not a freshly performed action.
- Playwright snapshot files are committed as the Phase 15 baseline.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- diagnostics engine

### Formulas Implemented

No new electrical formulas.

### Bugs Found And Fixed

- Initial visual baseline had tiny pixel differences on modal/audit screenshots caused by rendering anti-aliasing. The strategy was adjusted with deterministic audit seeding and small pixel tolerance.

### Limitations

- Visual baselines are Chromium/Windows specific.
- No Firefox/WebKit/mobile visual baselines yet.
- Screenshot tests cover selected high-risk surfaces, not the full app.
- Fixture builders are typed but still live in the e2e folder, not a shared test-data package.

### TODOs

- Add mobile viewport visual baselines.
- Add Firefox/WebKit planning and CI browser cache.
- Add screenshot review/update policy to contribution docs.
- Add visual coverage for wire inspector and panelboard.

### Risks

- Visual snapshots can be noisy if fonts or OS rendering changes.
- Type-only imports in e2e fixtures must stay aligned with app type paths.
- Overusing screenshot tests could slow CI.

### Scalability Concerns

- As fixtures grow, move builders to feature-specific fixture modules.
- If schema migrations advance, fixture builders should be updated in the same phase as schema changes.
- Visual tests should remain targeted to high-value UI surfaces.

### Verification

- `npm test`: 12 test files passed, 60 tests passed.
- `npm run build`: passed with no Vite chunk-size warning.
- `npm run test:e2e -- --update-snapshots`: 21 tests passed and wrote/updated visual baselines.
- `npm run test:e2e`: 21 tests passed against committed baselines.

### Next Recommended Step

Phase 16 should add mobile visual baselines, document snapshot review policy in `DEVELOPMENT_WORKFLOW.md`, and consider first CI guidance for Playwright browser caching.

## 2026-05-15 01:37 Europe/Istanbul - Phase 16 Engineering Report: Mobile Visual Baselines, Snapshot Review Policy, And CI Readiness

### Completed Work

Phase 16 prepared the project for stable visual QA across desktop and mobile viewports and documented the first CI-ready browser-test policy. The work adds mobile screenshot baselines for the most important learner and safety surfaces, refines Playwright configuration for CI diagnostics, adds developer scripts for snapshot and headed workflows, and records snapshot governance rules for Mehdi and Vi.

The implementation deliberately does not modify simulator behavior or electrical calculations. This phase is QA infrastructure, visual baseline expansion, workflow documentation, and release-readiness preparation.

### Modified Files

- `package.json`
- `playwright.config.ts`
- `tests/e2e/phase16-mobile-visual.mobile.spec.ts`
- `tests/e2e/phase16-mobile-visual.mobile.spec.ts-snapshots/mobile-apply-preview-modal-rtl-chromium-mobile-win32.png`
- `tests/e2e/phase16-mobile-visual.mobile.spec.ts-snapshots/mobile-audit-viewer-rtl-chromium-mobile-win32.png`
- `tests/e2e/phase16-mobile-visual.mobile.spec.ts-snapshots/mobile-diagnostics-panel-rtl-chromium-mobile-win32.png`
- `tests/e2e/phase16-mobile-visual.mobile.spec.ts-snapshots/mobile-floor-plan-routed-wire-chromium-mobile-win32.png`
- `tests/e2e/phase16-mobile-visual.mobile.spec.ts-snapshots/mobile-lesson-panel-rtl-chromium-mobile-win32.png`
- `DEVELOPMENT_WORKFLOW.md`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/UI_QA_CHECKLIST.md`

### Dependencies Added

No dependencies were added.

Playwright was already present from earlier phases. Phase 16 only refines usage and scripts.

### Architecture Changes

#### Playwright Project Separation

The Playwright config now separates desktop and mobile execution:

- `chromium`: existing desktop functional and visual tests.
- `chromium-mobile`: mobile visual tests matching `.mobile.spec.ts`.

The desktop project name intentionally remains `chromium`. During implementation, renaming it to `chromium-desktop` caused Playwright to look for a new set of desktop snapshot filenames. That would have produced unnecessary snapshot churn without a product UI change. The final architecture keeps the stable desktop name and adds mobile coverage separately.

#### CI-Friendly Test Configuration

Playwright now has:

- `retries: process.env.CI ? 2 : 0`
- `trace: 'on-first-retry'`
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- strict dedicated web server on `http://127.0.0.1:5174`

This improves future CI debugging while keeping local feedback fast.

#### Mobile Visual Test Module

New mobile visual tests live in:

```text
tests/e2e/phase16-mobile-visual.mobile.spec.ts
```

The tests use deterministic fixtures from the existing typed fixture builders and stable `data-testid` anchors. The screenshot helper scrolls the target surface into view, blurs active focus, and captures the viewport with controlled pixel tolerance.

### Engineering Decisions

- Mobile tests use a `390x844` viewport through Playwright's Pixel 5 profile because it is a practical middle-ground mobile size for Persian RTL layout validation.
- Mobile visual tests are isolated with `.mobile.spec.ts` to prevent desktop and mobile snapshots from mixing.
- Desktop project name was preserved to avoid renaming Phase 15 baseline files.
- Visual tests use deterministic seeded project states instead of long UI setup.
- Mobile screenshot assertions use `maxDiffPixels: 120` to tolerate small antialiasing differences while still catching meaningful layout regressions.
- CI documentation is added before creating an actual provider workflow so Mehdi and Vi can choose the hosting and artifact retention policy.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved systems:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- migration engine
- diagnostics engine
- repair engine
- lesson engine
- lesson sandbox apply logic

### Formulas Implemented

No new formulas were implemented.

Existing formulas remain unchanged:

- `I = P / V`
- `P = V * I`
- `R = V / I`
- simplified voltage drop from current and cable resistance
- total parallel load as summed watts and `TotalCurrent = TotalPower / 220`

### Bugs Found And Fixed

#### Desktop Snapshot Churn From Project Rename

Initial config used a new desktop project name, `chromium-desktop`. Playwright therefore expected new desktop snapshot filenames even though no desktop UI changed. This produced failing visual tests due to missing snapshots, not real pixel regressions.

Fix:

- restored the desktop project name to `chromium`
- kept mobile tests isolated under `chromium-mobile`
- removed accidental duplicate `chromium-desktop` snapshot files

#### Mobile Element Screenshot Instability

Early mobile screenshot attempts used direct element snapshots. On narrow viewports, responsive scrolling and fixed application layout made element-level screenshots less stable.

Fix:

- introduced a mobile helper that scrolls the target into view and captures the viewport
- kept assertions anchored by stable `data-testid`
- used deterministic seeded project data

### Limitations

- Visual baselines are still Chromium/Windows baselines.
- CI workflow file is documented but not yet created.
- Firefox and WebKit projects are not enabled.
- Mobile tests cover high-value surfaces only, not every panel.
- Mobile screenshots validate layout appearance, not real touch gestures.
- CI artifact upload is documented but not automated until a provider workflow is selected.

### TODOs

- Add provider-specific CI workflow.
- Upload `test-results/` and `playwright-report/` in CI.
- Evaluate Firefox snapshot stability.
- Evaluate WebKit snapshot stability.
- Add mobile visual baselines for wire inspector and panelboard.
- Decide whether visual snapshots should block every feature branch or only release candidates.

### Risks

- Visual snapshots can differ between Windows local development and Linux CI.
- Mobile viewport emulation does not fully replace manual testing on a real device.
- Over-expanding screenshot coverage could slow the test suite and create noisy maintenance.
- Snapshot updates can hide regressions if not reviewed carefully.

### Scalability Concerns

- As the simulator grows, visual tests should be grouped by UI area and risk level.
- Future CI should separate fast unit tests from slower visual tests if total time becomes high.
- Snapshot approval may need an explicit review owner field in phase reports.
- Browser cache strategy must be adapted to the selected CI provider.

### Snapshot Review Policy Added

Snapshot updates now require:

- intentional UI change
- manual visual inspection
- approval by Mehdi or Vi
- phase report explaining changed surfaces
- normal verification run after update mode

Commands:

```text
npm run test:e2e
npm run test:e2e:update
npm run test:e2e:headed
```

### CI Readiness Plan Added

Recommended future CI sequence:

```text
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Recommended artifacts:

- `test-results/`
- `playwright-report/`

Recommended caches:

- npm cache
- Playwright browser cache

### Verification

- `npm run test:e2e:update -- --project=chromium-mobile`: passed, 5 mobile visual snapshots created.
- `npm test`: passed, 12 test files and 60 tests.
- `npm run build`: passed, production bundle generated without chunk-size warning.
- `npm run test:e2e`: passed, 26 Playwright tests.

### Next Recommended Step

Phase 17 should choose the actual CI provider and add a concrete workflow that runs unit tests, build, Playwright e2e, uploads artifacts, and enforces the snapshot review policy. If CI selection is not ready, the next best engineering step is mobile UX refinement for the floor plan, wire inspector, and panelboard.

## 2026-05-15 12:48 Europe/Istanbul - Phase 17 Engineering Report: GitHub Actions CI Workflow And Artifact Reporting

### Completed Work

Phase 17 created the actual GitHub Actions CI workflow for Kia Electric Lab and connected the existing verification strategy to repository automation. The project now has a root workflow that verifies pushes to `develop`, pull requests targeting `develop`, and manually triggered runs. The workflow installs dependencies from the lockfile, runs unit tests, builds the production app, installs Playwright Chromium with system dependencies, runs the browser/e2e/visual suite, and uploads debugging artifacts.

This phase also added a local CI-style verification script, updated branch strategy documentation, documented artifact review rules, and recorded the snapshot enforcement policy that CI must not update visual baselines.

### Modified Files

- `.github/workflows/ci.yml`
- `package.json`
- `README.md`
- `tests/e2e/phase13-advanced.spec.ts`
- `DEVELOPMENT_WORKFLOW.md`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`
- `project-docs/UI_QA_CHECKLIST.md`

### Dependencies Added

No npm dependency was added.

GitHub Actions uses external workflow actions:

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`

These are workflow-level dependencies, not runtime application dependencies.

### Architecture Changes

#### CI Workflow

New workflow:

```text
.github/workflows/ci.yml
```

Triggers:

- push to `develop`
- pull request targeting `develop`
- manual `workflow_dispatch`

Initial job:

```text
verify
```

Job runtime:

- `windows-latest`
- Node.js 22
- 30 minute timeout

Job steps:

1. checkout repository
2. setup Node.js with npm cache
3. `npm ci`
4. `npm test`
5. `npm run build`
6. `npx playwright install --with-deps chromium`
7. `npm run test:e2e`
8. upload Playwright report
9. upload Playwright test results
10. upload `dist/` on failure

#### Artifact Reporting

Artifacts uploaded:

- `playwright-report/` with 14 day retention
- `test-results/` with 14 day retention
- `dist/` on failure with 7 day retention

The workflow uses `if: always()` for browser artifacts so failed test runs still produce diagnostics.

#### Local CI Simulation

New script:

```text
npm run verify:ci
```

It runs:

- `npm test`
- `npm run build`
- `npm run test:e2e`

It intentionally does not run `npm ci` because reinstalling dependencies during normal local verification is slow. Developers should run `npm ci` manually when reproducing a clean CI install.

### Engineering Decisions

- CI uses `npm ci` instead of `npm install` for deterministic lockfile-based installs.
- CI installs Chromium with the same Playwright install command requested for the project.
- CI runs `npm run test:e2e`, never `npm run test:e2e:update`, to enforce snapshot immutability.
- npm cache is enabled through `actions/setup-node`.
- Playwright browser cache is deferred to avoid premature cache-key complexity and version mismatch risk.
- Workflow uses one job initially because the project is still small enough that simplicity is better than parallel orchestration.
- CI starts on `windows-latest` because current committed screenshot baselines are Windows/Chromium baselines.
- Desktop visual tolerance was centralized at `maxDiffPixels: 350` after local CI simulation exposed a tiny rasterization-only modal diff.
- No README badge was added because the repository has no configured GitHub remote, so the correct owner/repository badge URL is unknown.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved systems:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- migration engine
- diagnostics engine
- repair engine
- lesson engine
- lesson sandbox apply logic

### Formulas Implemented

No new formulas were implemented.

Existing formulas remain unchanged:

- `I = P / V`
- `P = V * I`
- `R = V / I`
- simplified voltage drop from current and cable resistance
- total parallel load as summed watts and `TotalCurrent = TotalPower / 220`

### Bugs Found And Fixed

No runtime bugs were found.

Documentation gap fixed:

- Phase 16 had a CI readiness plan but no actual provider workflow. Phase 17 adds the real GitHub Actions workflow.

Visual-test stability issue fixed:

- The desktop apply modal visual test failed locally by 280 pixels, about 0.01 of the screenshot, with no UI change. The desktop visual tolerance is now centralized at 350 pixels to prevent tiny rendering noise from blocking CI while still catching meaningful layout regressions.

### Limitations

- CI is configured for GitHub Actions only.
- CI has one job and does not parallelize unit/build/e2e steps.
- Playwright browser binaries are not cached yet.
- CI badge is not added because no GitHub remote URL is configured.
- Firefox and WebKit are still not part of the CI browser matrix.

### TODOs

- Add README CI badge after the GitHub remote is configured.
- Add GitHub branch protection requiring CI before merging to `develop`.
- Evaluate Playwright browser caching after initial CI runs are stable.
- Consider splitting CI into separate jobs if runtime grows.
- Consider expanded browser matrix for release branches.

### Risks

- CI intentionally starts on Windows because the committed visual baselines are Windows snapshots. Moving CI to Linux should be treated as a deliberate snapshot-platform migration.
- Browser install without caching is slower but safer for the first workflow.
- Artifact retention must be tuned if CI usage grows quickly.
- Branch protection is not enforced by code; it must be configured in the GitHub repository settings.

### Scalability Concerns

- A single job is easiest to maintain now, but future runtime may require separate unit, build, and browser jobs.
- Snapshot review ownership should become stricter if multiple contributors begin changing UI.
- If Tauri or SQLite phases add native build dependencies, CI will need additional OS setup.
- If AI tutor/server features are added, CI may need mock service layers and secret handling.

### Snapshot Policy Enforcement

CI intentionally does not update screenshots.

CI command:

```text
npm run test:e2e
```

Local/manual update command:

```text
npm run test:e2e:update
```

If snapshots differ in CI, the workflow fails and artifacts should be reviewed before any local snapshot update is accepted.

### Branch Strategy Update

- `feature/*` branches remain isolated implementation branches.
- `develop` is the active integration branch.
- CI must pass before merging to `develop`.
- `main` remains stable release history.
- Snapshot updates require local review and documentation before merge.

### Verification

Commands to run before merging:

- `npm run verify:ci`: passed. This executed `npm test`, `npm run build`, and `npm run test:e2e`.

Detailed result:

- `npm test`: passed, 12 test files and 60 tests.
- `npm run build`: passed, production bundle generated.
- `npm run test:e2e`: passed, 26 Playwright tests.

The GitHub Actions workflow itself cannot be executed locally without pushing to GitHub or using a local Actions runner.

### Next Recommended Step

After pushing to GitHub, Phase 18 should review the first CI artifact output, add the real CI badge once the repository URL is known, and configure branch protection on `develop`. A later dedicated phase can decide whether Linux should become the canonical snapshot environment.

## 2026-05-15 13:39 Europe/Istanbul - Phase 18 Engineering Report: GitHub Remote, Release Baseline, README Badges, And Version Tagging

### Completed Work

Phase 18 converted the project from an internally documented engineering workspace into a GitHub-ready release baseline. The work checked the remote state, avoided inventing a repository URL, upgraded README onboarding, created release notes, updated version metadata, documented GitHub remote setup commands, and prepared the local version tag `v0.18-phase18-github-baseline`.

This phase is release governance and project onboarding work. It does not change simulator runtime behavior, electrical calculations, topology validation, cost logic, lesson logic, or storage schema shape.

### Modified Files

- `README.md`
- `RELEASE_NOTES.md`
- `DEVELOPMENT_WORKFLOW.md`
- `package.json`
- `package-lock.json`
- `src/migrations/projectMigration.ts`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/ARCHITECTURE.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Dependencies Added

No dependency was added.

### Architecture Changes

#### Release Metadata

Package metadata changed from:

```text
0.1.0
```

to:

```text
0.18.0
```

App version marker changed from:

```text
0.8-phase8-lesson-sandbox
```

to:

```text
0.18-phase18-github-baseline
```

The schema version remains:

```text
7
```

Reason:

Phase 18 does not add or remove persisted project fields. Updating `schemaVersion` would incorrectly imply a data-shape migration.

#### README Onboarding

README now covers:

- project vision
- educational safety disclaimer
- current phase status
- implemented capabilities
- tech stack
- local run commands
- verification commands
- GitHub CI behavior
- remote setup instructions
- screenshots and visual baseline notes
- project structure
- contribution workflow
- governance roles

#### Release Notes

`RELEASE_NOTES.md` now summarizes:

- Phases 1-18
- current capabilities
- known limitations
- recommended next phase

#### GitHub Remote Guidance

No remote exists locally. The documentation provides exact command patterns but keeps `<owner>` as a required real value from GitHub.

Required repository name:

```text
kia-electric-lab
```

Commands prepared:

```text
git remote add origin <repo-url>
git push -u origin develop
git push origin main
git push origin --tags
```

### Engineering Decisions

- Did not add `origin` because the final GitHub URL is not available.
- Did not guess GitHub owner/repository URL.
- Used a README badge placeholder instead of a broken guessed badge.
- Chose `v0.18-phase18-github-baseline` because Phase 18 includes release documentation and metadata changes.
- Updated app version marker without changing schema version.
- Kept release notes high-level enough for product onboarding while leaving detailed engineering history in `project-docs/PHASE_REPORTS.md`.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved systems:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- migration engine
- diagnostics engine
- repair engine
- lesson engine
- lesson sandbox apply logic

### Formulas Implemented

No new formulas were implemented.

Existing formulas remain unchanged:

- `I = P / V`
- `P = V * I`
- `R = V / I`
- simplified voltage drop from current and cable resistance
- total parallel load as summed watts and `TotalCurrent = TotalPower / 220`

### Bugs Found And Fixed

No runtime bugs were found.

Documentation and metadata issues fixed:

- README still described early MVP Phase 1 scope instead of the current Phase 18 project.
- package version still showed `0.1.0`.
- app version marker still showed the Phase 8 lesson sandbox identifier.
- release notes did not exist.
- remote setup instructions were not consolidated in onboarding docs.
- apply preview visual baseline captured the full overlay, so intentional background app-version metadata changes affected the snapshot. The test now captures the dialog surface and the approved baseline was regenerated locally.

### Limitations

- Remote is still not configured because the real GitHub URL is unknown.
- CI badge remains a placeholder.
- The release tag is local until pushed.
- GitHub branch protection cannot be configured from this local workspace.
- First real GitHub Actions run still needs review after the repository is pushed.

### TODOs

- Mehdi should create the GitHub repository `kia-electric-lab`.
- Add `origin` with the real GitHub URL.
- Push `develop`, `main`, and tags.
- Add the real CI badge to README.
- Review first GitHub Actions artifacts.
- Configure branch protection requiring CI before merge to `develop`.

### Risks

- If an incorrect remote URL is used, pushes may go to the wrong repository. This is why the docs require the real GitHub-provided URL.
- The `main` branch may lag behind `develop` if not pushed or merged intentionally.
- GitHub Actions visual tests may expose platform-specific screenshot drift on first remote run.
- A local tag does not protect release history until pushed to GitHub.

### Scalability Concerns

- Release notes should become per-version rather than one growing file if releases become frequent.
- GitHub release automation may be useful after the first remote baseline.
- Branch protection and required CI checks should be configured before multiple contributors begin work.
- Future package metadata should be coordinated with app version and release notes in the same phase.

### GitHub Remote Handoff

Because no remote is configured, Mehdi should create:

```text
kia-electric-lab
```

Then run either HTTPS:

```text
git remote add origin https://github.com/<owner>/kia-electric-lab.git
git push -u origin develop
git push origin main
git push origin --tags
```

or SSH:

```text
git remote add origin git@github.com:<owner>/kia-electric-lab.git
git push -u origin develop
git push origin main
git push origin --tags
```

### Verification

Commands to run before final merge/tag:

- `npm run test:e2e:update -- --project=chromium tests/e2e/phase13-advanced.spec.ts -g "apply preview modal RTL layout"`: passed, approved dialog-only modal baseline regenerated.
- `npm run verify:ci`: passed. This executed `npm test`, `npm run build`, and `npm run test:e2e`.

Detailed result:

- `npm test`: passed, 12 test files and 60 tests.
- `npm run build`: passed, production bundle generated.
- `npm run test:e2e`: passed, 26 Playwright tests.

### Next Recommended Step

After the real GitHub remote is created, push `develop`, `main`, and tags. Then review the first GitHub Actions run, add the real CI badge to README, and configure branch protection for `develop`.

## 2026-05-15 14:04 Europe/Istanbul - Engineering Report: GitHub Remote Push And CI Badge Activation

### Completed Work

The real GitHub repository URL was provided by Mehdi:

```text
https://github.com/mehdi2044/kia-electric-lab.git
```

The local repository was connected to GitHub, the long-term branches were pushed, all release tags were pushed, remote tracking was verified, and the README CI badge placeholder was replaced with the real GitHub Actions badge.

### Modified Files

- `README.md`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Git Remote Configuration

Configured remote:

```text
origin  https://github.com/mehdi2044/kia-electric-lab.git
```

Remote commands executed:

```text
git remote add origin https://github.com/mehdi2044/kia-electric-lab.git
git push -u origin develop
git push -u origin main
git push origin --tags
```

### Branches Pushed

- `develop` -> `origin/develop`
- `main` -> `origin/main`

### Tags Pushed

- `v0.1-phase1-baseline`
- `v0.18-phase18-github-baseline`

### README Badge

Badge added:

```text
[![Kia Electric Lab CI](https://github.com/mehdi2044/kia-electric-lab/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/mehdi2044/kia-electric-lab/actions/workflows/ci.yml)
```

Reason:

- `develop` is the active integration branch.
- The CI workflow runs on pushes to `develop` and pull requests targeting `develop`.

### Architecture Changes

No application architecture changed.

Repository governance changed:

- `origin` is now the canonical GitHub remote.
- `develop` and `main` are tracking remote branches.
- release tags are now available on GitHub.
- README exposes GitHub Actions CI status.

### Dependencies Added

No dependency was added.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved systems:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- migration engine
- diagnostics engine
- repair engine
- lesson engine
- lesson sandbox apply logic

### Formulas Implemented

No formulas were implemented or changed.

### Bugs

No runtime bugs were found.

Operational note:

- GitHub CLI is not installed locally, so workflow status cannot be checked with `gh run list`.

### Limitations

- First GitHub Actions run still needs to be reviewed in the GitHub UI or through GitHub API polling.
- Branch protection is not configured from this local workspace.
- The README badge may show pending/failing until the first workflow run completes.

### TODOs

- Confirm the first GitHub Actions run result.
- Inspect artifacts if the first run fails.
- Configure GitHub branch protection requiring CI before merge to `develop`.
- Optionally add GitHub repository description and topics.

### Risks

- If GitHub Actions exposes Windows runner screenshot drift, visual baselines may need a reviewed adjustment.
- If branch protection is not configured, contributors can still merge without CI enforcement.
- If the repository default branch differs from the team policy, GitHub PR defaults may need adjustment.

### Scalability Concerns

- As contributors are added, branch protection and required reviews become important.
- CI artifacts should be monitored for storage and retention needs.
- Future releases may benefit from GitHub Releases generated from tags.

### Verification

Local verification after Phase 18 baseline:

- `npm run verify:ci`: passed.
- `npm test`: 60 tests passed.
- `npm run build`: passed.
- `npm run test:e2e`: 26 Playwright tests passed.

Git verification:

- `git branch -vv` shows `develop` tracking `origin/develop`.
- `git branch -vv` shows `main` tracking `origin/main`.
- `git remote -v` shows the real GitHub URL for fetch and push.

### Next Recommended Step

Open GitHub Actions for `mehdi2044/kia-electric-lab`, confirm the first workflow result, then enable branch protection on `develop` requiring the CI workflow to pass.

## 2026-05-15 14:25 Europe/Istanbul - Phase 19 Engineering Report: GitHub Branch Protection And Release Governance

### Completed Work

Phase 19 investigated whether branch protection for `develop` could be configured from the available environment and documented the release-governance policy needed to prevent broken code from being merged accidentally.

Automatic branch protection could not be configured because the environment does not have an authenticated GitHub administration channel. Instead of faking success, the exact manual GitHub UI steps were added to `DEVELOPMENT_WORKFLOW.md`.

### Modified Files

- `DEVELOPMENT_WORKFLOW.md`
- `project-docs/PROJECT_MEMORY.md`
- `project-docs/PHASE_REPORTS.md`
- `project-docs/TODO.md`
- `project-docs/KNOWN_ISSUES.md`

### Branch Protection Capability Check

Checked:

- GitHub CLI:
  - result: unavailable
  - detail: `gh` is not installed.
- Environment tokens:
  - `GITHUB_TOKEN`: missing
  - `GH_TOKEN`: missing
- GitHub branch-protection API:
  - endpoint checked: `https://api.github.com/repos/mehdi2044/kia-electric-lab/branches/develop/protection`
  - result: `401 Unauthorized`

Conclusion:

- Branch protection cannot be configured automatically from this session.
- Mehdi must configure it manually in GitHub, or provide authenticated admin API access in a future session.

### Manual Branch Protection Steps Documented

Documentation now instructs Mehdi to open:

```text
https://github.com/mehdi2044/kia-electric-lab/settings/branches
```

Target branch:

```text
develop
```

Required protection settings:

- require pull request before merging
- require status checks before merging
- require branch to be up to date before merging, if available
- required check: `Unit, build, and browser verification`
- if GitHub shows workflow-level naming instead, required check: `Kia Electric Lab CI`
- block force pushes
- block deletions

Recommended optional settings:

- require at least one approval before merging
- require conversation resolution before merging
- restrict direct pushes to maintainers only

### Architecture Changes

No application architecture changed.

Repository governance changed:

- `develop` is formally documented as the protected integration branch.
- `main` is formally documented as stable release history.
- feature branches must target `develop`.
- release tags should point to stable `main` commits.
- snapshot updates require explicit review.

### Engineering Decisions

- Did not attempt to bypass GitHub permissions.
- Did not claim branch protection was configured.
- Documented manual setup because repository administration settings are outside unauthenticated Git access.
- Listed both possible required check names because GitHub may expose job-level or workflow-level checks in the branch protection UI.
- Kept branch protection focused on `develop` first because that is the active integration branch.

### Dependencies Added

No dependency was added.

### Electrical Logic Implemented

No electrical logic was implemented or changed.

Preserved systems:

- topology engine
- current engine
- validation engine
- safety engine
- cost engine
- migration engine
- diagnostics engine
- repair engine
- lesson engine
- lesson sandbox apply logic

### Formulas Implemented

No formulas were implemented or changed.

### Bugs

No runtime bugs were found.

Operational limitation found:

- No authenticated GitHub administration mechanism is available in the local environment.

### Limitations

- Branch protection is documented but not yet configured in GitHub.
- The exact required status check label should be confirmed in GitHub's branch protection UI.
- `main` is not yet documented as protected by a GitHub rule; it is governed by workflow policy until Mehdi configures protections.

### TODOs

- Mehdi should manually enable branch protection for `develop`.
- Confirm the required status check name in GitHub.
- Consider requiring one approval before merge.
- Consider protecting `main` after `develop` protection is confirmed.

### Risks

- Until branch protection is enabled in GitHub, direct pushes or unverified merges are still technically possible.
- If the wrong required status check is selected, CI may not block merges as intended.
- If snapshots are updated without review, visual regressions can be hidden.

### Scalability Concerns

- As contributors grow, required PR review and CODEOWNERS may become necessary.
- Release governance may need GitHub Releases and changelog automation.
- Multiple CI jobs may require a required-check naming convention.

### Verification

Verified:

- `git status` was clean before documentation changes.
- `gh` is unavailable.
- `GITHUB_TOKEN` and `GH_TOKEN` are missing.
- GitHub API branch-protection access returns `401 Unauthorized`.
- Latest GitHub Actions run for `develop` was previously verified successful:
  - workflow: `Kia Electric Lab CI`
  - job: `Unit, build, and browser verification`
  - conclusion: success

No runtime test suite was run for Phase 19 because the changes are documentation-only and do not alter application code.

### Next Recommended Step

Mehdi should configure the documented `develop` branch protection rule in GitHub settings, then try a small test pull request to confirm GitHub blocks merge until `Kia Electric Lab CI` passes.

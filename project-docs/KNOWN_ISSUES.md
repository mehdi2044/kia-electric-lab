# Kia Electric Lab - Known Issues

Known issue policy: append issues with timestamps. Do not delete historical issues. When fixed, add a dated fix note under the issue.

## 2026-05-14 13:05 Europe/Istanbul - Phase 1 Known Issues

### KI-001 - No Git Repository Detected

Severity: High for project continuity.

Description:

`C:\kiaelectriclab` is not currently a Git repository. This makes it harder to preserve history, review changes, and enforce governance.

Impact:

- No commit history.
- Phase 1 history had to be reconstructed from current files.
- Generated artifacts and source files are not separated by version-control rules.

Recommended fix:

- Initialize Git.
- Add `.gitignore`.
- Commit Phase 1 baseline and governance docs.

### KI-002 - No Project Schema Version

Severity: High for persistence.

Description:

`ElectricalProject` does not include a schema version. Zustand persists project state to local storage, but there is no migration or validation layer.

Impact:

- Future interface changes may break old saved projects.
- Users may need to reset local storage manually.

Recommended fix:

- Add `schemaVersion`.
- Add migration functions.
- Add persisted-state validation.

### KI-003 - Component Removal Not Implemented

Severity: Medium.

Description:

Users can add components but cannot remove them from the project.

Impact:

- Mistakes require full project reset.
- Learning workflow becomes frustrating.

Recommended fix:

- Add `removeComponent(componentId)` action.
- Remove component from any circuit membership.
- Add UI delete affordance.

### KI-004 - Appliance Removal From Circuit Not Implemented

Severity: Medium.

Description:

Appliance assignment to a circuit is additive. There is no UI/store action to remove an appliance from a circuit.

Impact:

- Learners cannot correct circuit composition except by reset.
- Cost and safety calculations may include stale loads.

Recommended fix:

- Add `removeApplianceFromCircuit(circuitId, applianceId)`.
- In the long term, replace appliance IDs with unique placed load IDs.

### KI-005 - Multiple Identical Appliances Are Not Modeled Correctly

Severity: Medium for simulation correctness.

Description:

Circuits store `applianceIds` as unique IDs. The store often uses `Set` to deduplicate appliance IDs.

Impact:

- Two identical appliances, such as two TVs or multiple LED lamps, cannot be represented accurately by appliance ID alone.
- Load may be undercounted if the intended model has duplicate appliance types.

Recommended fix:

- Add `LoadInstance` with unique ID and `applianceTypeId`.

### KI-006 - Wire Path Is Not A Real Geometry Model

Severity: Medium.

Description:

`wire-path` exists as a component type, and circuits have `lengthMeters`, but wire routes are not drawn or measured.

Impact:

- Voltage drop and wire cost rely on manual length slider.
- Visual simulator does not yet teach route planning accurately.

Recommended fix:

- Implement wire path drawing as geometry.
- Calculate length from path.
- Bind path to circuit.

### KI-007 - React Flow Edges Are Visual, Not Electrical Topology

Severity: Medium.

Description:

Edges connect the main panel to components for visual feedback. They do not represent actual conductor topology, junctions, branches, or switching.

Impact:

- Advanced circuit simulation cannot rely on current edge model.

Recommended fix:

- Add separate electrical topology model.
- Keep React Flow as view layer.

### KI-008 - Bathroom Safety Model Is Simplified

Severity: Medium.

Description:

Any bathroom outlet triggers a high-risk warning, but the app does not model zones, distances, RCD/GFCI protection, IP ratings, or local code.

Impact:

- Educationally useful but incomplete.

Recommended fix:

- Add explicit bathroom lesson mode.
- Add protective device concepts.
- Keep disclaimer clear.

### KI-009 - Cost By Room Is Approximate

Severity: Low to Medium.

Description:

Cost by room divides a circuit cost equally among circuit rooms.

Impact:

- A circuit crossing multiple rooms may allocate costs inaccurately.

Recommended fix:

- Allocate by component count and measured wire length per room after wire path implementation.

### KI-010 - Cost Data Has No Version Or Currency Metadata

Severity: Medium for future cost engine.

Description:

Unit costs are hardcoded and displayed as toman, but the data model does not include currency, effective date, source, region, or profile name.

Impact:

- Estimates may be misread as current market prices.
- Future updates may be hard to audit.

Recommended fix:

- Add `CostProfile`.
- Include currency, effective date, region, and educational disclaimer.

### KI-011 - Safety Rules Are Procedural

Severity: Medium for scalability.

Description:

Safety warnings are generated in a single procedural function.

Impact:

- Rule count will become harder to maintain as project grows.
- Per-rule testing and AI explanations will be less structured.

Recommended fix:

- Introduce rule registry with typed rule metadata.

### KI-012 - Visual Browser Verification Timed Out

Severity: Low.

Description:

The app built successfully and served HTTP 200, but in-app browser automation timed out during screenshot/DOM verification.

Impact:

- No automated visual screenshot record for Phase 1.

Recommended fix:

- Retry browser verification after stabilizing tool connection.
- Add repeatable Playwright or browser-use smoke test.

### KI-013 - No Lint Or Format Script

Severity: Low to Medium.

Description:

The project has tests and build scripts, but no linting or formatting command.

Impact:

- Code style may drift as the project grows.

Recommended fix:

- Add ESLint and Prettier or another agreed toolchain.

### KI-014 - Generated Files Are Present In Workspace

Severity: Low.

Description:

`dist`, logs, build info, generated Vite config JS/d.ts, and `node_modules` are present.

Impact:

- If Git is initialized without `.gitignore`, generated files may be accidentally committed.

Recommended fix:

- Add `.gitignore` before first commit.

## 2026-05-14 13:25 Europe/Istanbul - Known Issues Update After Git Initialization

### KI-001 Status Update - Git Repository Initialized

Status:

- Resolved locally.

Resolution:

- Git repository initialized.
- `main` and `develop` branches created.
- Phase 1 baseline committed.
- Phase 1 baseline tagged as `v0.1-phase1-baseline`.

Remaining risk:

- No remote repository is configured yet.
- Local history is still vulnerable to local disk failure.
- Branch protection is not possible until a remote Git hosting provider is configured.

### KI-014 Status Update - Ignore Rules Added

Status:

- Resolved for future Git tracking.

Resolution:

- `.gitignore` now excludes generated and local-only files including `node_modules`, `dist`, build output, Vite caches, coverage, env files, logs, OS files, editor files, TypeScript build info, and generated Vite config artifacts.

Remaining risk:

- If future tooling generates new local artifacts, `.gitignore` must be updated.

## 2026-05-14 13:40 Europe/Istanbul - Known Issues Update After Topology Engine

### KI-015 - Wire Routing UI Not Implemented

Severity: High for Phase 2 completion.

Description:

The electrical graph engine supports explicit `ElectricalWire[]`, but the UI does not yet allow users to draw or edit those wires.

Impact:

- Existing user projects rely on generated topology from circuit membership.
- Users cannot yet author malformed or custom topology from the visual interface.

Recommended fix:

- Add terminal-aware wire drawing UI.
- Persist wires in Zustand state.
- Render visual wires from the topology source of truth.

### KI-016 - Generated Topology Is A Compatibility Bridge

Severity: Medium.

Description:

When `project.wires` is empty, the topology engine generates deterministic educational wires from circuit/component membership.

Impact:

- This allows real graph validation now, but it is not the same as user-drawn route geometry.

Recommended fix:

- Add visible UI indicator for generated topology mode.
- Prefer explicit wires once wire-routing UI exists.

### KI-017 - Current Engine Is Educational, Not A Full Circuit Solver

Severity: Medium.

Description:

The current engine propagates simplified branch load current through a graph. It does not solve arbitrary analog networks.

Impact:

- It is suitable for residential educational radial/branch examples.
- It is not suitable for complex electrical network analysis.

Recommended fix:

- Keep educational scope explicit.
- Add more advanced solver only if Vi approves the architecture and product need.

## 2026-05-14 14:20 Europe/Istanbul - Known Issues Update After Wire Routing UI

### KI-015 Status Update - Wire Routing UI Implemented At Logical Level

Status:

- Partially resolved.

Resolution:

- Users can now create explicit `ElectricalWire[]` by clicking terminals.
- Wires are persisted in Zustand.
- Topology engine validates explicit wires.

Remaining limitation:

- Wire visuals connect component nodes rather than exact terminal coordinates.
- Wires do not yet have route points or measured geometry.

### KI-018 - Wire Length Still Manual

Severity: Medium.

Description:

Wire length can be edited, but it is not calculated from route geometry.

Impact:

- Voltage drop and cost depend on manual input.

Recommended fix:

- Add route points and geometry-based length calculation.

### KI-019 - Earth Is Placeholder Only

Severity: Medium.

Description:

Earth terminals are visible for education, but grounding behavior is not simulated.

Impact:

- Learners see the earth concept, but the engine does not model protective earth current, fault clearing, or bonding.

Recommended fix:

- Add a grounding lesson/profile before deeper earth simulation.

### KI-020 - Browser Visual Automation Timed Out

Severity: Low.

Description:

The in-app browser automation timed out during Phase 3 visual verification.

Impact:

- Tests/build/local HTTP check passed, but no automated browser screenshot was recorded.

Recommended fix:

- Retry browser visual smoke test after automation runtime is stable.

## 2026-05-14 15:00 Europe/Istanbul - Known Issues Update After Geometric Routing

### KI-018 Status Update - Wire Length Geometry Implemented

Status:

- Partially resolved.

Resolution:

- Wire length is now calculated from terminal coordinates and route points.

Remaining limitation:

- Scale is user-configurable and may be inaccurate.
- Manual override still exists.

### KI-021 - Terminal Coordinates Are Offset-Based

Severity: Medium.

Description:

Terminal coordinates are deterministic offsets from component positions, not measured from actual DOM terminal button locations.

Impact:

- Wires are spatially meaningful but may not perfectly align with rendered button centers under every future layout change.

Recommended fix:

- Add custom React Flow nodes/handles or DOM measurement for exact terminal anchor points.

### KI-022 - Panelboard Is Educational, Not Physical

Severity: Low to Medium.

Description:

The panelboard UI models breaker assignment and ratings, but not physical panel constraints, DIN rails, busbars, neutral/earth bars, or real installation details.

Recommended fix:

- Add a panelboard lesson/profile before deeper physical panel modeling.

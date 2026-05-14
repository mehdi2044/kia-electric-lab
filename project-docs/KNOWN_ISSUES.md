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

## 2026-05-14 15:25 Europe/Istanbul - Known Issues Update After Schema Migration System

### KI-023 - Exported Project JSON Has No Checksum

Severity: Low to Medium.

Description:

Project export/import now works, but exported JSON does not include an integrity checksum, signature, or hash.

Impact:

- Manual edits or partial downloads may only be detected through schema validation after import.
- Future shared project files may need stronger integrity guarantees.

Recommended fix:

- Add a project-level hash/checksum for exported files and verify it before import.

### KI-024 - Migration Repairs Are Warning-Only

Severity: Medium.

Description:

Migration validation warns about dangling component, terminal, circuit, or panelboard references, but it does not yet offer automatic repair actions.

Impact:

- A migrated project may load safely but still require manual correction by the user or engineer.

Recommended fix:

- Add a Project Repair panel with actions to remove orphan wires, reassign breaker slots, and reconnect terminal refs.

### KI-025 - Backup Storage Is Browser-Local

Severity: Low.

Description:

Automatic backups are stored in the browser localStorage backup key and limited to recent records.

Impact:

- Backups are not durable across browser profile deletion, manual localStorage clearing, or device migration.

Recommended fix:

- When Tauri is introduced, store backups as project files or SQLite backup rows.

### KI-026 - No Browser Fixture Regression Test Yet

Severity: Low to Medium.

Description:

Unit tests cover migration functions, but no browser automation test currently seeds old localStorage shapes and confirms UI recovery.

Impact:

- Hydration behavior is covered by production build and code structure, but not by an automated browser fixture.

Recommended fix:

- Add Playwright or Browser-plugin fixture tests for Phase 1-4 stored projects and corrupted storage.

## 2026-05-14 15:45 Europe/Istanbul - Known Issues Update After Diagnostics And Repair

### KI-023 Status Update - Export Checksum Implemented

Status:

- Partially resolved.

Resolution:

- Project exports now include a deterministic checksum envelope.
- Import warns in Persian when checksum mismatch is detected.

Remaining limitation:

- The checksum is not cryptographic and should not be treated as a security signature.

### KI-024 Status Update - Safe Repairs Added

Status:

- Partially resolved.

Resolution:

- Safe repairs now handle orphan wires, missing circuit assignments in panelboard, invalid scale, missing schema metadata, and some duplicate id cases.

Remaining limitation:

- No per-issue repair selection UI yet.
- No undo history yet.

### KI-026 Status Update - Storage Migration Fixtures Added

Status:

- Partially resolved.

Resolution:

- Unit-level browser-storage fixtures now seed Phase 1-4 localStorage shapes and verify preflight migration.

Remaining limitation:

- No visual browser automation flow yet.

### KI-027 - Repair UI Repairs All Safe Issues At Once

Severity: Low to Medium.

Description:

The diagnostics UI has a single "repair safe issues" button. It does not yet allow selecting individual safe issues.

Impact:

- Users cannot apply only one safe repair when several are present.

Recommended fix:

- Add per-issue selection and a repair preview.

### KI-028 - Diagnostic Scan Is Full-Project Only

Severity: Low.

Description:

Diagnostics currently scan the full project on every relevant render.

Impact:

- Fine for MVP scale, but very large future projects may need incremental diagnostics.

Recommended fix:

- Add memoized/incremental diagnostics once project size grows.

## 2026-05-14 16:10 Europe/Istanbul - Known Issues Update After Guided Lessons

### KI-029 - Switch Internal State Is Not Modeled

Severity: Medium.

Description:

The topology engine has switch terminals, but it does not yet model a switch as an internal conductive state between input and output when closed.

Impact:

- Lesson validation for switch lessons must check breaker-to-switch and switch-output-to-lamp paths explicitly.
- Current-flow simulation may still flag open phase in switch-controlled lamp circuits until switch state is modeled.

Recommended fix:

- Add switch state and internal connectivity rules to the topology engine.

### KI-030 - Lesson Reset Is Circuit-Based, Not Sandbox-Based

Severity: Low to Medium.

Description:

The lesson reset action clears explicit wires from the currently selected circuit. It does not restore a lesson-specific starter scene.

Impact:

- If the learner has selected a different circuit, the reset may not affect the intended lesson circuit.

Recommended fix:

- Add lesson-specific sandbox templates and reset only that lesson workspace.

### KI-031 - Bundle Size Warning After Lesson Mode

Severity: Low.

Description:

Vite reports a chunk-size warning above 500 kB after adding lesson UI and validation modules.

Impact:

- Build succeeds and local app works, but long-term app growth may need code splitting.

Recommended fix:

- Introduce route-level or feature-level dynamic imports for lesson, diagnostics, and report panels if bundle growth continues.

## 2026-05-14 18:35 Europe/Istanbul - Known Issues Update After Lesson Sandbox

### KI-030 Status Update - Lesson Reset Improved

Status:

- Partially resolved.

Resolution:

- A true lesson sandbox reset now recreates the sandbox from the lesson template.

Remaining limitation:

- The older current-circuit wiring reset still exists as a quick practice tool.

### KI-032 - Sandbox Apply Replaces Main Project

Severity: Medium.

Description:

Applying sandbox result currently replaces the active main project with the sandbox project. It does not yet offer append/merge strategies.

Impact:

- Useful for lessons, but advanced users may expect only the lesson circuit to be copied into the apartment project.

Recommended fix:

- Add apply modes: replace, append circuit, save named example.

### KI-033 - Ghost Wire Suggestions Are Geometric Hints Only

Severity: Low.

Description:

Ghost wire suggestions show a simple terminal-to-terminal hint and do not yet compute an optimal route with bends.

Impact:

- Helpful for learning the next connection, but not a routing optimization tool.

Recommended fix:

- Generate route-aware ghost wires using floor-plan geometry and lesson step metadata.

### KI-034 - Saved Sandbox Examples Have No Management UI

Severity: Low.

Description:

Sandbox examples can be saved in state, but there is no list/export/delete UI yet.

Recommended fix:

- Add saved examples panel under lesson mode.

## 2026-05-14 20:35 Europe/Istanbul - Known Issues Update After Apply Modes

### KI-032 Status Update - Apply Modes Added

Status:

- Partially resolved.

Resolution:

- Replace, append, and save-example modes now exist.
- Append mode preserves main project and copies lesson artifacts with remapped ids.

Remaining limitation:

- Append placement uses a simple coordinate offset and is not collision-aware.

### KI-034 Status Update - Example Management Added

Status:

- Partially resolved.

Resolution:

- Saved examples can be listed, loaded, deleted, and exported.

Remaining limitation:

- No example import or checksum envelope yet.

### KI-035 - Apply Confirmation Uses Browser Confirm

Severity: Low.

Description:

Apply confirmation currently uses `window.confirm`, which is safe but not as polished or detailed as a custom in-app Persian modal.

Recommended fix:

- Add a custom apply preview modal with affected objects and diagnostics summary.

### KI-036 - Append Layout Can Become Crowded

Severity: Medium.

Description:

Append mode offsets copied components slightly but does not calculate free space in the floor plan.

Impact:

- Appended lesson components may overlap existing components in dense rooms.

Recommended fix:

- Add collision-aware placement or append into a dedicated example area.

### KI-037 - Bundle Size Increased Again

Severity: Low.

Description:

Production JS chunk is now about 522 kB minified and Vite warns about chunk size.

Recommended fix:

- Add dynamic imports/code splitting for lesson mode, diagnostics, and report panels.

## 2026-05-14 21:30 Europe/Istanbul - Known Issues Update After Phase 10

### KI-035 Status Update - Apply Preview Modal Added

Status:

- Partially resolved.

Resolution:

- `window.confirm` was replaced for apply flow with an in-app Persian preview modal.

Remaining limitation:

- Modal does not yet trap focus or support Escape key close.

### KI-036 Status Update - Collision-Aware Append Added

Status:

- Partially resolved.

Resolution:

- Append mode now searches candidate offsets to reduce overlap and offsets route points consistently.

Remaining limitation:

- This is not a full packing/layout solver.

### KI-037 Status Update - Code Splitting Added

Status:

- Resolved for current build.

Resolution:

- Lesson, project data, and diagnostics panels are lazy-loaded.
- Vite build no longer reports chunk-size warning.

### KI-038 - Main Chunk Still Near Threshold

Severity: Low.

Description:

The main production chunk is below the Vite warning threshold but still close to 500 kB.

Recommended fix:

- Continue feature-level splitting as the app grows.

### KI-039 - Example Envelope Is Separate From Project Envelope

Severity: Low.

Description:

Project export and example export use similar checksum envelope logic but not a shared generic artifact helper.

Recommended fix:

- Create shared artifact envelope utilities before adding lesson-pack import/export.

## 2026-05-14 21:43 Europe/Istanbul - Known Issues Update After Phase 11

### KI-035 Status Update - Apply Modal Accessibility Hardened

Status:

- Mostly resolved.

Resolution:

- Apply preview modal now traps focus between cancel and confirm.
- Escape closes the modal.
- Enter confirms only when the confirm button is focused.
- Initial focus goes to cancel for safety.
- ARIA dialog metadata was added.

Remaining limitation:

- The modal is still local to `LessonPanel`; it should become a reusable shared modal primitive before more destructive flows are added.

### KI-036 Status Update - Append Layout Planner Improved

Status:

- Improved, still partially open.

Resolution:

- Append layout now uses bounding-box checks and searches multiple directions/step sizes.
- Route points remain offset with appended components.
- Layout warnings can be returned when placement is uncertain.

Remaining limitation:

- The planner is not a full geometric packing solver and does not yet understand room boundaries as hard constraints.

### KI-038 Status Update - Main Chunk No Longer Near Threshold

Status:

- Improved.

Resolution:

- Vite manual chunks split React/Zustand, React Flow, and icons.
- Main app chunk is now about 330 kB in the production build.

Remaining limitation:

- Future feature growth can still require route-level splitting.

### KI-040 - No Automated Browser QA Yet

Severity: Medium.

Description:

Phase 11 added a manual UI QA checklist but did not add Playwright or an equivalent browser automation dependency.

Reason:

- The project does not yet have a selector/testing policy for stable browser tests.
- Adding Playwright now would increase dependency and maintenance surface before the team agrees on test ownership.

Recommended fix:

- Add stable selectors and Playwright smoke tests in a dedicated QA phase.

### KI-041 - Audit Log Has No UI Viewer

Severity: Low.

Description:

Apply/example audit entries are persisted in project state, but there is not yet a dedicated UI panel for browsing history.

Recommended fix:

- Add an audit history viewer with filters by action type, lesson, and warning status.

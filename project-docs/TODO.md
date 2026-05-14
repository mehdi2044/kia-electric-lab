# Kia Electric Lab - TODO

TODO policy: append new TODO entries with timestamps. Mark items complete with a dated note rather than deleting them.

## 2026-05-14 13:05 Europe/Istanbul - Phase 1 Backlog And Phase 2 Recommendations

### Highest Priority

- [ ] Initialize Git repository in `C:\kiaelectriclab`.
- [ ] Add `.gitignore` covering `node_modules`, `dist`, logs, TypeScript build info, Vite generated JS/d.ts outputs if they are not intentionally source controlled.
- [ ] Commit Phase 1 source and governance documentation.
- [ ] Add `schemaVersion` to `ElectricalProject`.
- [ ] Add local storage migration and fallback handling.
- [ ] Add delete/remove actions for circuits, components, and appliance assignments.
- [ ] Add tests for every safety warning branch.
- [ ] Add tests for cost engine calculations.

### Electrical Simulation

- [ ] Introduce a `LoadInstance` or `PlacedLoad` model so multiple copies of the same appliance can exist independently.
- [ ] Add custom appliance wattage editing for lessons.
- [ ] Add circuit demand/diversity educational mode, clearly labeled as an approximation.
- [ ] Add inrush/startup current educational warnings for compressor/motor loads.
- [ ] Add RCD/GFCI/RCCB educational component and bathroom/kitchen protection warnings.
- [ ] Add grounding/protective earth educational concept without representing it as professional approval.
- [ ] Add clearer distinction between warning, educational note, and hard invalid state.
- [ ] Add recommended correction objects rather than plain warning strings.

### Visual Simulator

- [ ] Make placed components draggable after placement.
- [ ] Add component delete button.
- [ ] Add circuit membership badges on components.
- [ ] Implement real wire path drawing.
- [ ] Calculate wire length from drawn path.
- [ ] Allow wire path editing and snapping.
- [ ] Add room-level zoom/focus.
- [ ] Add visual legend for circuit colors.
- [ ] Add panel/breaker board visual representation.

### Circuit Builder

- [ ] Add circuit deletion.
- [ ] Add appliance removal from circuit.
- [ ] Add component removal from circuit.
- [ ] Add duplicated appliance handling.
- [ ] Add per-circuit notes and lesson hints.
- [ ] Add warning badges near relevant controls.
- [ ] Add suggested wire/breaker correction buttons.

### Cost Engine

- [ ] Add cost-engine unit tests.
- [ ] Add currency metadata.
- [ ] Add cost profile name and effective date.
- [ ] Add editable price assumptions.
- [ ] Add import/export for cost profiles.
- [ ] Add uncertainty range for educational estimates.
- [ ] Improve room cost allocation using actual components and wire length.
- [ ] Show exact overdesign alternative wire size.

### Report Engine

- [ ] Add printable report mode.
- [ ] Add JSON export of report snapshot.
- [ ] Add report version metadata.
- [ ] Split warnings, corrections, and learning explanations into structured sections.
- [ ] Add teacher/parent summary.
- [ ] Add AI tutor context export after safety/privacy review.

### UI/UX

- [ ] Complete accessibility pass.
- [ ] Add keyboard interactions for component placement where practical.
- [ ] Improve mobile layout for floor plan.
- [ ] Add empty states and onboarding microcopy.
- [ ] Add guided scenario mode.
- [ ] Add Persian typography polish with a bundled/local font decision.
- [ ] Add visual feedback when drag/drop succeeds.

### Testing And QA

- [ ] Add linting.
- [ ] Add formatting command.
- [ ] Add CI script once Git is initialized.
- [ ] Add store mutation tests.
- [ ] Add UI smoke tests.
- [ ] Add browser screenshot verification for desktop and mobile.
- [ ] Add tests for local storage migration after schema versioning.

### Documentation

- [x] Create `project-docs/PROJECT_MEMORY.md` on 2026-05-14.
- [x] Create `project-docs/PHASE_REPORTS.md` on 2026-05-14.
- [x] Create `project-docs/ARCHITECTURE.md` on 2026-05-14.
- [x] Create `project-docs/TODO.md` on 2026-05-14.
- [x] Create `project-docs/KNOWN_ISSUES.md` on 2026-05-14.
- [x] Create `project-docs/ELECTRICAL_RULES.md` on 2026-05-14.
- [x] Create `project-docs/COST_ENGINE_RULES.md` on 2026-05-14.
- [ ] Update docs after every completed task.
- [ ] Add ADR files if Vi wants formal architectural decision records.

### Future Platform

- [ ] Plan Tauri shell architecture.
- [ ] Plan SQLite schema.
- [ ] Plan multiplayer state architecture before implementation.
- [ ] Plan AI tutor boundaries and safety language.
- [ ] Plan lesson/scenario content format.

## 2026-05-14 13:25 Europe/Istanbul - Version Control TODO Update

### Completed

- [x] Initialize Git repository in `C:\kiaelectriclab`.
- [x] Add `.gitignore` covering `node_modules`, `dist`, `build`, Vite caches, coverage, environment files, OS files, editor files, logs, and TypeScript build info.
- [x] Create `main` branch.
- [x] Create `develop` branch.
- [x] Commit Phase 1 baseline.
- [x] Tag Phase 1 baseline as `v0.1-phase1-baseline`.
- [x] Create `CONTRIBUTING.md`.
- [x] Create `DEVELOPMENT_WORKFLOW.md`.

### New TODOs

- [ ] Add remote Git repository.
- [ ] Push `main`, `develop`, and `v0.1-phase1-baseline`.
- [ ] Add CI workflow for `npm test` and `npm run build`.
- [ ] Add branch protection for `main` after remote setup.
- [ ] Add release checklist.
- [ ] Decide whether to add formal ADR files for major architectural decisions.

## 2026-05-14 13:40 Europe/Istanbul - Phase 2 Topology TODO Update

### Completed

- [x] Add real electrical terminal roles.
- [x] Add real wire entity type.
- [x] Add topology graph nodes and wire edges.
- [x] Add graph traversal.
- [x] Add circuit traversal validation.
- [x] Add current propagation simulation.
- [x] Add topology breaker overload detection.
- [x] Add topology wire overload detection.
- [x] Add short-circuit detection.
- [x] Add disconnected phase/neutral detection.
- [x] Add incomplete loop detection.
- [x] Add invalid breaker feed detection.
- [x] Add topology unit tests.

### New TODOs

- [ ] Implement real wire-routing UI.
- [ ] Add Zustand actions for creating/updating/deleting `ElectricalWire` objects.
- [ ] Render explicit wires from topology source of truth.
- [ ] Add switch open/closed state.
- [ ] Add explicit grounding/protective earth model.
- [ ] Add three-phase topology profile.
- [ ] Add topology graph inspector/debug panel for Vi/Codex.
- [ ] Add tests for explicit invalid switch wiring.
- [ ] Add tests for overloaded shared feeder wire.
- [ ] Add migration for old local storage projects without `wires`.

## 2026-05-14 14:20 Europe/Istanbul - Phase 3 TODO Update

### Completed

- [x] Add terminal-aware wire drawing mode.
- [x] Add clickable terminals on visible components.
- [x] Add visible virtual breaker nodes with input/output terminals.
- [x] Store explicit `ElectricalWire[]` in Zustand.
- [x] Render explicit wires on the floor plan.
- [x] Highlight selected wire.
- [x] Mark invalid wires visually.
- [x] Add wire inspector.
- [x] Add delete wire action.
- [x] Add edit wire size action.
- [x] Add edit wire length action.
- [x] Add wire kind/type support.
- [x] Add clear invalid wires action.
- [x] Add reset wiring for circuit action.
- [x] Add reset wiring for room action.
- [x] Add guided mini-exercises.
- [x] Add unit tests for wire creation and explicit topology validation.

### New TODOs

- [ ] Add route points to wires.
- [ ] Calculate wire length from route geometry.
- [ ] Render wires at terminal-level coordinates instead of node centers.
- [ ] Add panelboard/breaker arrangement UI.
- [ ] Add explanatory labels for generated fallback vs explicit topology.
- [ ] Add earth/grounding lesson before enabling deeper earth simulation.
- [ ] Add browser visual smoke test once automation runtime is stable.

## 2026-05-14 15:00 Europe/Istanbul - Phase 4 TODO Update

### Completed

- [x] Add route points to wires.
- [x] Calculate wire length from route geometry.
- [x] Add scale conversion with pixels per meter.
- [x] Render routed wires as polylines.
- [x] Show bend handles for selected wire.
- [x] Add bend point.
- [x] Drag bend point.
- [x] Remove bend point.
- [x] Reset route.
- [x] Snap route points to grid.
- [x] Add educational panelboard UI.
- [x] Add circuit-breaker assignment UI.
- [x] Validate circuit without breaker.
- [x] Validate breaker without circuit.
- [x] Validate overloaded breaker.
- [x] Validate breaker/wire incompatibility.
- [x] Integrate geometric wire length into cost engine.
- [x] Add geometry and panelboard tests.

### New TODOs

- [ ] Add project schema version and migration for `routePoints`, `pixelsPerMeter`, and `panelboard`.
- [ ] Add terminal DOM-handle measurement or custom React Flow handles for exact visual alignment.
- [ ] Add explicit panelboard slot add/remove controls.
- [ ] Add UI badge for calculated length vs manual override.
- [ ] Add route segments with right-angle routing mode.
- [ ] Add conduit/path grouping model.

## 2026-05-14 15:25 Europe/Istanbul - Phase 5 TODO Update

### Completed

- [x] Add project schema version fields.
- [x] Add app version marker.
- [x] Add created/updated timestamps.
- [x] Create pure TypeScript migration engine.
- [x] Detect Phase 1 project shape.
- [x] Detect Phase 2 project shape.
- [x] Detect Phase 3 project shape.
- [x] Detect Phase 4 project shape.
- [x] Migrate legacy project shapes to latest schema.
- [x] Validate migrated project structure.
- [x] Preserve explicit `ElectricalWire[]`.
- [x] Preserve route points and manual length overrides.
- [x] Preserve panelboard assignments.
- [x] Backup localStorage before migration.
- [x] Quarantine corrupted persisted data.
- [x] Prevent app crash on corrupted stored project.
- [x] Add manual export JSON.
- [x] Add manual import JSON.
- [x] Add backup restore list.
- [x] Add Persian Project Data panel.
- [x] Add unit tests for schema detection, migration, preservation, corruption, and validation.

### New TODOs

- [ ] Add checksum or hash to exported project JSON.
- [ ] Add delete/export controls for individual backups.
- [ ] Add migration dry-run preview UI.
- [ ] Add repair actions for orphan wire terminals.
- [ ] Add repair actions for orphan panelboard breaker assignments.
- [ ] Add browser/E2E localStorage migration fixtures.
- [ ] Add larger fixture snapshots from each accepted phase.
- [ ] Add Tauri/SQLite storage adapter that reuses `projectMigration.ts`.
- [ ] Add project file format documentation for external review.

## 2026-05-14 15:45 Europe/Istanbul - Phase 6 TODO Update

### Completed

- [x] Add project diagnostics engine.
- [x] Add `DiagnosticIssue` type.
- [x] Detect orphan wires.
- [x] Detect wires pointing to missing components.
- [x] Detect wires pointing to missing terminals.
- [x] Detect components without valid room.
- [x] Detect circuits without components.
- [x] Detect circuits without breaker assignment.
- [x] Detect breaker assigned to missing circuit.
- [x] Detect invalid route points.
- [x] Detect invalid `pixelsPerMeter`.
- [x] Detect duplicated ids.
- [x] Detect invalid cost catalog settings.
- [x] Detect missing schema metadata.
- [x] Add conservative repair engine.
- [x] Remove orphan/invalid wires as safe repair.
- [x] Remove panelboard assignments to missing circuits.
- [x] Normalize invalid `pixelsPerMeter`.
- [x] Regenerate missing schema metadata.
- [x] Add Persian diagnostics panel.
- [x] Add diagnostic report JSON export.
- [x] Add backup delete.
- [x] Add backup export.
- [x] Show backup schema version.
- [x] Add export checksum envelope.
- [x] Validate checksum on import.
- [x] Add localStorage migration fixtures for Phase 1-4.

### New TODOs

- [ ] Add per-issue repair selection UI.
- [ ] Add repair undo/history.
- [ ] Add project repair log export.
- [ ] Add topology graph inspector for engineering/debug mode.
- [ ] Add user-confirmed repair for invalid component room assignment.
- [ ] Add stronger checksum/hash if project sharing begins.
- [ ] Add browser visual automation for diagnostics panel.
- [ ] Add diagnostics for future editable cost profiles.

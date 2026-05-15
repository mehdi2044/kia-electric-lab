# Release Notes

## v0.18-phase18-github-baseline - 2026-05-15

### Release Purpose

This release baseline captures Kia Electric Lab after Phase 18: a versioned local educational simulator with Git workflow, CI workflow, visual QA baselines, governance documentation, and project onboarding material.

This is not a professional electrical installation tool. It remains an educational simulator.

### Completed Phases 1-18 Summary

#### Phase 1 - MVP Educational Simulator

- Persian RTL dashboard.
- Apartment floor plan.
- Component palette.
- Manual circuit creation.
- Appliance assignment.
- current and wattage calculations.
- wire and breaker selection.
- safety warnings.
- cost summary.
- final educational report.

#### Phase 2 - Real Electrical Topology Engine

- terminal-aware electrical model baseline.
- graph-based topology engine.
- current propagation model.
- circuit validation.
- short-circuit and open-loop detection.
- separation between React Flow visuals and electrical truth.

#### Phase 3 - Terminal-Aware Wire Routing UI

- clickable terminals.
- user-authored `ElectricalWire[]`.
- explicit wire creation.
- wire inspector.
- Persian wiring warnings.
- educational mini-exercise foundation.

#### Phase 4 - Geometric Wire Routing And Panelboard UI

- wire route points.
- bend point editing.
- geometry-based length calculation.
- scale conversion.
- panelboard view.
- breaker/circuit mapping.
- geometric cost integration.

#### Phase 5 - Schema Versioning And Migration

- project `schemaVersion`.
- project `appVersion`.
- migration engine.
- storage backup before migration.
- import/export/reset safety.
- corruption handling.

#### Phase 6 - Diagnostics, Repair, And Export Integrity

- diagnostics engine.
- repair engine.
- backup management.
- export checksum.
- conservative data repair.
- Persian recovery UX.

#### Phase 7 - Guided Lesson Mode For Kiarash

- lesson engine.
- lesson progress.
- lesson validation.
- first eight Persian guided lessons.
- scoring and hints.

#### Phase 8 - Lesson Sandbox Templates

- isolated lesson sandbox state.
- lesson templates.
- guided floor-plan highlighting.
- sandbox persistence.
- safe apply path.

#### Phase 9 - Sandbox Apply Modes And Example Management

- replace main project.
- append lesson result.
- save as example.
- saved example model and UI.
- diagnostics after apply.

#### Phase 10 - Apply Preview Modal And Code Splitting

- custom Persian apply preview modal.
- collision-aware append layout.
- example checksum import/export.
- example rename and notes improvements.
- lazy-loaded major panels.

#### Phase 11 - UI Hardening And Audit

- modal accessibility improvements.
- apply result summary.
- audit history model.
- visual QA support.
- better append layout planner.

#### Phase 12 - Shared Modal And Playwright Smoke Tests

- reusable `AccessibleModal`.
- audit history viewer.
- stable test selectors.
- Playwright setup.
- initial browser smoke tests.

#### Phase 13 - Advanced E2E And Modal Unification

- modal keyboard e2e tests.
- sandbox apply e2e tests.
- example import e2e tests.
- risky confirmations migrated to shared modal.

#### Phase 14 - E2E Fixtures And Edit Modal

- reusable Playwright fixture utilities.
- remaining risky flow tests.
- `window.prompt` replacement.
- reusable edit modal.

#### Phase 15 - Typed Fixtures And Visual Baseline

- typed fixture builders.
- audit download test.
- example download test.
- first desktop visual regression baselines.

#### Phase 16 - Mobile Visual Baselines And CI Readiness

- mobile visual baselines.
- snapshot review policy.
- CI readiness plan.
- Playwright desktop/mobile project separation.

#### Phase 17 - GitHub Actions CI

- `.github/workflows/ci.yml`.
- CI for push/PR/manual runs.
- npm cache.
- unit/build/e2e verification.
- artifact reporting.
- local `verify:ci` script.

#### Phase 18 - GitHub Baseline And Release Documentation

- upgraded README.
- release notes.
- version metadata update.
- GitHub remote setup instructions.
- baseline release tag.

### Current Capabilities

- Persian RTL educational UI.
- 220V single-phase residential simulation assumptions.
- apartment floor-plan based interaction.
- real internal electrical graph model.
- explicit terminal-aware wires as source of truth.
- geometry-based wire lengths.
- breaker and wire compatibility checks.
- load, current, resistance, and voltage-drop educational calculations.
- cost estimation.
- safety warnings in simple Persian.
- lesson mode and lesson sandbox mode.
- saved lesson examples.
- project diagnostics and repair.
- backup, restore, import, export, checksum.
- apply audit history.
- unit tests.
- Playwright e2e tests.
- desktop and mobile visual baselines.
- GitHub Actions CI workflow.

### Known Limitations

- Educational approximation only; not a professional design tool.
- 220V single-phase model only.
- grounding is still mostly placeholder-level.
- no three-phase simulation.
- no solar, UPS, generator, or smart-home simulation yet.
- visual baselines currently target Chromium on Windows.
- CI remote and badge require the real GitHub repository URL.
- Playwright browser cache is intentionally deferred.
- Tauri and SQLite are not implemented yet.

### Next Planned Phase

Recommended Phase 19:

- push to the real GitHub remote
- review first GitHub Actions run artifacts
- add the real CI badge to README
- configure GitHub branch protection for `develop`
- decide whether Windows remains canonical for visual baselines
- optionally add release-draft automation

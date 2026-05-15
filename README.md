# Kia Electric Lab

[![Kia Electric Lab CI](https://github.com/mehdi2044/kia-electric-lab/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/mehdi2044/kia-electric-lab/actions/workflows/ci.yml)

Kia Electric Lab is a local Persian RTL educational simulator for learning the basics of 220V single-phase residential apartment wiring. It is designed for guided learning, experimentation, and engineering curiosity, not for approving real installations.

## Vision

Kia Electric Lab is growing into an educational electrical laboratory for Kiarash and future learners. The project combines a visual apartment simulator, deterministic electrical topology logic, safety feedback, cost estimation, guided lessons, diagnostics, backups, visual QA, and CI automation.

Long-term goals:

- advanced educational electrical simulator
- AI-assisted electrical tutor
- cost estimation engine
- safety analysis engine
- structured lesson platform
- future Tauri + SQLite local app
- possible multiplayer educational simulation

## Safety Disclaimer

This software is for education only and must not be used as a professional electrical design, installation, inspection, or approval tool. Real electrical work must be designed, installed, and checked by qualified professionals under local laws and standards.

## Current Phase Status

Current baseline:

```text
v0.18-phase18-github-baseline
```

Implemented through Phase 18:

- Persian RTL educational dashboard
- 100 sqm apartment floor plan
- component placement and circuit assignment
- explicit terminal-aware wire routing
- routed wire geometry and calculated length
- panelboard view and breaker assignment
- topology, current, validation, safety, cost, diagnostics, repair, lesson, and sandbox engines
- project schema migration, backup, restore, import/export, checksum, and diagnostics tooling
- guided lesson mode for Kiarash
- lesson sandbox templates and safe apply modes
- saved examples and audit history
- shared accessible modal system
- Playwright browser tests, download tests, visual baselines, and mobile visual baselines
- GitHub Actions CI workflow with artifact reporting

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- React Flow
- Zustand
- Vitest
- Playwright
- GitHub Actions
- Local JSON/browser storage first

Future target:

- Tauri
- SQLite

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Verification Commands

Unit tests:

```bash
npm test
```

Production build:

```bash
npm run build
```

Browser/e2e/visual tests:

```bash
npm run test:e2e
```

Local CI-style verification:

```bash
npm run verify:ci
```

Update visual snapshots only after review:

```bash
npm run test:e2e:update
```

Debug browser tests headed:

```bash
npm run test:e2e:headed
```

## GitHub CI

Workflow:

```text
.github/workflows/ci.yml
```

Runs on:

- push to `develop`
- pull request targeting `develop`
- manual workflow dispatch

CI verifies:

- `npm ci`
- `npm test`
- `npm run build`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

CI uploads:

- `playwright-report/`
- `test-results/`
- `dist/` on failure

CI never updates screenshots. Snapshot updates are local/manual only and require review.

## GitHub Remote Setup

No Git remote is currently configured in this local repository.

Mehdi should create a GitHub repository named:

```text
kia-electric-lab
```

After GitHub provides the final repository URL, run one of the following with the real URL.

HTTPS example:

```bash
git remote add origin https://github.com/<owner>/kia-electric-lab.git
git push -u origin develop
git push origin main
git push origin --tags
```

SSH example:

```bash
git remote add origin git@github.com:<owner>/kia-electric-lab.git
git push -u origin develop
git push origin main
git push origin --tags
```

Do not use a guessed remote URL. Use the exact GitHub URL from the created repository.

## Screenshots And Visual Baselines

Committed Playwright screenshots currently cover:

- apply preview modal RTL layout
- diagnostics panel
- lesson panel
- audit viewer
- floor plan with routed wire
- mobile lesson panel
- mobile apply preview modal
- mobile diagnostics panel
- mobile audit viewer
- mobile floor plan with routed wire

Current visual baseline platform:

```text
Chromium on Windows
```

Linux visual baselines should be introduced only through a deliberate reviewed migration.

## Project Structure

```text
src/
  components/
  data/
  diagnostics/
  features/
    appliance-library/
    circuit-builder/
    cost-engine/
    floor-plan/
    lesson-mode/
    panelboard-engine/
    report-engine/
    safety-engine/
    topology-engine/
  migrations/
  store/
  types/
  utils/

project-docs/
  ARCHITECTURE.md
  COST_ENGINE_RULES.md
  ELECTRICAL_RULES.md
  KNOWN_ISSUES.md
  PHASE_REPORTS.md
  PROJECT_MEMORY.md
  TODO.md
  UI_QA_CHECKLIST.md

tests/
  e2e/

.github/
  workflows/
```

## Contribution Workflow

Branch model:

- `main`: stable releases
- `develop`: active integration
- `feature/*`: isolated feature development
- `experimental/*`: risky experiments

Typical flow:

```bash
git checkout develop
git checkout -b feature/my-feature
npm run verify:ci
git commit -m "type: clear description"
git push -u origin feature/my-feature
```

Open a pull request targeting `develop`.

Before merge:

- CI must pass.
- documentation must be updated.
- architecture changes must be recorded.
- visual snapshot changes must be reviewed.
- electrical logic changes must include tests.

## Governance

Project roles:

- Mehdi: Project Owner and Product Architect
- Vi: Technical Project Manager and Lead System Architect
- Codex: Senior Software Engineer responsible for implementation

Persistent engineering memory lives in:

```text
project-docs/
```

Every phase must update the project memory and phase reports.

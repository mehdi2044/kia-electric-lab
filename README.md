# Kia Electric Lab

Kia Electric Lab is a local Persian RTL educational simulator for learning the basics of 220V single-phase residential wiring. It helps a learner place components on a simple apartment plan, create circuits, choose wire and breaker sizes, calculate current and wattage, estimate cost, and receive simple Persian feedback.

## Safety Disclaimer

This software is for education only and must not be used as a professional electrical design, installation, inspection, or approval tool. Real electrical work must be designed and checked by qualified professionals under local standards.

## Features in MVP Phase 1

- Persian RTL dashboard with dark and light mode
- 100 sqm two-bedroom apartment floor plan
- Drag and drop outlets, lamps, switches, junction boxes, and appliances
- Manual circuit creation and circuit assignment
- 220V load calculation with `I = P / V`
- Wire size and breaker selection
- Educational warnings for overloads, thin wires, oversized breakers, mixed lighting/outlet circuits, kitchen circuit issues, bathroom outlet risk, and overdesign
- Material, labor, room, and circuit cost estimates
- Final educational report with safety, technical, economic, and learning scores
- Local browser storage first
- Unit tests for calculation and report logic

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- React Flow
- Zustand
- Vitest

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Then open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## Project Structure

```text
src/
  components/
  features/
    floor-plan/
    circuit-builder/
    appliance-library/
    safety-engine/
    cost-engine/
    report-engine/
  data/
  types/
  utils/
  store/
```

## Next Phases

- Add saved project import/export
- Add richer wire path drawing and length measurement
- Add Tauri desktop packaging
- Move persistence from local JSON/browser storage to SQLite
- Add more room templates and training scenarios
- Add quiz mode and guided corrections

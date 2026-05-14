# Contributing To Kia Electric Lab

Kia Electric Lab is an educational electrical simulator. It is not a professional electrical design or installation approval tool. Every contribution must preserve that boundary.

## Roles And Authority

- Mehdi is the Project Owner and Product Architect.
- Vi is the Technical Project Manager and Lead System Architect.
- Codex is the Senior Software Engineer responsible for implementation.

Codex and future contributors must follow architecture and product direction from Mehdi and Vi. Architecture decisions must not be silently changed.

## Engineering Priorities

1. Clean architecture
2. Correct electrical logic
3. Educational clarity
4. Scalability
5. UI polish
6. Performance optimization

## Required Documentation Discipline

After every completed implementation step, feature, fix, or phase, update the persistent project documentation under `project-docs/`.

At minimum, update:

- `project-docs/PROJECT_MEMORY.md` for major continuity notes.
- `project-docs/PHASE_REPORTS.md` for completed task/phase reports.
- `project-docs/ARCHITECTURE.md` for architecture changes.
- `project-docs/TODO.md` for newly discovered or completed work.
- `project-docs/KNOWN_ISSUES.md` for defects, risks, and unresolved limitations.
- `project-docs/ELECTRICAL_RULES.md` for electrical logic/rule changes.
- `project-docs/COST_ENGINE_RULES.md` for cost model changes.

Documentation files are append-first. Do not erase historical reports.

## Branch Rules

- `main`: stable releases only.
- `develop`: active integration branch.
- `feature/*`: isolated feature development.
- `experimental/*`: risky experiments, prototypes, and uncertain architecture.

Work should normally branch from `develop`. Stable releases are merged from `develop` into `main` after verification.

## Commit Rules

Use small, descriptive commits.

Recommended commit prefixes:

- `feat:` for product features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `refactor:` for internal changes without behavior change
- `chore:` for maintenance
- `build:` for tooling/build changes

Examples:

```text
feat: add circuit deletion workflow
fix: prevent duplicate appliance load undercount
docs: record phase 2 safety-engine decisions
test: cover breaker-wire compatibility warnings
```

Every commit that changes architecture, formulas, safety logic, cost logic, or persistence must include corresponding documentation updates.

## Verification Before Commit

Run the relevant checks before committing:

```bash
npm test
npm run build
```

If a check cannot be run, document the reason in the phase/task report.

## Safety Language

All UI and documentation must state or preserve the educational-only boundary where safety decisions are involved. Avoid wording that implies professional approval or installation permission.


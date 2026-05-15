# Kia Electric Lab - Cost Engine Rules

Cost rules policy: append any changes to pricing, formulas, labor assumptions, overdesign calculation, or cost allocation with timestamp and reason. Costs are educational assumptions, not quotes.

## 2026-05-14 13:05 Europe/Istanbul - Phase 1 Cost Rule Baseline

### Cost Engine Purpose

The Phase 1 cost engine teaches that electrical decisions have economic consequences. It estimates material cost, labor cost, total project cost, cost per circuit, cost per room, and unnecessary overdesign cost.

The cost engine is not a professional estimator and does not produce market quotes.

### Implemented Files

- `src/data/electricalTables.ts`
- `src/features/cost-engine/costEngine.ts`
- `src/features/cost-engine/CostPanel.tsx`
- `src/features/report-engine/reportEngine.ts`
- `src/features/report-engine/ReportPanel.tsx`

### Unit Costs

Current material and labor assumptions:

| Item | Cost |
| --- | ---: |
| Outlet | 150,000 toman |
| Switch | 120,000 toman |
| Lamp point | 180,000 toman |
| Junction box | 75,000 toman |
| Labor per point | 220,000 toman |
| Labor per meter wiring | 55,000 toman |

Current wire prices:

| Wire Size | Price Per Meter |
| ---: | ---: |
| 1.5 mm2 | 28,000 toman |
| 2.5 mm2 | 43,000 toman |
| 4 mm2 | 67,000 toman |
| 6 mm2 | 96,000 toman |

Current breaker prices:

| Breaker | Price |
| ---: | ---: |
| 6A | 180,000 toman |
| 10A | 210,000 toman |
| 16A | 260,000 toman |
| 20A | 320,000 toman |
| 25A | 390,000 toman |
| 32A | 480,000 toman |

### Circuit Cost Formula

Implemented by:

- `calculateCircuitCost(circuit, project)`

Circuit cost items:

```text
wireCost = circuit.lengthMeters x selectedWire.pricePerMeter
breakerCost = selectedBreaker.price
outletCost = outletCount x outletUnitCost
switchCost = switchCount x switchUnitCost
lampCost = lampCount x lampPointUnitCost
junctionCost = junctionCount x junctionBoxUnitCost
laborPointCost = max(1, pointCount) x laborPerPoint
laborMeterCost = circuit.lengthMeters x laborPerMeter
```

Total material cost:

```text
wireCost + breakerCost + outletCost + switchCost + lampCost + junctionCost
```

Total labor cost:

```text
laborPointCost + laborMeterCost
```

Total circuit cost:

```text
materialCost + laborCost
```

### Junction Box Estimate

Current formula:

```text
junctionCount = max(1, ceil(points.length / 4))
```

Reason:

- Provides an educational minimum junction-box cost even for small circuits.
- Keeps the model simple for MVP.

Limitation:

- Not based on real routing, box fill, or installation design.

### Point Counting

Current point source:

- Components assigned to the circuit through `componentIds`.

Point cost types:

- `outlet`
- `switch`
- `lamp`
- `junction`

Current behavior:

- Outlet cost counts components with `costPointType === 'outlet'`.
- Switch cost counts components with `costPointType === 'switch'`.
- Lamp point cost counts components with `costPointType === 'lamp'`.
- Junction components are not directly counted as separate material items except through the estimated junction count.

Recommended improvement:

- Count explicit junction boxes and estimated junction boxes separately.

### Labor Cost

Labor per point:

```text
max(1, points.length) x laborPerPoint
```

Labor per meter:

```text
circuit.lengthMeters x laborPerMeter
```

Reason:

- Even an empty/simple circuit should show a minimum labor concept.

Limitation:

- Not based on real wall type, conduit, access difficulty, city, labor market, or installation complexity.

### Overdesign Cost

Implemented by:

- `isWireOverdesigned(circuit)` in `safetyEngine.ts`
- `calculateCircuitCost(circuit, project)` in `costEngine.ts`

Trigger:

- The selected wire is larger than necessary, and at least one smaller wire size can safely carry the circuit current under the educational table.

Current formula:

```text
overdesignCost = round(selectedWire.pricePerMeter x circuit.lengthMeters x 0.25)
```

Reason:

- Gives a simple approximate penalty for choosing larger-than-needed wire.
- Intended to teach economic tradeoff, not exact savings.

Limitations:

- Does not calculate exact difference between selected wire and recommended smaller wire.
- Does not consider labor difficulty for larger cable.
- Does not recommend the exact lower-cost wire size.

Recommended improvement:

```text
recommendedWire = smallest wire with maxAmp >= circuitCurrent
overdesignCost = (selectedWire.pricePerMeter - recommendedWire.pricePerMeter) x lengthMeters
```

### Project Cost Formula

Implemented by:

- `calculateProjectCost(project)`

Project material cost:

```text
sum(circuit.materialCost)
```

Project labor cost:

```text
sum(circuit.laborCost)
```

Project total cost:

```text
materialCost + laborCost
```

Cost by circuit:

```text
costByCircuit[circuit.id] = circuit.totalCost
```

Cost by room:

```text
For each room:
  sum(costByCircuit[circuit.id] / max(1, circuit.roomIds.length))
  for circuits that include the room
```

Limitation:

- Equal division across rooms is a rough approximation.
- It should be replaced with measured wire length and point counts per room once real routing exists.

### Cost Report Outputs

The final report includes:

- Material cost
- Labor cost
- Total cost
- Cost by circuit
- Cost by room
- Wire usage by size
- Economic suggestions from overdesign warnings

### Current Cost UI

`CostPanel.tsx` displays:

- مصالح
- اجرا
- جمع کل پروژه
- Approximate overdesign extra cost when present

`ReportPanel.tsx` displays:

- Cost summary
- Circuit-level cost list
- Wire usage
- Economic suggestions

### Cost Engine Risks

- Prices are hardcoded and may be outdated.
- Currency is implicit.
- No cost profile metadata.
- No import/export of prices.
- No taxes, overhead, waste factor, contingency, or market adjustment.
- No distinction between conduit, cable, wire, boxes, panel accessories, and protective devices beyond simplified items.
- No real routing length.
- No professional quotation disclaimer inside cost panel beyond general app disclaimer.

### Recommended Cost Engine Next Steps

- Add `CostProfile` type.
- Add currency and effective date.
- Add editable cost assumptions.
- Add unit tests.
- Calculate exact overdesign delta against recommended wire.
- Add material waste percentage as an educational setting.
- Improve cost-by-room allocation after wire path implementation.
- Add clear label: "قیمت‌ها آموزشی و قابل تغییر هستند، نه قیمت قطعی بازار."

## 2026-05-14 15:00 Europe/Istanbul - Phase 4 Geometric Wire Cost Rules

### Change Summary

Cost engine now uses calculated geometric wire length when explicit wires exist for a circuit.

### New Rule

For circuits with explicit wires:

```text
WireMaterialCost = sum(geometricWireLength x wireSizePricePerMeter)
WireLaborCost = sum(geometricWireLength) x laborPerMeter
```

For circuits without explicit wires:

```text
WireMaterialCost = circuit.lengthMeters x selectedCircuitWirePricePerMeter
WireLaborCost = circuit.lengthMeters x laborPerMeter
```

### Educational Meaning

Longer routes cost more because they use more copper and more installation labor. Bad routing wastes wire and can increase voltage drop.

### Limitation

Geometry length depends on project scale (`pixelsPerMeter`). If the scale is unrealistic, cost estimates become unrealistic.

## 2026-05-14 15:25 Europe/Istanbul - Phase 5 Cost Persistence Rules

### Change Summary

Phase 5 did not change the cost formulas. It protects the persistent fields that cost calculations depend on, especially explicit wires, geometric route points, manual length overrides, panelboard assignments, and scale.

### Persisted Cost Inputs Protected By Migration

- `circuits[].wireSizeMm2`
- `circuits[].breakerAmp`
- `circuits[].lengthMeters`
- `wires[].wireSizeMm2`
- `wires[].lengthMeters`
- `wires[].routePoints`
- `wires[].manualLengthOverride`
- `pixelsPerMeter`
- `panelboard.breakers[].amp`
- `panelboard.breakers[].circuitId`

### Cost Rule CR-010 - Migration Must Preserve Cost-Relevant Geometry

Trigger:

- A project from Phase 3 or Phase 4 contains explicit wire records.

Rule:

- Migration must preserve every explicit wire, route point, wire size, manual length override, and circuit assignment when structurally valid.

Reason:

- Losing wire geometry would silently change material cost, labor cost, voltage drop estimates, and educational feedback.

### Cost Rule CR-011 - Invalid Scale Must Not Produce Silent Cost Output

Trigger:

- `pixelsPerMeter` is missing or invalid.

Rule:

- Migration should normalize a missing scale to the educational default.
- Validation should reject impossible scale values.

Reason:

- Wire cost from geometry is only meaningful when scale conversion is valid.

### Future Cost Persistence Work

- Add editable cost profiles with versioned price tables.
- Store cost profile effective date and currency.
- Add migration for future regional price presets.
- Add checksum to exported project/cost JSON.

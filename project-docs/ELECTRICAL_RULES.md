# Kia Electric Lab - Electrical Rules

Electrical rules policy: this file documents implemented educational rules and assumptions. Any change to formulas, thresholds, wire tables, breaker tables, or safety warning logic must be appended with a timestamp and reason.

## 2026-05-14 13:05 Europe/Istanbul - Phase 1 Electrical Rule Baseline

### Safety Disclaimer

Kia Electric Lab is an educational simulator only. It must not be used as a professional electrical design, installation, inspection, permitting, or approval tool. The rules below are simplified teaching rules, not code-compliance rules.

### Electrical System Model

Current model:

- Residential single-phase voltage.
- Default voltage: 220V.
- Default main household breaker: 25A.
- Approximate maximum whole-home power: `220V x 25A = 5500W`.
- Appliances are treated as parallel loads.
- Total power is the sum of appliance watts.
- Current is calculated from power and voltage.

Not modeled:

- Three-phase systems.
- Neutral loading details.
- Protective earth.
- RCD/GFCI/RCCB behavior.
- Short circuit current.
- Fault loop impedance.
- Cable installation method.
- Thermal derating.
- Ambient temperature.
- Conduit fill.
- Diversity factor.
- Motor/compressor inrush current.
- Local electrical code.

### Implemented Formulas

#### Current

Formula:

```text
I = P / V
Ampere = Watt / Volt
```

Implemented by:

- `calculateCurrent(watt, voltage)` in `src/features/safety-engine/electricalMath.ts`

Behavior:

- If voltage is less than or equal to zero, returns `0`.
- Otherwise returns `watt / voltage`.

#### Power

Formula:

```text
P = V x I
Watt = Volt x Ampere
```

Implemented by:

- `calculatePower(voltage, ampere)`

#### Resistance

Formula:

```text
R = V / I
Ohm = Volt / Ampere
```

Implemented by:

- `calculateResistance(voltage, ampere)`

Behavior:

- If ampere is less than or equal to zero, returns `0`.
- Otherwise returns `voltage / ampere`.

#### Total Parallel Load

Formula:

```text
TotalPower = sum(appliance watts)
TotalCurrent = TotalPower / 220
```

Implemented by:

- `calculateTotalLoad(loads, voltage)`
- `calculateCircuitLoad(circuit, voltage)`
- `getProjectLoads(project)`

#### Approximate Voltage Drop

Educational formula:

```text
VoltageDrop = Current x CableResistance
```

Current implementation:

```text
VoltageDrop = totalCurrent x resistanceOhmPerMeter x lengthMeters
```

Implemented by:

- `calculateVoltageDrop(circuit, voltage)`

Educational threshold:

- Warning if voltage drop is greater than 4 percent of 220V and circuit wattage is greater than zero.
- 4 percent of 220V = 8.8V.

Important limitation:

- This is a simplified one-way educational approximation. It does not model full conductor loop length, installation method, temperature, or code-specific voltage-drop practices.

### Appliance Table

Implemented appliances:

| Appliance | Persian Name | Power | Voltage | Category |
| --- | --- | ---: | ---: | --- |
| Refrigerator | یخچال | 400W | 220V | stable |
| Dishwasher | ماشین ظرف‌شویی | 1800W | 220V | heavy |
| Washing machine | ماشین لباس‌شویی | 2000W | 220V | heavy |
| Oven | فر برقی | 2500W | 220V | heavy |
| Electric kettle | کتری برقی | 2000W | 220V | heavy |
| Microwave | مایکروویو | 1200W | 220V | small |
| TV | تلویزیون | 150W | 220V | small |
| Computer | کامپیوتر | 500W | 220V | small |
| Air conditioner | کولر گازی | 2200W | 220V | heavy |
| Ceiling LED lamp | چراغ سقفی LED | 20W | 220V | light |
| Iron | اتو | 2200W | 220V | heavy |
| Vacuum cleaner | جاروبرقی | 1600W | 220V | small |

### Wire Size Table

Simplified educational model:

| Wire Size | Educational Limit | Intended Use | Price/Meter | Resistance/Meter |
| ---: | ---: | --- | ---: | ---: |
| 1.5 mm2 | 10A | Lighting | 28,000 toman | 0.0121 ohm/m |
| 2.5 mm2 | 16A | Outlets | 43,000 toman | 0.0074 ohm/m |
| 4 mm2 | 25A | Heavier circuits | 67,000 toman | 0.0046 ohm/m |
| 6 mm2 | 32A | Feeder/heavy loads | 96,000 toman | 0.0031 ohm/m |

Rule:

- Circuit current must be less than or equal to selected wire educational limit.

Implemented by:

- `validateWireCapacity(circuit)`

Warning text:

```text
این سیم برای این مقدار جریان مناسب نیست. ممکن است در مصرف طولانی‌مدت گرم شود و خطر آتش‌سوزی ایجاد کند.
```

### Breaker Table

Simplified educational model:

| Breaker | Intended Use |
| ---: | --- |
| 6A | small lighting |
| 10A | lighting circuits |
| 16A | outlet circuits |
| 20A | heavier outlet circuits |
| 25A | main/home feeder or heavy circuit |
| 32A | advanced/heavy educational case |

Rule:

- Circuit current should not exceed breaker rating.
- Breaker rating should not exceed selected wire educational current capacity.

Implemented by:

- Direct check in `generateSafetyWarnings`
- `validateBreakerWireCompatibility(circuit)`

Breaker too large warning text:

```text
فیوز باید قبل از داغ شدن سیم مدار را قطع کند. این فیوز برای این سیم بیش از حد بزرگ است و از سیم محافظت کافی نمی‌کند.
```

### Implemented Safety Rules

#### ER-001 - Whole Home Overload

Trigger:

- `project total current > project.mainBreakerAmp`

Default:

- Main breaker is 25A.

Severity:

- danger

Educational meaning:

- Total simultaneous load is higher than the household limit.

#### ER-002 - Circuit Breaker Overload

Trigger:

- `circuit current > circuit.breakerAmp`

Severity:

- danger

Educational meaning:

- The circuit load exceeds the selected breaker capacity.

#### ER-003 - Wire Too Thin

Trigger:

- `circuit current > selected wire maxAmp`

Severity:

- danger

Educational meaning:

- Wire may overheat during sustained use.

#### ER-004 - Breaker Too Large For Wire

Trigger:

- `circuit.breakerAmp > selected wire maxAmp`

Severity:

- danger

Educational meaning:

- Breaker may not protect the wire before the wire overheats.

#### ER-005 - Multiple Heavy Appliances On One Circuit

Trigger:

- More than one appliance on the circuit has category `heavy`.

Severity:

- warning

Educational meaning:

- High-load appliances should preferably be separated.

#### ER-006 - Lighting And Outlet Loads Mixed

Trigger:

- Circuit includes at least one `light` appliance and at least one non-light appliance.

Severity:

- warning

Educational meaning:

- Lighting and outlet circuits are clearer and safer to learn/debug when separated.

#### ER-007 - Voltage Drop Warning

Trigger:

- `calculateVoltageDrop(circuit) > project.voltage * 0.04`
- Circuit wattage must be greater than zero.

Severity:

- warning

Educational meaning:

- Long/high-current circuits may lose noticeable voltage.

#### ER-008 - Wire Overdesign

Trigger:

- A smaller wire size exists that can still carry the circuit current.

Severity:

- info

Educational meaning:

- Technically works, but may be unnecessarily expensive.

Warning text:

```text
از نظر فنی کار می‌کند، اما برای این مصرف بیش از حد گران است. می‌توانی با سیم مناسب‌تر هزینه را کاهش بدهی.
```

#### ER-009 - Refrigerator Stable Circuit

Trigger:

- No fridge circuit exists, or fridge circuit has more than two appliances.

Severity:

- warning

Educational meaning:

- Refrigerator should be on a stable or dedicated circuit.

#### ER-010 - Kitchen Too Few Circuits

Trigger:

- Fewer than two circuits include room ID `kitchen`.

Severity:

- warning

Educational meaning:

- Kitchen usually has multiple heavy appliances and benefits from multiple circuits.

#### ER-011 - Bathroom Outlet Risk

Trigger:

- Any component with room ID `bath` and type `outlet`.

Severity:

- danger

Educational meaning:

- Bathroom is a wet/high-risk area; real installations need professional protection and code checks.

#### ER-012 - Unknown Appliance

Trigger:

- Circuit contains appliance ID not found in appliance library.

Severity:

- info

Educational meaning:

- Unknown appliance is ignored by load calculation and should be corrected.

### Scoring Rules

Implemented in:

- `generateProjectScore(project)`

Safety score:

```text
100 - dangerCount * 22 - warningCount * 9 - infoCount * 2
```

Technical score:

```text
65 + configuredCircuits * 8 + kitchenSeparationBonus - dangerCount * 15 - warningCount * 5
```

Where:

- `kitchenSeparationBonus = 10` if kitchen has at least two circuits.

Economic score:

```text
100 - round(overdesignCost / 100000) * 4 - infoCount * 6 - dangerCount * 5
```

Learning score:

```text
if project has circuits:
  70 + min(20, componentCount * 2) + min(10, circuitCount * 2)
else:
  35
```

All scores are clamped to 0-100.

### Electrical Rule Risks

- Current rules are useful for teaching but not enough for real installation design.
- Wire-size limits are simplified and do not include derating.
- Heavy appliance categories are hardcoded.
- Refrigerator stability rule is approximate.
- Bathroom rule is intentionally broad.
- Voltage-drop calculation is simplified.
- Duplicate appliances are not accurately modeled due to appliance ID deduplication.

### Recommended Electrical Rule Next Steps

- Add tests for each rule ID.
- Add `RuleResult` metadata with formula, trigger, and correction.
- Add `LoadInstance` model.
- Add protective-device educational module.
- Add rule-profile abstraction.
- Add clear UI labels that every rule is educational and simplified.

## 2026-05-14 13:40 Europe/Istanbul - Phase 2 Topology Electrical Rules

### New Electrical Concept

The simulator now models electrical connectivity as a graph of terminals and wires.

### Terminal Model

Implemented terminal roles:

- `phase-source`
- `neutral-source`
- `breaker-line`
- `breaker-load`
- `switch-line`
- `switch-load`
- `phase`
- `neutral`
- `junction`

### Wire Model

Each wire now has:

- ID
- Circuit ID
- From terminal
- To terminal
- Length in meters
- Wire size in mm2
- Resistance from wire table
- Educational ampacity from wire table

### New Topology Rules

#### ER-013 - Breaker Must Receive Phase

Trigger:

- Panel phase cannot reach breaker line input for a circuit.

Educational explanation:

- The breaker must sit in the phase path before loads.

#### ER-014 - Load Phase Must Be Connected

Trigger:

- Breaker load output cannot reach a load phase terminal.

Educational explanation:

- A consumer cannot operate if phase never reaches it.

#### ER-015 - Load Neutral Must Be Connected

Trigger:

- Panel neutral cannot reach a load neutral terminal.

Educational explanation:

- Current needs a return path; without neutral, the loop is incomplete.

#### ER-016 - Incomplete Loop

Trigger:

- A load is missing phase or neutral connectivity.

Educational explanation:

- A circuit needs a complete path out and back.

#### ER-017 - Invalid Switch Wiring

Trigger:

- In a lighting circuit, switch output does not reach lamp phase.

Educational explanation:

- A switch should control the phase feeding the lamp.

#### ER-018 - Direct Phase-Neutral Short Circuit

Trigger:

- A wire directly connects terminals classified as phase and neutral roles.

Educational explanation:

- This creates a short circuit and is dangerous.

#### ER-019 - Topology Breaker Overload

Trigger:

- Sum of connected graph load currents exceeds breaker rating.

Educational explanation:

- The actual connected branches demand more current than the breaker rating.

#### ER-020 - Topology Wire Overload

Trigger:

- Propagated current through a wire exceeds that wire's educational ampacity.

Educational explanation:

- That wire segment may overheat under sustained load.

### Current Propagation Rule

For each connected load:

```text
LoadCurrent = LoadWatts / ProjectVoltage
```

For each circuit:

```text
CircuitCurrent = sum(connected load currents)
```

For each wire:

```text
WireCurrent = sum(downstream connected load currents)
```

For each wire voltage drop:

```text
WireVoltageDrop = WireCurrent x WireResistancePerMeter x WireLengthMeters
```

### Important Limitation

The current propagation is deterministic and graph-based, but still educational. It assumes simplified radial/branch behavior and does not solve arbitrary analog electrical networks.

## 2026-05-14 14:20 Europe/Istanbul - Phase 3 Terminal Wire Rules

### New Wire Types

Implemented educational wire kinds:

- `phase`: فاز
- `neutral`: نول
- `earth`: ارت آموزشی
- `switched-phase`: فاز برگشتی

### Earth Placeholder

Phase 3 introduces earth/PE terminals as placeholders:

- Panel has `earth-source`.
- Outlet has `earth`.

Important:

- This is not a full grounding simulation.
- It is a teaching placeholder for future protective earth lessons.

### Terminal Connection Rules

#### ER-021 - Unknown Terminal Ref

Trigger:

- Wire endpoint references a terminal not present in the terminal catalog/graph.

Result:

- Wire creation rejected.

#### ER-022 - Same Terminal Wire

Trigger:

- Wire `from` and `to` are the same terminal.

Result:

- Wire creation rejected.

#### ER-023 - Direct Phase-Neutral UI Rejection

Trigger:

- User attempts to connect phase-class terminal directly to neutral-class terminal.

Result:

- Wire creation rejected.

Persian explanation:

```text
این اتصال کوتاه است. فاز و نول نباید مستقیم با یک سیم به هم وصل شوند.
```

#### ER-024 - Phase-Earth UI Rejection

Trigger:

- User attempts to connect phase-class terminal directly to earth-class terminal.

Result:

- Wire creation rejected.

#### ER-025 - Neutral-Earth Educational Separation

Trigger:

- User attempts to connect neutral-class terminal to earth-class terminal.

Result:

- Rejected/warned in the simplified model.

Reason:

- The simulator keeps neutral and earth separate for beginner clarity until a real grounding model exists.

### Wire Inspection Rules

The wire inspector displays:

- from component/terminal
- to component/terminal
- wire kind
- size
- length
- approximate resistance
- voltage drop
- current
- safety status
- cost

### Explicit Wires As Source Of Truth

When `ElectricalProject.wires` has entries:

- Topology graph uses explicit wires.
- Generated topology is bypassed.
- Partial wiring can produce open-circuit warnings.

When `ElectricalProject.wires` is empty:

- Generated topology fallback remains for backward compatibility.

## 2026-05-14 15:00 Europe/Istanbul - Phase 4 Geometry And Panelboard Rules

### Geometric Wire Length

Each explicit wire can now have:

- start terminal coordinate
- optional route points
- end terminal coordinate
- calculated route length
- optional manual override

Formula:

```text
RouteLengthPixels = sum(distance(pointN, pointN+1))
RouteLengthMeters = RouteLengthPixels / pixelsPerMeter
```

If `manualLengthOverride` is present and greater than zero, it is used as an advanced educational override.

### Panelboard Rules

#### ER-026 - Circuit Without Breaker

Trigger:

- A circuit is not assigned to any panelboard breaker slot.

Meaning:

- Every circuit should have a breaker in the panel for protection and organization.

#### ER-027 - Breaker Without Circuit

Trigger:

- A panelboard breaker slot has no circuit assignment.

Meaning:

- Empty breakers should be labeled or removed for a clear educational panel.

#### ER-028 - Panel Breaker Overload

Trigger:

- Circuit current exceeds assigned panelboard breaker amp rating.

#### ER-029 - Panel Breaker/Wire Incompatibility

Trigger:

- Assigned breaker amp rating exceeds selected circuit wire capacity.

Meaning:

- The breaker may fail to protect the wire before overheating.

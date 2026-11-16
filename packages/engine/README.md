# `@evo-aim/engine`

3D training engine skeleton for **EVO-AIM-CS2** (`Apache-2.0`).

## Responsibilities

- **Layer 1:** Documented empty skeleton verifying workspace boundaries (`@evo-aim/core` and `@evo-aim/data` only). No WebGL2, Three.js, or Pointer Lock code is implemented in Layer 1.
- **Layer 4 (`4a/4b/4c`):** Raw input capture (`unadjustedMovement`, `getCoalescedEvents()`), 240 Hz fixed-timestep simulation loop, FPS-invariant sub-frame hit registration (`QB-06`), Three.js `InstancedMesh` renderer, hardware presets, and Dynamic Resolution Scaling (DRS).

## Strict Architectural Restrictions

- Allowed dependencies: `@evo-aim/core`, `@evo-aim/data` (and `three` starting in Layer 4).
- **Strictly forbidden:** importing `@evo-aim/ui`, `@evo-aim/desktop`, `react`, `electron`, Node.js built-ins, `Math.random()`, or `Date.now()`.

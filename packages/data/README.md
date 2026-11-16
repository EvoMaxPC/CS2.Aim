# `@evo-aim/data`

Typed data catalogs, Zod validation schemas, and provenance metadata for **EVO-AIM-CS2** (`Apache-2.0`).

## Responsibilities

- Layer 1: Package wiring and provenance-backed catalog entry helper (`CatalogEntry<T>`).
- Future layers: Scenarios (Layer 5), CS2 weapons & recoil patterns (Layer 6), scientific literature corpus (Layer 10), and `.evoaim` exchange container schemas (Layer 14).

## Strict Architectural Restrictions

- May depend **only** on `@evo-aim/core` and `zod`.
- Forbidden from importing DOM, Node.js, Electron, Three.js, React, `@evo-aim/engine`, `@evo-aim/ui`, or `@evo-aim/desktop`.
- Every external data record added in future layers MUST satisfy `DataProvenanceSchema` (`QB-13`).

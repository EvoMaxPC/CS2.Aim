# `@evo-aim/core`

Pure, deterministic domain types and foundations for **EVO-AIM-CS2** (`Apache-2.0`).

## Responsibilities (Layer 1)

- Discriminated `Result<T, E>` monadic helpers (`ok`, `err`, `isOk`, `isErr`, `mapResult`, `mapError`, `unwrapOr`).
- Verifiable data provenance schema and types (`DataProvenance`, `DataProvenanceSchema`) enforcing [`docs/DATA_POLICY.md`](../../docs/DATA_POLICY.md).
- Typed `Logger` contract (`LogLevel`, `LogRecord`, `Logger`).
- Shared IPC channel registry and strict Zod input/output contracts (`app:getInfo`, `diag:nativeModules`).

## Strict Architectural Restrictions

- **Zero DOM, Node.js, Electron, Three.js, or React imports.** Enforced by `tsconfig.json` (`lib: ["ES2022"]`, `types: []`), ESLint, and `dependency-cruiser`.
- **Allowed runtime dependency:** `zod` only.
- **Determinism:** `Math.random()` and `Date.now()` are strictly forbidden.
- **Coverage threshold:** $\ge 95\%$ lines, functions, branches, and statements (`QB-11`).

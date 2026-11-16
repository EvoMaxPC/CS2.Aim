# Third-Party Notices

- **Project:** EVO-AIM-CS2
- **License:** Apache-2.0
- **Status:** Active Inventory (Layer 1 — Skeleton & Tooling)
- **Automated Verification:** `pnpm licenses:check` (`tools/check-licenses/cli.ts`) enforcing [`docs/adr/0014-open-source-policy.md`](./docs/adr/0014-open-source-policy.md)

---

## 1. License Compliance Summary (`pnpm licenses list --json`)

Across the locked Layer 1 dependency graph (`502` resolved package entries on `linux-x64` via `pnpm@12.18.0`):

| SPDX Expression    | Package Count | Policy Classification (ADR-0014)                                                   |
| ------------------ | ------------: | ---------------------------------------------------------------------------------- |
| `MIT`              |           404 | Permissive (Allowed)                                                               |
| `ISC`              |            33 | Permissive (Allowed)                                                               |
| `Apache-2.0`       |            25 | Permissive (Allowed)                                                               |
| `BSD-2-Clause`     |            11 | Permissive (Allowed)                                                               |
| `BSD-3-Clause`     |            11 | Permissive (Allowed)                                                               |
| `BlueOak-1.0.0`    |             9 | Permissive (Allowed)                                                               |
| `MPL-2.0`          |             2 | File-level Copyleft — Explicitly Reviewed Build-Time Exception (`exceptions.json`) |
| `(MIT OR CC0-1.0)` |             1 | Dual-licensed Permissive (Allowed under MIT)                                       |
| `(WTFPL OR MIT)`   |             1 | Dual-licensed Permissive (Allowed under MIT)                                       |
| `0BSD`             |             1 | Permissive (Allowed)                                                               |
| `CC-BY-4.0`        |             1 | Attribution Content License (Allowed)                                              |
| `Python-2.0`       |             1 | Permissive (Allowed)                                                               |
| `WTFPL`            |             1 | Public-domain-equivalent (Allowed)                                                 |
| `WTFPL OR ISC`     |             1 | Dual-licensed Permissive (Allowed under ISC)                                       |

Zero `GPL`, `AGPL`, `LGPL`, `SSPL`, proprietary, or unclassified licenses exist in the dependency tree.

---

## 2. Direct Runtime & Packaging Dependencies

| Package            | Pinned Version | License | Role in EVO-AIM-CS2                                                                 | Upstream / Copyright                                                                       |
| ------------------ | -------------- | ------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `electron`         | `45.3.2`       | `MIT`   | Desktop runtime shell (Chromium `156.0.8078.100`, Node.js `24.22.2`)                | Copyright (c) Electron contributors & GitHub Inc. (`https://github.com/electron/electron`) |
| `better-sqlite3`   | `13.1.1`       | `MIT`   | Native Node-API v10 SQLite3 engine (`SQLite` public domain C library)               | Copyright (c) Joshua Wise (`https://github.com/WiseLibs/better-sqlite3`)                   |
| `react`            | `19.3.1`       | `MIT`   | Declarative UI component library                                                    | Copyright (c) Meta Platforms, Inc. and affiliates (`https://github.com/facebook/react`)    |
| `react-dom`        | `19.3.1`       | `MIT`   | DOM renderer for React                                                              | Copyright (c) Meta Platforms, Inc. and affiliates (`https://github.com/facebook/react`)    |
| `react-router-dom` | `7.18.5`       | `MIT`   | Client-side routing (`HashRouter` over `app://evoaim`)                              | Copyright (c) Remix Software Inc. (`https://github.com/remix-run/react-router`)            |
| `zustand`          | `5.1.0`        | `MIT`   | Lightweight UI shell state management                                               | Copyright (c) Paul Henschel & contributors (`https://github.com/pmndrs/zustand`)           |
| `zod`              | `4.6.7`        | `MIT`   | Runtime schema validation across `@evo-aim/core`, `@evo-aim/data`, and IPC boundary | Copyright (c) Colin McDonnell (`https://github.com/colinhacks/zod`)                        |

---

## 3. Direct Build, Quality & Verification Tooling (`devDependencies`)

| Package                                                | Pinned Version       | License      | Role                                                               |
| ------------------------------------------------------ | -------------------- | ------------ | ------------------------------------------------------------------ |
| `typescript`                                           | `6.0.3`              | `Apache-2.0` | Strict static type-checker                                         |
| `vite`                                                 | `8.3.8`              | `MIT`        | Bundler and development server                                     |
| `@vitejs/plugin-react`                                 | `6.3.0`              | `MIT`        | React integration for Vite / Vitest                                |
| `electron-vite`                                        | `6.0.0`              | `MIT`        | Multi-target bundler (`main`, `preload`, `renderer`)               |
| `electron-builder`                                     | `26.18.0`            | `MIT`        | Cross-platform desktop packager (`NSIS`, `AppImage`, `deb`, `dmg`) |
| `@electron/fuses`                                      | `2.1.3`              | `MIT`        | Binary Electron Fuses hardening (`afterPack`)                      |
| `@electron/rebuild`                                    | `4.2.1`              | `MIT`        | Native module rebuild helper fallback                              |
| `tailwindcss` / `@tailwindcss/vite`                    | `4.3.5`              | `MIT`        | Design-token CSS compiler                                          |
| `vitest` / `@vitest/coverage-v8`                       | `5.1.0`              | `MIT`        | Multi-project unit & integration test runner + V8 coverage         |
| `fast-check`                                           | `4.10.2`             | `MIT`        | Property-based testing framework (`@evo-aim/core`)                 |
| `happy-dom`                                            | `21.0.4`             | `MIT`        | Lightweight DOM environment for component tests                    |
| `@testing-library/react` / `@testing-library/jest-dom` | `16.3.3` / `7.0.1`   | `MIT`        | Accessible React component testing utilities                       |
| `@playwright/test` / `playwright`                      | `1.65.0`             | `Apache-2.0` | End-to-end Electron automation & live security audit               |
| `eslint` / `@eslint/js`                                | `10.14.0` / `10.0.1` | `MIT`        | Static AST linter                                                  |
| `typescript-eslint`                                    | `8.72.2`             | `MIT`        | Type-aware TypeScript lint rules                                   |
| `eslint-plugin-react-hooks`                            | `7.1.1`              | `MIT`        | React Hooks static verification                                    |
| `eslint-config-prettier` / `prettier`                  | `10.1.8` / `3.10.1`  | `MIT`        | Deterministic code formatting                                      |
| `dependency-cruiser`                                   | `18.7.2`             | `MIT`        | Architectural DAG and OS-boundary enforcement                      |
| `husky` / `lint-staged`                                | `9.1.7` / `17.6.0`   | `MIT`        | Local Git hook orchestration                                       |
| `@commitlint/cli` / `@commitlint/config-conventional`  | `21.2.4`             | `MIT`        | Conventional Commits verification                                  |
| `tsx`                                                  | `4.23.15`            | `MIT`        | TypeScript execution engine for `/tools/*`                         |

---

## 4. Reviewed `MPL-2.0` Exceptions (`tools/check-licenses/exceptions.json`)

- **`lightningcss@1.33.0`** and platform binary packages (`lightningcss-linux-x64-gnu`, `lightningcss-win32-x64-msvc`, `lightningcss-darwin-arm64`, `lightningcss-darwin-x64`) — Licensed under `MPL-2.0` (Parcel Contributors). Used strictly as an unmodified build-time CSS compiler transitive dependency of `@tailwindcss/vite@4.3.5`; not modified and not bundled inside distributed EVO-AIM-CS2 application binaries.

---

## 5. Documentation & Governance Attributions

- **Contributor Covenant Code of Conduct v2.1** (`CODE_OF_CONDUCT.md`): Adapted from the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Full bundled Chromium/Electron/SQLite runtime license texts will be emitted into installer resources in **Layer 17** (`electron-builder` license bundling).

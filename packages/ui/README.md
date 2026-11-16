# `@evo-aim/ui`

Accessible, dark-first React design system primitives for **EVO-AIM-CS2** (`Apache-2.0`).

## Responsibilities (Layer 1)

- Reusable, keyboard-accessible primitives (`Button`, `Card`, `SidebarLink`, `PageHeader`) decoupled from Electron and WebGL2.

## Strict Architectural Restrictions

- Allowed dependencies: `@evo-aim/core`, `@evo-aim/data`, `react`, `react-dom`.
- **Strictly forbidden:** importing `@evo-aim/engine`, `@evo-aim/desktop`, `electron`, or Node.js modules.

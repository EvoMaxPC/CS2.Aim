# `@evo-aim/desktop`

Electron desktop shell for **EVO-AIM-CS2** (`Apache-2.0`).

## Structure

- `src/main/`: Hardened Electron main process (`app://` custom protocol, CSP headers, navigation/permission lockdown, single-instance lock, typed IPC handlers, structured JSONL logger with PII/home-path sanitization, and `PlatformAdapter` implementations in `src/main/platform/{win32,linux,darwin}`).
- `src/preload/`: Minimal sandboxed `contextBridge` bundle exposing only `window.evoaim`.
- `src/renderer/`: Dark-themed React + React Router (`HashRouter`) + Zustand + Tailwind v4 shell with 7 accessible skeleton views and diagnostics in Settings (`SPIKE-4`).
- `src/shared/`: Pure contract types shared across `main`, `preload`, and `renderer`.

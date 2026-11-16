# ADR-0001: Stack de Escritorio con Electron + TypeScript frente a Alternativas

- **Estado:** Accepted (sujeto a validación empírica en `SPIKE-1`, `SPIKE-2` y `SPIKE-5`)
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Mantenedor Principal

## Contexto y Problema

Necesitamos construir **EVO-AIM-CS2**, una aplicación de escritorio multiplataforma (Windows Tier 1, Linux Tier 2, macOS Tier 3) que combina dos mundos exigentes:

1. Un motor de entrenamiento 3D con input crudo de ratón preciso (`unadjustedMovement`, hasta 8000 Hz), WebGL2 determinista y baja latencia.
2. Una interfaz analítica rica (gráficas cinemáticas, editor de escenarios, biblioteca científica, internacionalización) y acceso controlado al sistema de archivos local (SQLite, detección de configs de CS2 y receptor HTTP loopback de GSI).

## Opciones Consideradas

| Criterio                                                              | **Opción A: Electron + TS + Vite + React + Three.js**                                        | **Opción B: Tauri v2 (Rust + WebView del SO)**                                                                                                                                                    | **Opción C: Nativo puro (Rust + `wgpu`/`winit` + UI nativa/egui)**                                                                                      | **Opción D: Aplicación Web pura (PWA en navegador)**                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Consistencia de WebGL2 y Pointer Lock entre SO**                    | **Muy alta:** empaqueta una versión exacta y conocida de Chromium en Windows, Linux y macOS. | **Baja/Media:** usa WebView2 en Windows, pero **WebKitGTK** en Linux y WebKit en macOS, con marcadas diferencias en soporte de `unadjustedMovement`, `getCoalescedEvents()` y rendimiento WebGL2. | **Muy alta:** acceso directo a APIs gráficas y HID nativas (`WM_INPUT`, `libinput`).                                                                    | **Media:** depende del navegador, extensiones instaladas y pestañas abiertas del usuario. |
| **Peso en disco y RAM base (`R12`)**                                  | **Alto** (incluye Chromium + Node; requiere control estricto en Tier L).                     | **Bajo** (reutiliza WebView del sistema).                                                                                                                                                         | **Muy bajo** (binario compacto y consumo mínimo).                                                                                                       | **Nulo** en instalador, pero sujeto al navegador.                                         |
| **Velocidad de desarrollo de UI analítica compleja, gráficas e i18n** | **Muy alta** (ecosistema React + Tailwind + TypeScript compartido en todo el monorepo).      | **Alta** en frontend, pero puente IPC dual TS/Rust y depuración heterogénea en Linux WebKitGTK.                                                                                                   | **Baja:** construir tablas accesibles, gráficas ricas, i18n y formularios complejos en UI inmediata/nativa multiplica por 3–4x el tiempo de desarrollo. | **Muy alta**.                                                                             |
| **Integración local con CS2 (`.cfg`, GSI loopback, SQLite)**          | **Completa** vía proceso Main/Utility de Electron.                                           | **Completa** vía backend Rust.                                                                                                                                                                    | **Completa** en Rust.                                                                                                                                   | **Imposible / Muy limitada** por sandbox del navegador.                                   |

## Decisión

Elegimos la **Opción A: Electron + TypeScript strict + Vite + React + Zustand + Tailwind + Three.js (WebGL2)**, estructurando el código de forma que toda la matemática pura (`@evo-aim/core`) y los catálogos (`@evo-aim/data`) sean 100 % independientes de Electron.

La razón decisiva frente a Tauri es el **soporte de Linux (Tier 2) y la predictibilidad del input**: en un entrenador de puntería competitivo no podemos depender de WebKitGTK en Linux frente a Chromium/Blink en Windows para APIs críticas como `requestPointerLock({ unadjustedMovement: true })` y `getCoalescedEvents()`.

## Consecuencias

- **Positivas:** un único motor de renderizado y JS (Chromium/V8) predecible en Windows y Linux; máxima productividad para analítica, editor e i18n; un solo lenguaje tipado estricto en todo el repositorio.
- **Negativas / Riesgos asumidos:** mayor tamaño de instalador y huella base de RAM (`R12`) y necesidad de demostrar que Chromium cumple el _frame pacing_ y conservación de _counts_ (`R1`, `R2`, `R3`).
- **Salvaguarda arquitectónica (Plan B):** si `SPIKE-1`, `SPIKE-2` o `SPIKE-5` demostrasen una limitación insalvable de Chromium/Electron en input crudo o en equipos Tier L, migraremos el shell/renderer a **Opción C (Rust + `wgpu`)** reutilizando sin reescribir `@evo-aim/core` y `@evo-aim/data`.

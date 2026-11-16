# PROGRESS.md — Seguimiento Maestro de Avance por Capas

- **Propósito:** Fuente única de verdad sobre el estado de ejecución de las Capas 0–17, Spikes técnicos (`SPIKE-1`..`SPIKE-6`) y Deuda Técnica de EVO-AIM-CS2.
- **Fecha de última actualización:** 2026-11-13
- **Versión:** 1.1.0
- **Estado actual del proyecto:** **Capa 1 completada en código y verificada en Linux Node/Vite** (`layer-1-done` pendiente de PR/CI y checklist `docs/VERIFY_ON_WINDOWS.md`) — Próxima capa: **Capa 2 (Núcleo Matemático, Sensibilidad, FOV y PRNG)**

---

## Resumen Ejecutivo de Capas

| Capa   | Nombre                                                       | Estado                                      | Fecha cierre | Rama                     | PR / Tag                                                        |
| ------ | ------------------------------------------------------------ | ------------------------------------------- | ------------ | ------------------------ | --------------------------------------------------------------- |
| **0**  | Fundamentos, arquitectura y gobernanza OSS                   | **Completada**                              | 2026-11-13   | `arena/604fae3a-cs2-aim` | `layer-0-done`                                                  |
| **1**  | Esqueleto monorepo, tooling, CI multi-OS y línea base        | **Completada (pendiente check Windows/CI)** | 2026-11-13   | `arena/604fae3a-cs2-aim` | PR `feat(infra): layer 1 skeleton and tooling` / `layer-1-done` |
| **2**  | Núcleo matemático, sensibilidad, FOV y PRNG                  | Pendiente                                   | —            | —                        | —                                                               |
| **3**  | Persistencia SQLite + Drizzle, IPC y perfiles                | Pendiente                                   | —            | —                        | —                                                               |
| **4**  | Motor 3D, input sub-frame e invarianza FPS (`4a/4b/4c`)      | Pendiente                                   | —            | —                        | —                                                               |
| **5**  | Escenarios data-driven, spawners y bots                      | Pendiente                                   | —            | —                        | —                                                               |
| **6**  | Armas CS2, dispersión y recoil (`6a/6b`)                     | Pendiente                                   | —            | —                        | —                                                               |
| **7**  | Telemetría profunda y analítica explicativa                  | Pendiente                                   | —            | —                        | —                                                               |
| **8**  | Rutinas y planificador adaptativo                            | Pendiente                                   | —            | —                        | —                                                               |
| **9**  | Herramienta de calibración 360° y _Sensitivity Finder_       | Pendiente                                   | —            | —                        | —                                                               |
| **10** | Módulo científico verificable (`10a/10b`)                    | Pendiente                                   | —            | —                        | —                                                               |
| **11** | Ejercicios tácticos específicos de CS2 (`11a/11b`)           | Pendiente                                   | —            | —                        | —                                                               |
| **12** | Benchmarks oficiales, progresión y gamificación honesta      | Pendiente                                   | —            | —                        | —                                                               |
| **13** | UI/UX, onboarding 10 s, accesibilidad e i18n comunitario     | Pendiente                                   | —            | —                        | —                                                               |
| **14** | Editor de escenarios, formato `.evoaim` y replays            | Pendiente                                   | —            | —                        | —                                                               |
| **15** | Optimización por Tiers (L/M/H), memoria y latencia           | Pendiente                                   | —            | —                        | —                                                               |
| **16** | Integraciones oficiales CS2 multiplataforma (`GSI` y `.cfg`) | Pendiente                                   | —            | —                        | —                                                               |
| **17** | Empaquetado multi-OS, QA final, licencias y GitHub Releases  | Pendiente                                   | —            | —                        | —                                                               |

---

## Checklist Detallada por Capa

### Capa 0 — Fundamentos, Arquitectura y Gobernanza Open Source (`Completada`)

- **Fecha:** 2026-11-13 · **Rama:** `arena/604fae3a-cs2-aim` · **PR:** _Pendiente de abrir tras push_
- **Notas:** Ejecutada aplicando íntegramente el diseño fundacional más la Enmienda Obligatoria (`EVO-AIM-CS2`, licencia Apache-2.0, soporte multiplataforma Windows/Linux/macOS y escalabilidad de hardware Tiers L/M/H con invarianza FPS). Cero código de aplicación.
- [x] Archivos raíz y gobernanza OSS (`README.md`, `AGENTS.md`, `LICENSE` Apache-2.0, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `SUPPORT.md`, `SECURITY.md`, `CONTRIBUTING.md` con DCO e IA, `THIRD_PARTY_NOTICES.md`, `.gitignore`, `.gitattributes`, `.editorconfig`).
- [x] Plantillas y automatización declarativa de GitHub (`.github/PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/{bug_report,feature_request,data_correction,config}.yml`, `CODEOWNERS`, `dependabot.yml`, `labels.yml`).
- [x] Visión, presupuestos medibles y escalabilidad (`docs/VISION.md`, `docs/QUALITY_BARS.md` con `QB-01`..`QB-13`, `docs/PLATFORM_SUPPORT.md`, `docs/HARDWARE_TIERS.md`).
- [x] Arquitectura, roadmap y gestión de riesgos (`docs/ARCHITECTURE.md` con `PlatformAdapter` e invarianza FPS, `docs/ROADMAP.md`, `docs/RISKS_AND_SPIKES.md` con `R1`–`R17` y `SPIKE-1`..`SPIKE-6`).
- [x] Políticas operativas y glosario (`docs/DATA_POLICY.md`, `docs/CONVENTIONS.md`, `docs/TESTING_STRATEGY.md`, `docs/SECURITY_MODEL.md`, `docs/LEGAL.md`, `docs/GLOSSARY.md`).
- [x] Índice `docs/DECISIONS.md` y registro completo `ADR-0001` a `ADR-0014` en `docs/adr/`.
- [x] Verificación de coherencia cruzada, diagramas Mermaid válidos y 0 coincidencias de nombres antiguos.

### Capa 1 — Esqueleto del Monorepo, Tooling, CI Multi-OS y Línea Base (`Completada — verificación Windows/CI en VERIFY_ON_WINDOWS.md`)

- **Fecha:** 2026-11-13 · **Rama:** `arena/604fae3a-cs2-aim` · **PR previsto:** `feat(infra): layer 1 skeleton and tooling` (`layer-1-done`)
- [x] Fase 0: migración de `appId` canónico a `io.github.evomaxpc.evoaim`, `0` ocurrencias de identificadores o nombres antiguos y cierre de `DT-04`.
- [x] Inicializar `pnpm-workspace.yaml` (`pnpm@12.18.0`), `.nvmrc` (`22.22.3`), `tsconfig.base.json` estricto (TS `6.0.3`), `ADR-0015`..`0017` y paquetes `@evo-aim/{core,data,engine,ui,desktop}` con versiones exactas fijadas.
- [x] Configurar ESLint 10 flat config type-aware (`no-explicit-any`, prohibición de `Math.random`/`Date.now` en `core`/`engine`, React Hooks), Prettier, `dependency-cruiser` (DAG + test de violación sintética), Husky + `lint-staged` + `commitlint`, Vitest multi-proyecto (`100 %` cobertura en `core`, `95.34 %` global) y Playwright (`e2e/app.spec.ts` parametrizado en `1280x720@1`, `1920x1080@1.5`, `3840x2160@2`, navegación por teclado y `prefers-reduced-motion`).
- [x] Implementar `PlatformAdapter` (`win32`, `linux`, `darwin` con detección `x11`/`wayland`), logger JSONL estructurado con rotación y sanitización `<USER_HOME>`, ventana Electron endurecida (`sandbox: true`, `contextIsolation: true`, CSP estricta sin `unsafe-eval`/`unsafe-inline` + test estático de `0` `style=`, protocolo `app://evoaim` con anti-traversal, Fuses en `afterPack`, IPC validado con Zod) y shell React de 7 páginas en español (`strings.es.ts`) con escala `--text-scale`, media queries (`prefers-color-scheme`, `prefers-reduced-motion`, `forced-colors`) e indicadores visuales no dependientes solo del color.
- [x] Implementar y testear `/tools/{check-licenses,check-dco,check-pr-title,baseline,check-no-owner-values}`, actualizar `THIRD_PARTY_NOTICES.md` con inventario real (`502` paquetes), documentar excepción `dev-only` de `pnpm audit` en `docs/RISKS_AND_SPIKES.md` y configurar `.github/workflows/ci.yml` fijado por SHA (`verify`, `dco-and-title`, `e2e`, `package-smoke`, `baseline`, `audit`).
- [x] Ejecutar `SPIKE-4` en host Node (`better-sqlite3@13.1.1` `N-API v10` en memoria + canal `diag:nativeModules` + `asarUnpack`), publicar `docs/BASELINE.md` y documentar en `docs/VERIFY_ON_WINDOWS.md` las comprobaciones dependientes del binario Electron / Windows 10-11.

### Capa 2 — Núcleo Matemático, Sensibilidad, FOV y PRNG (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/02-core-math` · **PR:** —
- [ ] Unidades nominales (_branded types_) y tipo `Result<T, E>` en `@evo-aim/core`.
- [ ] Fórmulas verificadas de `eDPI`, `cm/360`, `countsPer360`, `Hor+ FOV` y estado `verified` documentado para zoom (`R5`).
- [ ] PRNG determinista `xoshiro128**` + `splitmix32` y geometría analítica rayo-esfera/cápsula.
- [ ] Fase matemática de **`SPIKE-3`** (consistencia Windows/Linux) y cobertura $\ge 95\%$ con Vitest + `fast-check`.

### Capa 3 — Persistencia Local SQLite + Drizzle, IPC y Perfiles (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/03-persistence-profiles` · **PR:** —
- [ ] Proceso secundario (`utilityProcess` / Worker) con `better-sqlite3` en modo `WAL` dentro de `<userData>/EVO-AIM-CS2/`.
- [ ] Esquema inicial Drizzle, migraciones versionadas y backup automático previo a migración.
- [ ] Contratos IPC compartidos y validados en ambos extremos con Zod (`@evo-aim/data`).
- [ ] CRUD de perfiles de usuario y pruebas de durabilidad ante cierre inesperado (`QB-10`).

### Capa 4 — Motor de Entrenamiento 3D, Input Sub-Frame e Invarianza FPS (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/04a-engine-spikes`, `layer/04b-sim-loop`, `layer/04c-webgl-renderer` · **PR:** —
- [ ] **Sub-capa `4a` (Bloqueante):** ejecutar y documentar **`SPIKE-1`**, **`SPIKE-2`**, cierre de **`SPIKE-3`**, **`SPIKE-5`** (Tier L iGPU 60 Hz) y **`SPIKE-6`** (input crudo cross-OS Win/Linux X11-Wayland/macOS).
- [ ] **Sub-capa `4b`:** captura Pointer Lock (`unadjustedMovement`), ring buffer `getCoalescedEvents()`, game loop fijo 240 Hz con registro de impacto sub-frame y **test automatizado obligatorio de invarianza FPS (30/60/144/360 FPS, `QB-06`)**.
- [ ] **Sub-capa `4c`:** escena Three.js WebGL2 (`InstancedMesh`, zero-alloc), cámara FOV CS2, mira nativa nítida, presets (`Modo Ahorro`/`Bajo`/`Medio`/`Alto`), DRS y audio base. Tag `v0.1.0`.

### Capa 5 — Escenarios Data-Driven (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/05-scenarios` · **PR:** —
- [ ] Esquema Zod declarativo de escenarios, spawners, perfiles de movimiento y puntuación.
- [ ] Catálogo inicial de 10–12 escenarios fundamentales con reciclaje de instancias sin fugas (`QB-08`).

### Capa 6 — Armas de CS2, Dispersión y Patrones de Recoil (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/06a-weapons-core`, `layer/06b-recoil-patterns` · **PR:** —
- [ ] Cerrar decisión formal de licencia de `/packages/data` (`CC BY 4.0` vs `CC0`, `ADR-0008`).
- [ ] **Sub-capa `6a`:** modelo de cadencia, imprecisión base/movimiento y recuperación con `DataProvenance` completo.
- [ ] **Sub-capa `6b`:** patrones de _recoil_ / _spray control_ verificados y entrenador interactivo de spray.

### Capa 7 — Telemetría Profunda y Analítica Explicativa (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/07-analytics` · **PR:** —
- [ ] Captura cinemática sin asignaciones durante el run (fase balística/correctiva, _overshoot_, TTK, Fitts $TP$).
- [ ] Guardado transaccional post-run en SQLite y vistas explicativas con intervalos de confianza.

### Capa 8 — Rutinas y Planificador Adaptativo (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/08-adaptive-routines` · **PR:** —
- [ ] Reproductor de rutinas estructuradas y algoritmo adaptativo auditable en `@evo-aim/core`.

### Capa 9 — Calibración Física 360° y _Sensitivity Finder_ (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/09-calibration-sens-finder` · **PR:** —
- [ ] Asistente guiado de verificación física 360° (`QB-01`) y detector de anomalías de DPI/aceleración.
- [ ] Protocolo experimental contrabalanceado _Sensitivity Finder_ con informe estadístico.

### Capa 10 — Módulo Científico Verificable (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/10a-science-corpus`, `layer/10b-science-interactive` · **PR:** —
- [ ] **Sub-capa `10a`:** biblioteca revisada por pares con DOI/URL obligatorios (`DATA_POLICY.md`) y descargo no médico.
- [ ] **Sub-capa `10b`:** gráficas interactivas conectando teoría (p. ej. Ley de Fitts) con los datos reales del usuario.

### Capa 11 — Ejercicios Tácticos Específicos de CS2 (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/11a-counter-strafe`, `layer/11b-tactical-angles` · **PR:** —
- [ ] **Sub-capa `11a`:** física de movimiento lateral y métricas de _counter-strafing_.
- [ ] **Sub-capa `11b`:** ejercicios abstractos parametrizados (_greybox_, cero mapas de Valve) de _peek_, _pre-aim_ y _spray transfer_.

### Capa 12 — Benchmarks, Progresión y Gamificación Honesta (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/12-benchmarks-progression` · **PR:** —
- [ ] Batería de benchmarks reproducibles por sub-habilidad, niveles locales y recordatorios saludables de descanso.

### Capa 13 — UI/UX, Onboarding, Accesibilidad e i18n Comunitario (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/13-ux-onboarding-i18n` · **PR:** —
- [ ] Onboarding completo con detección de GPU/software renderer y prueba de rendimiento de 10 s para auto-preset bloqueable.
- [ ] Accesibilidad (modos daltonismo, teclado sin numpad, escalado UI).
- [ ] Internacionalización completa ES/EN + validación automática en CI y guía de contribución de traducciones comunitarias (`i18n`).

### Capa 14 — Editor de Escenarios, `.evoaim` y Replays Deterministas (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/14-editor-evoaim-replays` · **PR:** —
- [ ] Editor visual con cotas de seguridad para Tier L.
- [ ] Importación/exportación endurecida de paquetes `.evoaim` (validación Zod + fuzzing de seguridad).
- [ ] Reproductor determinista de replays con cámara lenta y telemetría superpuesta.

### Capa 15 — Rendimiento por Tiers (L/M/H), Memoria y Latencia (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/15-perf-hardware-tiers` · **PR:** —
- [ ] Benchmarks completos en Tiers `L`, `M` y `H`, ajuste fino de auto-preset y DRS.
- [ ] Prueba de estabilidad de 10 min sin fugas (`QB-08`), optimización de arranque (`QB-07`) y modo "Flash-on-Click" para cámaras de alta velocidad.

### Capa 16 — Integraciones Oficiales con CS2 Multiplataforma (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/16-cs2-integrations` · **PR:** —
- [ ] Adaptadores completos en `PlatformAdapter` (`win32`, `linux`, `darwin`) para rutas de Steam/CS2 y `userdata` con degradación elegante si CS2 no está instalado.
- [ ] Lectura consentida de `.cfg` y receptor local opt-in de GSI (`gamestate_integration_evoaim.cfg`) en `127.0.0.1`.

### Capa 17 — Empaquetado Multi-OS, QA, Licencias y GitHub Releases (`Pendiente`)

- **Fecha:** — · **Rama prevista:** `layer/17-release` · **PR:** —
- [ ] Generación automatizada en GitHub Releases: Windows (**NSIS + Portable**), Linux (**AppImage + deb**) y macOS (**dmg** best-effort).
- [ ] Auto-update desde Releases, publicación de `SHA256SUMS.txt`, notas honestas de firma/SmartScreen/Gatekeeper (`R17`).
- [ ] Ratificación de política de telemetría cero por defecto y generación automática de `THIRD_PARTY_NOTICES.md`.

---

## Seguimiento de Spikes Técnicos

| ID        | Descripción corta                                                       | Capa prevista                         | Estado                             | Resultado / Decisión                                                                                                                                                                                          |
| --------- | ----------------------------------------------------------------------- | ------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SPIKE-1` | Input crudo `unadjustedMovement`, 8000 Hz y DPI scaling vs. `cm/360`    | Inicio Capa 4 (`4a`)                  | Pendiente                          | —                                                                                                                                                                                                             |
| `SPIKE-2` | _Frame pacing_ 144–360 Hz y 0 pausas GC en Three.js + Electron          | Inicio Capa 4 (`4a`)                  | Pendiente                          | —                                                                                                                                                                                                             |
| `SPIKE-3` | Determinismo cross-run y cross-OS (Windows vs. Linux)                   | Capa 2 + Inicio Capa 4                | Pendiente                          | —                                                                                                                                                                                                             |
| `SPIKE-4` | Empaquetado de `better-sqlite3` con `electron-builder` (Win + Linux)    | Capa 1                                | **En validación final CI/Windows** | `better-sqlite3@13.1.1` (`N-API v10`) verificado en Node `linux-x64` (`CREATE/INSERT/SELECT`) y configurado en `asarUnpack` (`ADR-0016`); pendiente ejecución binaria en CI/Windows (`VERIFY_ON_WINDOWS.md`). |
| `SPIKE-5` | Viabilidad en hardware real **Tier L** (iGPU, 60 Hz, preset Bajo + DRS) | Inicio Capa 4 (`4a`)                  | Pendiente                          | —                                                                                                                                                                                                             |
| `SPIKE-6` | Input crudo cross-OS (Windows, Linux X11/Wayland, macOS)                | Capa 1 (sonda) + Inicio Capa 4 (`4a`) | **Sonda OS lista (Capa 1)**        | `LinuxPlatformAdapter` detecta `wayland` / `x11` / `unknown` vía `XDG_SESSION_TYPE` / `WAYLAND_DISPLAY` / `DISPLAY`; prueba física de `unadjustedMovement` planificada en Sub-capa `4a`.                      |

---

## Registro de Deuda Técnica y Decisiones Abiertas

1. **`DT-01` (Propietario — Antes de Capa 1/4):** Completar las especificaciones de los equipos reales de referencia (`Tier L`, `Tier M`, `Tier H`) en `docs/HARDWARE_TIERS.md` y `docs/QUALITY_BARS.md`.
2. **`DT-02` (Propietario — Antes de aceptar contribuciones externas):** Confirmar definitivamente la licencia `Apache-2.0` (`ADR-0008`) y rellenar el canal real de contacto de moderación en `CODE_OF_CONDUCT.md`.
3. **`DT-03` (Propietario — Antes de Capa 6):** Decidir la licencia específica de los catálogos de `/packages/data` (`CC BY 4.0` vs `CC0 1.0`).
4. ~~**`DT-04` (Infraestructura GitHub — Resuelta en Capa 1 Fase 0):**~~ Referencias documentales actualizadas al slug canónico `evo-aim-cs2` en `.github/ISSUE_TEMPLATE/config.yml` y `SECURITY.md`, y `appId` migrado a `io.github.evomaxpc.evoaim` (`ADR-0013`). _(Nota: confirmar en GitHub Settings si el remoto físico del propietario ya fue renombrado a `evo-aim-cs2`)._

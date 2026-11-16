# ROADMAP.md — Hoja de Ruta Incremental por Capas (Capas 0 a 17)

- **Propósito:** Planificar la construcción completa de EVO-AIM-CS2 en 18 capas secuenciales verificables, definiendo objetivos, entregables, dependencias, riesgos, criterios de aceptación medibles (_Definition of Done_), validación de _Quality Bars_ y división en sub-capas.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Reglas de Ejecución del Roadmap

1. **Secuencialidad estricta:** no se inicia una capa sin cumplir los criterios de aceptación de sus dependencias directas ni sin haber cerrado los _Spikes_ bloqueantes asociados.
2. **Etiquetado de hitos:** al fusionar cada capa en `main` se etiqueta con `layer-N-done` (y versionado SemVer a partir de `v0.1.0` tras completar la Capa 4; véase `ADR-0009`).
3. **Sub-capas recomendadas:** varias capas tienen alta densidad técnica y **deben dividirse en sub-capas** para mantener PRs revisables y libres de _scope creep_ (`R11`). Véase la Sección 3 al final del documento.

---

## 2. Detalle de Capas (0 a 17)

### Capa 0 — Fundamentos, Arquitectura y Gobernanza Open Source

- **Objetivo:** Establecer las bases documentales, arquitectónicas, legales, multiplataforma y de escalabilidad de hardware sin escribir código de aplicación.
- **Entregables:** Archivos raíz (`README.md`, `AGENTS.md`, `LICENSE` Apache-2.0, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `SUPPORT.md`, `SECURITY.md`, `CONTRIBUTING.md`, `THIRD_PARTY_NOTICES.md`, `.gitignore`, `.gitattributes`, `.editorconfig`), plantillas `.github/` (PR, Issues, `dependabot.yml`, `labels.yml`, `CODEOWNERS`), `PROGRESS.md`, `/docs/*` completos (`VISION`, `QUALITY_BARS`, `ARCHITECTURE`, `PLATFORM_SUPPORT`, `HARDWARE_TIERS`, `ROADMAP`, `RISKS_AND_SPIKES`, `DECISIONS`, `DATA_POLICY`, `CONVENTIONS`, `TESTING_STRATEGY`, `SECURITY_MODEL`, `LEGAL`, `GLOSSARY`) y `ADR-0001`..`ADR-0014`.
- **Dependencias:** Ninguna.
- **Riesgos principales:** `R6` (datos inventados), `R11` (alcance), `R15` (licencias OSS), `R16` (marca CS2).
- **Criterios de aceptación (DoD):** Todos los documentos creados y coherentes entre sí, diagramas Mermaid válidos, 0 coincidencias de nombres antiguos, 0 código de aplicación, licencia Apache-2.0 íntegra.
- **Validación de `QUALITY_BARS`:** Definición formal de `QB-01` a `QB-13` en estado `Target, a validar`.

---

### Capa 1 — Esqueleto del Monorepo, Tooling, CI Multi-OS y Línea Base

- **Objetivo:** Inicializar el monorepo `pnpm` con los 5 paquetes `@evo-aim/*`, interfaz `PlatformAdapter` inicial, ventana Electron mínima segura, CI multiplataforma, verificación de licencias y línea base de peso/RAM.
- **Entregables:**
  - Configuración raíz `pnpm-workspace.yaml`, `tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), ESLint (con reglas de fronteras entre paquetes y aislamiento de `PlatformAdapter`), Prettier, Vitest y Playwright.
  - Paquetes esqueleto `@evo-aim/core`, `@evo-aim/data`, `@evo-aim/engine`, `@evo-aim/ui` y `@evo-aim/desktop` (`apps/desktop/src/main/platform/{win32,linux,darwin}`).
  - Workflows de GitHub Actions con **matriz CI (`windows-latest` Tier 1, `ubuntu-latest` Tier 2, `macos-latest` Tier 3 no bloqueante)** y check de DCO.
  - **Verificación automática de licencias** en CI bloqueando dependencias GPL/AGPL/SSPL o no aprobadas (`ADR-0014`).
  - Ejecución de **`SPIKE-4`** (empaquetado real de `better-sqlite3` con `electron-builder` en Windows x64 y Linux x64) y sonda diagnóstica inicial de **`SPIKE-6`** (lectura de capacidades de Pointer Lock por SO).
  - Medición y publicación de la **línea base de tamaño de instalador, RAM en reposo y RAM en arranque** (`QB-09`), más verificación de versiones mínimas de SO soportadas contra la versión exacta de Electron instalada (`R14`).
- **Dependencias:** Capa 0.
- **Riesgos principales:** `R10` (`better-sqlite3` ABI), `R12` (huella base Electron), `R14` (soporte SO Electron), `R15` (licencias transitivas).
- **Criterios de aceptación (DoD):** `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` (ventana abre con `sandbox: true` y CSP activa) y chequeo de licencias pasan en verde en Windows y Linux; `SPIKE-4` documentado y superado; tabla de línea base de tamaño/RAM publicada.
- **Validación de `QUALITY_BARS`:** Línea base de `QB-07`, `QB-08`, `QB-09`; activación en CI de `QB-11` y base de `QB-12`.

---

### Capa 2 — Núcleo Matemático, Sensibilidad, FOV y PRNG (`@evo-aim/core`)

- **Objetivo:** Construir y verificar exhaustivamente todas las funciones matemáticas puras del dominio CS2, unidades tipadas y el generador aleatorio determinista.
- **Entregables:**
  - Conversores exactos `eDPI`, `cm/360`, `in/360`, `degPerCount`, `countsPer360` y equivalencias entre `DPI`/sensibilidad.
  - Proyecciones de campo de visión `Hor+` de CS2 (4:3 base $90^\circ \rightarrow$ 16:9, 16:10, 21:9 y modos _stretched_) y distancia monitor (_Monitor Distance_), marcando fórmulas de zoom no confirmadas conforme a `DATA_POLICY.md`.
  - PRNG determinista con semilla (`ADR-0005`) y utilidades estadísticas/geométricas (intersección rayo-esfera, rayo-cápsula, ángulos esféricos) con 0 dependencias externas.
  - Ejecución inicial de **`SPIKE-3`** (consistencia del PRNG y operaciones en coma flotante entre Windows y Linux).
- **Dependencias:** Capa 1.
- **Riesgos principales:** `R5` (fórmulas zoom/FOV CS2), `R9` (determinismo IEEE-754 cross-OS).
- **Criterios de aceptación (DoD):** Cobertura $\ge 95\%$ en `@evo-aim/core` con tests unitarios de tabla de referencia independiente y _property-based tests_ (`fast-check`); 0 imports de DOM/Node; `SPIKE-3` (fase matemática) en verde.
- **Validación de `QUALITY_BARS`:** Base matemática de `QB-01`, `QB-05`, `QB-11`, `QB-13`.

---

### Capa 3 — Persistencia Local SQLite + Drizzle, Contratos IPC y Perfiles

- **Objetivo:** Implementar el almacenamiento local transaccional fuera del hilo de renderizado, sistema de migraciones, copias de seguridad y gestión de perfiles de usuario/configuración.
- **Entregables:**
  - Esquema inicial Drizzle en SQLite (`profiles`, `settings`, `hardware_calibration`, `schema_migrations_audit`) dentro de `<userData>/EVO-AIM-CS2/` usando `PlatformAdapter` / `app.getPath('userData')`.
  - Ejecución en `utilityProcess` / Worker con modo `WAL` y backup automático previo a migración.
  - Contratos IPC tipados y validados en ambos extremos con Zod (`@evo-aim/data`).
- **Dependencias:** Capa 1, Capa 2.
- **Riesgos principales:** `R10` (módulo nativo en proceso secundario), corrupción ante cierre inesperado.
- **Criterios de aceptación (DoD):** CRUD completo de perfiles y preferencias de sensibilidad/vídeo vía IPC validado; test de cierre abrupto post-transacción sin pérdida de datos; 0 accesos SQLite desde renderer.
- **Validación de `QUALITY_BARS`:** `QB-10` (durabilidad y aislamiento fuera del hot path), `QB-12` (validación IPC).

---

### Capa 4 — Motor de Entrenamiento 3D, Input Sub-Frame e Invarianza FPS (`@evo-aim/engine`)

- **Objetivo:** Validar primero los spikes críticos de motor/input/hardware y construir el motor 3D WebGL2 de baja latencia con resolución de impactos sub-frame invariante a los FPS.
- **Entregables:**
  - **Ejecución obligatoria al inicio de la capa de `SPIKE-1`, `SPIKE-2`, `SPIKE-5` y `SPIKE-6`** (más cierre completo de `SPIKE-3` en simulación) antes de construir el resto del motor.
  - Captura Pointer Lock (`unadjustedMovement: true` + fallback con alerta), ring buffer de `getCoalescedEvents()` sin asignaciones.
  - Game loop con simulación fija a 240 Hz, evaluación sub-frame exacta en el timestamp del disparo, interpolación visual y protección anti-espiral.
  - Escena Three.js limpia (`InstancedMesh`), cámara FPS con FOV CS2 exacto, crosshair nítido a resolución nativa, presets gráficos (`Modo Ahorro`, `Bajo`, `Medio`, `Alto`), Escalado Dinámico de Resolución (DRS) y audio mínimo de impacto.
  - **Test automatizado obligatorio de invarianza FPS (`QB-06`)** demostrando idénticos impactos/puntuación a 30, 60, 144 y 360 FPS.
- **Dependencias:** Capa 2, Capa 3.
- **Riesgos principales:** `R1`, `R2`, `R3`, `R8`, `R9`, `R12`, `R13`.
- **Criterios de aceptación (DoD):** `SPIKE-1/2/3/5/6` aprobados (o activación documentada de Plan B si alguno fallase); escena jugable de tiro básico a 60–360 Hz cumpliendo `QB-01`, `QB-02`, `QB-04`, `QB-05`, `QB-06`, `QB-08`; primer tag `v0.1.0`.
- **Validación de `QUALITY_BARS`:** `QB-01`, `QB-02`, `QB-03`, `QB-04`, `QB-05`, `QB-06`, `QB-08`.

---

### Capa 5 — Sistema de Escenarios Data-Driven (`@evo-aim/data` + `@evo-aim/engine`)

- **Objetivo:** Permitir definir escenarios variados (estáticos, _flicking_, _tracking_, _target switching_, micro-ajuste) mediante esquemas declarativos validados sin tocar código del motor.
- **Entregables:**
  - Esquema Zod declarativo de escenarios (geometría de sala paramétrica, zonas de spawn, perfiles de movimiento deterministas, tamaños angulares inspirados en hitboxes abstractas, reglas de tiempo/puntuación).
  - Catálogo inicial de 10–12 escenarios fundamentales (_grid/microshot_, _wide flick_, _horizontal smooth tracking_, _evasive strafe_, _target switch_).
- **Dependencias:** Capa 4.
- **Riesgos principales:** `R8` (asignaciones al reciclar objetivos), `R11` (complejidad excesiva del DSL).
- **Criterios de aceptación (DoD):** Todos los escenarios cargan en $< 200\text{ ms}$, son 100 % deterministas por semilla y reciclan instancias en pools fijos (0 fugas tras 20 reinicios seguidos).
- **Validación de `QUALITY_BARS`:** Mantenimiento de `QB-05`, `QB-06`, `QB-08`.

---

### Capa 6 — Modelo de Armas de CS2, Dispersión y Patrones de Recoil

- **Objetivo:** Modelar con trazabilidad estricta (`DATA_POLICY.md`) las armas clave de CS2, cadencia, penalización de movimiento, recuperación de precisión y patrones de _recoil_ / _spray control_.
- **Entregables:**
  - Decisión formal cerrada sobre la **licencia de los datos** en `/packages/data` (`CC BY 4.0` vs `CC0`; requisito de `ADR-0008` y `ADR-0014` previo a publicar este catálogo).
  - Catálogo verificado de armas principales de CS2 (USP-S / Glock-18, Desert Eagle, MP9 / MAC-10, Galil / FAMAS, AK-47, M4A4, M4A1-S, AWP) con `DataProvenance` completo.
  - Simulador de _spray_ con objetivo fantasma opcional (_ghost target_), vista de compensación angular y puntuación por impacto/cabeza/cuerpo.
- **Dependencias:** Capa 2, Capa 4, Capa 5.
- **Riesgos principales:** `R4` (exactitud de datos de armas tras parches de CS2), `R5` (zoom AWP/Scout), `R7` (cero assets propietarios).
- **Criterios de aceptación (DoD):** 100 % de armas con fuente documentada y test de validación en CI; cualquier parámetro no confirmado marcado `verified: false` con aviso en UI; invarianza FPS preservada con cadencias rápidas.
- **Validación de `QUALITY_BARS`:** `QB-06`, `QB-13`.

---

### Capa 7 — Telemetría Local Profunda y Analítica Explicativa

- **Objetivo:** Capturar cinemática detallada de cada disparo/trayectoria y transformarla en diagnósticos accionables y honestos almacenados en SQLite.
- **Entregables:**
  - Captura en buffers tipados durante el run (tiempo de reacción tras spawn, velocidad angular pico, eficiencia de ruta, ángulo de error radial/direccional, _undershoot_ vs. _overshoot_, velocidad del jugador al disparar, TTK, _Throughput_ de Fitts).
  - Agregador post-run y persistencia por lotes en SQLite (`runs`, `shot_events`, `daily_aggregates`).
  - Panel de resultados explicativo con gráficas históricas, intervalos de confianza y avisos cuando $N$ es pequeño.
- **Dependencias:** Capa 3, Capa 5, Capa 6.
- **Riesgos principales:** `R8` (captura de muestras en hot path), crecimiento de base de datos SQLite.
- **Criterios de aceptación (DoD):** Guardado post-run completo en $< 100\text{ ms}$; 0 escrituras durante el run; consultas de historial de 1 000 runs sintéticos en $< 50\text{ ms}$.
- **Validación de `QUALITY_BARS`:** `QB-08`, `QB-10`, `QB-11`.

---

### Capa 8 — Rutinas de Entrenamiento y Planificador Adaptativo

- **Objetivo:** Construir un motor de rutinas estructuradas (calentamiento, bloque técnico, fatiga controlada) que ajuste dificultad y selección de ejercicios según las debilidades medidas en Capa 7.
- **Entregables:**
  - Reproductor fluido de listas de escenarios con descansos recomendados.
  - Algoritmo adaptativo transparente en `@evo-aim/core` (basado en zona de desafío óptimo ~70–85 % de acierto / progresión de velocidad y tamaño angular) que explica **por qué** sugiere subir o bajar dificultad.
- **Dependencias:** Capa 5, Capa 7.
- **Riesgos principales:** Recomendaciones opacas o sobreajuste a un único run atípico.
- **Criterios de aceptación (DoD):** Funciones del planificador 100 % puras, deterministas y cubiertas con tests de propiedades ($\ge 95\%$); explicación textual auditable de cada ajuste.
- **Validación de `QUALITY_BARS`:** `QB-11`.

---

### Capa 9 — Herramienta de Calibración 360° y _Sensitivity Finder_ Empírico

- **Objetivo:** Permitir verificar físicamente la correspondencia `cm/360` sobre la alfombrilla y guiar la elección de sensibilidad basada en datos propios del jugador.
- **Entregables:**
  - Asistente interactivo de calibración 360° (10 repeticiones guiadas) que detecta discrepancias de DPI real del sensor, escalado o aceleración residual.
  - Protocolo _Sensitivity Finder_ con pruebas ortogonales (flick amplio, micro-corrección, tracking, giro 180°) con orden contrabalanceado y semillas equivalentes.
- **Dependencias:** Capa 2, Capa 4, Capa 7.
- **Riesgos principales:** `R2`, mala interpretación estadística por fatiga/aprendizaje entre rondas.
- **Criterios de aceptación (DoD):** Validación completa de `QB-01`; informe final con rango de `eDPI` recomendado e indicador explícito de varianza/confianza.
- **Validación de `QUALITY_BARS`:** Validación empírica final de `QB-01` y `QB-03`.

---

### Capa 10 — Módulo Científico Verificable

- **Objetivo:** Integrar una biblioteca interactiva rigurosa sobre control motor, aprendizaje perceptivo-motor, sueño/descanso y biomecánica aplicada a CS2 sin una sola cita inventada.
- **Entregables:**
  - Fichas estructuradas en `@evo-aim/data` (Ley de Fitts 1954, modelo de submovimientos optimizados de Meyer et al., práctica distribuida vs. masiva, calentamiento, postura/ergonomía preventiva no médica) con DOI/URL obligatorio.
  - Conexión directa entre conceptos científicos y las métricas reales del jugador (p. ej. visualizar su propia recta de regresión de Fitts $MT = a + b \cdot ID$).
- **Dependencias:** Capa 7 (`DATA_POLICY.md` estricto).
- **Riesgos principales:** `R6` (alucinaciones bibliográficas o extrapolaciones médicas indebidas).
- **Criterios de aceptación (DoD):** 100 % de entradas con DOI/URL real comprobado; descargo explícito de que no constituye consejo médico; cualquier nota secundaria no verificada lleva badge visible `Pendiente de verificación`.
- **Validación de `QUALITY_BARS`:** `QB-13`.

---

### Capa 11 — Ejercicios Tácticos Específicos de CS2

- **Objetivo:** Cerrar la brecha de transferencia entrenando las mecánicas compuestas exclusivas de Counter-Strike 2 usando geometría abstracta limpia (cero mapas de Valve).
- **Entregables:**
  - Modelo cinemático de movimiento lateral y frenado (_counter-strafing_ A/D con umbral de precisión de primera bala).
  - Ejercicios de _peek & pre-aim_ sobre ángulos abstractos parametrizados, _head-level crosshair placement_, _jiggle-peek_, _burst discipline_ y _spray transfer_ multi-objetivo.
- **Dependencias:** Capa 5, Capa 6, Capa 7.
- **Riesgos principales:** `R4` (parámetros de aceleración/fricción de CS2), `R7` (evitar cualquier parecido con mapas con copyright de Valve).
- **Criterios de aceptación (DoD):** Métrica específica de sincronización `counterStrafeTimingErrorMs` validada; revisión legal confirmando uso exclusivo de geometría _greybox_ abstracta.
- **Validación de `QUALITY_BARS`:** `QB-06`, `QB-13`.

---

### Capa 12 — Benchmarks Oficiales, Progresión y Gamificación Honesta

- **Objetivo:** Ofrecer motivación sostenida a largo plazo mediante _benchmarks_ estandarizados por habilidad sin mecánicas oscuras ni adictivas.
- **Entregables:**
  - Batería de evaluación por sub-habilidades (_Static Clicking_, _Micro-Correction_, _Dynamic Clicking_, _Tracking_, _Spray & Transfer_, _Counter-Strafe Precision_).
  - Niveles de maestría locales, objetivos semanales saludables (con avisos de descanso tras sesiones largas) y comparación contra el propio historial (_Personal Best_ y percentiles móviles propios).
- **Dependencias:** Capa 7, Capa 8, Capa 11.
- **Riesgos principales:** Puntuaciones infladas o dependientes de FPS (mitigado por `QB-06`).
- **Criterios de aceptación (DoD):** Puntuaciones de benchmark reproducibles bit a bit desde replay; cero mecánicas _dark pattern_.
- **Validación de `QUALITY_BARS`:** `QB-05`, `QB-06`.

---

### Capa 13 — UI/UX Profesional, Onboarding, Accesibilidad e Internacionalización (i18n Comunitario)

- **Objetivo:** Pulir toda la experiencia de usuario, flujo de primer arranque (con detección de hardware/preset de 10 s), accesibilidad visual/motora y soporte multilingüe abierto a la comunidad.
- **Entregables:**
  - Onboarding guiado (configuración de sensibilidad CS2, prueba de rendimiento GPU de 10 s con auto-preset bloqueable y aviso WebGL2/software renderer).
  - Accesibilidad: paletas para daltonismo en dianas/HUD, escala tipográfica, navegación completa por teclado (compatible con teclados 60 %/TKL sin numpad).
  - **Sistema i18n completo en Español (`es`) e Inglés (`en`) + flujo documentado para traducciones aportadas por la comunidad** (archivos JSON tipados con validación de claves faltantes e interpolación segura en CI, guía para contribuyentes con etiqueta `i18n`).
- **Dependencias:** Capas 4–12.
- **Riesgos principales:** Sobrecarga de UI que afecte tiempos de carga (`QB-07`).
- **Criterios de aceptación (DoD):** 100 % de cadenas externalizadas en `es` y `en`; validador automático de catálogos i18n en CI; test E2E completo del onboarding en Windows y Linux.
- **Validación de `QUALITY_BARS`:** `QB-07`, `QB-11`.

---

### Capa 14 — Editor de Escenarios, Intercambio `.evoaim` y Replays Deterministas

- **Objetivo:** Permitir crear escenarios/rutinas propios, compartirlos mediante paquetes seguros `.evoaim` y reproducir cualquier sesión grabada.
- **Entregables:**
  - Editor visual con previsualización instantánea y validación de límites de rendimiento (tope de entidades para no romper Tier L).
  - Importador/exportador del formato contenedor **`.evoaim`** con validación Zod estricta, límites anti-_zip-bomb_/tamaño máximo y sanitización total (`SECURITY_MODEL.md`).
  - Reproductor determinista de replays con cámara en primera persona, cámara lenta y superposición de vectores de error.
- **Dependencias:** Capa 4, Capa 5, Capa 7.
- **Riesgos principales:** Vectores de seguridad al importar `.evoaim` maliciosos, divergencia de replays entre versiones (`R9`).
- **Criterios de aceptación (DoD):** Suite de fuzzing de seguridad contra el parser `.evoaim` superada; reproducción exacta de replays verificada en Windows y Linux.
- **Validación de `QUALITY_BARS`:** `QB-05`, `QB-12`.

---

### Capa 15 — Optimización por Tiers de Hardware (L/M/H), Memoria y Latencia

- **Objetivo:** Auditar y optimizar de extremo a extremo el rendimiento en los tres niveles de hardware (`Tier L`, `Tier M`, `Tier H`), cerrando los presupuestos definitivos de memoria, arranque y _frame pacing_.
- **Entregables:**
  - **Suite de benchmarks por Tier (`L`, `M`, `H`)** y calibración fina de los umbrales de selección automática de preset y Escalado Dinámico de Resolución (DRS).
  - Perfilado profundo de memoria (runs de 10 min sin fugas), optimización de _cold start_ (_code splitting_, carga diferida de módulos pesados de analítica/editor) y modo "Flash-on-Click" para medición externa de latencia con cámara rápida.
- **Dependencias:** Capas 4–14.
- **Riesgos principales:** `R1`, `R8`, `R12` en equipos integrados Tier L.
- **Criterios de aceptación (DoD):** Cumplimiento verificado y documentado de `QB-04`, `QB-07`, `QB-08` y `QB-09` en equipos de referencia disponibles.
- **Validación de `QUALITY_BARS`:** Validación final de `QB-04`, `QB-07`, `QB-08`, `QB-09`.

---

### Capa 16 — Integraciones Oficiales con CS2 Multiplataforma (`GSI` y `.cfg`)

- **Objetivo:** Sincronizar ajustes de sensibilidad/crosshair desde archivos `.cfg` de CS2 e integrar recepción local opcional de _Game State Integration_ usando adaptadores por sistema operativo y degradación elegante.
- **Entregables:**
  - Implementación completa de `Win32PlatformAdapter`, `LinuxPlatformAdapter` y `DarwinPlatformAdapter` para detección de Steam, `libraryfolders.vdf`, rutas de CS2 y selección manual alternativa (`PLATFORM_SUPPORT.md`).
  - Lector seguro (solo lectura por defecto) de sensibilidad/crosshair desde configs de CS2 y generador opcional de `gamestate_integration_evoaim.cfg` bajo consentimiento explícito.
  - Servidor HTTP receptor GSI escuchando exclusivamente en `127.0.0.1` con token de autenticación local aleatorio y validación estricta de payload.
- **Dependencias:** Capa 1, Capa 3, Capa 13.
- **Riesgos principales:** `R7` (límites estrictos anti-cheat), diferencias de rutas Steam en Linux/Flatpak/discos secundarios, seguridad del puerto local.
- **Criterios de aceptación (DoD):** Funciona en Windows y Linux cuando CS2 está presente y **degrada con total elegancia sin errores** cuando CS2 o Steam no existen (incluyendo macOS); revisión de seguridad confirmando cero acceso a procesos/memoria de CS2.
- **Validación de `QUALITY_BARS`:** `QB-12`.

---

### Capa 17 — Empaquetado Multi-OS, QA Final, Licencias y Lanzamiento en GitHub Releases

- **Objetivo:** Preparar, auditar y automatizar la distribución pública multiplataforma en GitHub Releases con transparencia total de licencias, privacidad y firma.
- **Entregables:**
  - Pipeline de release en GitHub Actions generando artefactos por tag:
    - **Windows x64 (Tier 1):** instalador **NSIS** + ejecutable **Portable**.
    - **Linux x64 (Tier 2):** **AppImage** + paquete **`.deb`**.
    - **macOS (Tier 3 best-effort):** **`.dmg`**.
  - Configuración de `electron-updater` desde GitHub Releases (donde proceda), publicación de hashes `SHA256SUMS.txt` y documentación clara en notas de release sobre estado de firma de código y avisos de SmartScreen/Gatekeeper si el binario no está firmado comercialmente (`R17`).
  - Ratificación final de la política de **cero telemetría por defecto** (y, si se incluye exportación local o reporte de crash estrictamente opt-in, auditoría pública de su código).
  - Generación automatizada y verificación de `THIRD_PARTY_NOTICES.md` completo dentro de todos los paquetes distribuibles.
- **Dependencias:** Todas las capas anteriores (0–16).
- **Riesgos principales:** `R10`, `R15`, `R17` (SmartScreen / Gatekeeper / auto-update).
- **Criterios de aceptación (DoD):** Todos los `QUALITY_BARS` (`QB-01`..`QB-13`) auditados; artefactos instalables probados en limpio en Windows y Linux; `THIRD_PARTY_NOTICES.md` al día; release candidata `v1.0.0-rc.1` / `v1.0.0` lista.
- **Validación de `QUALITY_BARS`:** Auditoría global de cierre `QB-01`..`QB-13`.

---

## 3. División Recomendada en Sub-Capas (Mitigación de `R11`)

Las siguientes cuatro capas concentran demasiada superficie técnica para un único PR o iteración y **se recomienda dividirlas en sub-capas atómicas**:

| Capa                            | Sub-capas propuestas                                                                                                                                                                                      | Alcance acotado de cada sub-capa                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Capa 4** (Motor 3D)           | **`4a`** Spikes obligatorios (`SPIKE-1/2/3/5/6`)<br>**`4b`** Input sub-frame + Game Loop + Test Invarianza FPS<br>**`4c`** Renderer Three.js (`InstancedMesh`), presets L/M/H, DRS y audio base           | Evita escribir código de renderizado complejo antes de demostrar empíricamente que el input crudo y los 60 FPS en Tier L / 240+ Hz en Tier H cumplen los presupuestos. |
| **Capa 6** (Armas CS2)          | **`6a`** Esquema de armas + licencia de datos cerrada + rifles/pistolas base (1.ª bala y cadencia)<br>**`6b`** Patrones completos de _recoil_ / _spray control_ y entrenador visual de spray              | Separa la física de dispersión/cadencia de la captura y verificación meticulosa de patrones de 30 balas por arma.                                                      |
| **Capa 10** (Módulo Científico) | **`10a`** Motor de fichas bibliográficas verificadas + corpus inicial con DOI<br>**`10b`** Visualizaciones interactivas vinculadas a los datos del jugador (curva de Fitts personal, velocidad-precisión) | Permite auditar primero el rigor documental (`DATA_POLICY.md`) separado del desarrollo de componentes gráficos interactivos.                                           |
| **Capa 11** (Ejercicios CS2)    | **`11a`** Cinemática de movimiento lateral y entrenamiento de _counter-strafe_<br>**`11b`** Geometría paramétrica de ángulos (_peek_, _pre-aim_, _spray transfer_)                                        | Valida la física de frenado aislado antes de combinarla con geometrías de oclusión y múltiples objetivos.                                                              |

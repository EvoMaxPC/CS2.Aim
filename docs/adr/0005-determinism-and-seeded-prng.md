# ADR-0005: Simulación Determinista de Paso Fijo y PRNG con Semilla

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Core / Engine

## Contexto y Problema

Para que los _benchmarks_ (Capa 12), el protocolo A/B del _Sensitivity Finder_ (Capa 9) y los archivos de replay `.evoaim` (Capa 14) sean justos y reproducibles, dos ejecuciones con la misma semilla (`seed`) y la misma traza de entrada deben generar exactamente los mismos objetivos, trayectorias, impactos y puntuaciones (`QB-05`). `Math.random()` en JavaScript no admite semilla y depende de la implementación interna del motor JS.

## Opciones Consideradas

1. **`Math.random()` + `deltaTime` variable:** no determinista e imposible de reproducir en replays compactos.
2. **PRNG entero de 32 bits puro en TypeScript (`xoshiro128**` inicializado mediante `splitmix32`) + paso de simulación fijo de 240 Hz:** usa operaciones bit a bit de 32 bits (`Math.imul`, `>>>`, `^`) que tienen semántica idéntica garantizada por el estándar ECMAScript en cualquier SO/arquitectura.

## Decisión

Implementar en `@evo-aim/core` un PRNG determinista basado en **`xoshiro128**` (con expansor de semilla `splitmix32`)**, acoplado a un bucle de simulación de **timestep fijo configurable (por defecto $240\text{ Hz}$)** y prohibiendo el uso de `Math.random()` y `Date.now()` en `@evo-aim/core` y `@evo-aim/engine`.

## Consecuencias

- **Positivas:** replays de pocos kilobytes por minuto; comparación justa entre dos sensibilidades sobre exactamente la misma secuencia pseudoaleatoria de aparición de blancos; tests unitarios y de propiedades 100 % deterministas sin _flakiness_.
- **Negativas:** exige disciplina en el orden de actualización de entidades y verificación cruzada Windows/Linux en `SPIKE-3` (`R9`).
- **Divergencia de versión de V8 entre tests y replays en Electron (`ADR-0016`, `SPIKE-3`):** los tests automatizados de determinismo en CI y desarrollo corren sobre **Node 22 (`22.22.3`, V8 de Node 22)**, mientras que la simulación en vivo y la reproducción de replays en `@evo-aim/desktop` corren dentro del proceso renderer de **Electron `45.3.2`** (cuyo archivo oficial `DEPS` en `electron/electron@v45.3.2` declara **Chromium `156.0.8078.100`**, véase `ADR-0016`; versión exacta reportada en `process.versions.chrome` en ejecución real pendiente de confirmar empíricamente en `SPIKE-3`, `ADR-0019`). Aunque la aritmética entera de 32 bits del PRNG es bit a bit idéntica por especificación ECMAScript, **`Math.sin`, `Math.cos` y `Math.atan2` no tienen garantía _bit-exact_ entre distintas versiones de V8/FDLIBM** y pueden diferir en `1 ULP`. Por ello aplicamos **tres mitigaciones obligatorias**: (1) **tablas/polinomios trigonométricos deterministas propios en `@evo-aim/core`** para la simulación, (2) **fijar la versión exacta de Electron en tests** (`electron@45.3.2` + suite en proceso Electron real en `SPIKE-3`), y (3) **guardar `engineVersion` y `electronVersion` en cada replay `.evoaim`**.

# AGENTS.md — Reglas Operativas para Agentes de IA en EVO-AIM-CS2

- **Propósito:** Definir las reglas vinculantes, flujo de trabajo, prohibiciones y formato de entrega para cualquier agente de codificación o IA que opere en el repositorio `evo-aim-cs2`.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Lectura obligatoria antes de actuar

Antes de modificar cualquier archivo, instalar paquetes o proponer código, **todo agente DEBE leer íntegramente**:

1. [`/PROGRESS.md`](./PROGRESS.md) — estado real de las capas (0–17), spikes ejecutados y bloqueos.
2. [`/docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — límites entre paquetes (`@evo-aim/*`), procesos de Electron, `PlatformAdapter`, game loop e invarianza de FPS.
3. [`/docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) — reglas TypeScript strict, unidades explícitas, hot path, identificadores del proyecto, DCO e higiene de repo público.
4. [`/docs/QUALITY_BARS.md`](./docs/QUALITY_BARS.md) — presupuestos no funcionales (`QB-01`..`QB-13`) que el cambio no puede degradar.
5. [`/docs/DATA_POLICY.md`](./docs/DATA_POLICY.md) — política de fuentes y verificación para cualquier fórmula, estadística de arma o estudio científico.

Si la tarea toca sistemas operativos o rendimiento gráfico, lee también [`/docs/PLATFORM_SUPPORT.md`](./docs/PLATFORM_SUPPORT.md) y [`/docs/HARDWARE_TIERS.md`](./docs/HARDWARE_TIERS.md).

---

## 2. Identificadores oficiales del proyecto

Respeta estrictamente estos nombres en todo código, configuración y documentación:

| Concepto                             | Valor obligatorio                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| Nombre del producto                  | `EVO-AIM-CS2`                                                                          |
| Slug de repositorio                  | `evo-aim-cs2`                                                                          |
| Paquetes del monorepo                | `@evo-aim/core`, `@evo-aim/data`, `@evo-aim/engine`, `@evo-aim/ui`, `@evo-aim/desktop` |
| `appId` (ADR-0013)                   | `io.github.evomaxpc.evoaim`                                                            |
| Carpeta de datos de usuario          | `EVO-AIM-CS2` dentro de `app.getPath('userData')` (nunca rutas fijas de un SO)         |
| Extensión de archivos de intercambio | `.evoaim`                                                                              |
| Archivo de integración GSI           | `gamestate_integration_evoaim.cfg`                                                     |
| Prefijo de variables de entorno      | `EVOAIM_`                                                                              |
| Licencia de código                   | `Apache-2.0` (`SPDX-License-Identifier: Apache-2.0`)                                   |

---

## 3. Alcance estricto por capa

- **Trabaja únicamente en el alcance de la capa solicitada** según [`/docs/ROADMAP.md`](./docs/ROADMAP.md).
- **No adelantes funcionalidades** de capas posteriores aunque parezcan sencillas o convenientes.
- Si detectas una necesidad arquitectónica o cambio respecto al diseño documentado, regístralo mediante un nuevo ADR en `/docs/adr/NNNN-titulo.md` y actualiza `/docs/DECISIONS.md`.

---

## 4. Prohibiciones absolutas

1. **Prohibido inventar datos:** ningún parámetro de arma de CS2, patrón de _recoil_, fórmula de zoom, estudio científico, DOI, autor o benchmark de plataforma puede añadirse sin fuente verificable. Ante la menor duda, usa `verified: false` o márcalo `"por verificar"` conforme a `DATA_POLICY.md`.
2. **Prohibido usar motores de videojuegos externos:** no introduzcas Unity, Unreal, Godot, Babylon, PlayCanvas ni similares. El stack gráfico es Three.js sobre WebGL2.
3. **Prohibido introducir dependencias de runtime críticas sin ADR** ni dependencias con licencias incompatibles (GPL, AGPL, SSPL o sin licencia clara; véase `ADR-0014` y `CONVENTIONS.md`).
4. **Prohibido usar APIs dependientes del sistema operativo fuera de `PlatformAdapter`:** ningún código fuera de `apps/desktop/src/main/platform/{win32,linux,darwin}` puede leer el Registro de Windows, concatenar rutas con `\` o asumir rutas fijas de Steam/CS2.
5. **Prohibido violar la dirección de dependencias:** `@evo-aim/core` no puede importar DOM, Node, Electron, Three.js ni React.
6. **Prohibido degradar controles de calidad:** nunca uses `any`, `@ts-ignore`, `@ts-expect-error` sin justificación en línea, ni desactives reglas de ESLint/TypeScript ni omitas tests (`.skip`) para "hacer pasar" el build.
7. **Prohibido asignar memoria o usar funciones no deterministas en el hot path del motor:** nada de `new`, literales de objeto/array por frame, `Math.random()` ni `Date.now()` dentro del bucle de simulación.
8. **Prohibido usar assets con copyright de terceros:** cero texturas, modelos, sonidos, iconos o mapas extraídos de CS2/Valve o de otros juegos comerciales.
9. **Prohibido commitear secretos o datos personales (higiene de repo público):** nunca guardes claves, tokens, certificados, archivos `.env*`, rutas locales con nombres de usuario reales ni datos personales. Los perfiles de hardware solo describen especificaciones técnicas genéricas.
10. **Prohibido añadir telemetría oculta o activada por defecto:** el proyecto mantiene **cero telemetría por defecto**.

---

## 5. Verificaciones obligatorias antes de dar una tarea por terminada

Al cerrar cualquier tarea o capa (a partir de la Capa 1 cuando existan scripts):

1. Ejecutar `pnpm lint`, `pnpm typecheck` y `pnpm test` (y `pnpm test:e2e` o chequeo de licencias cuando aplique a la capa) asegurando 0 errores.
2. Verificar que las métricas aplicables de `QUALITY_BARS.md` se cumplen o actualizar su estado con evidencia reproducible.
3. Actualizar [`/PROGRESS.md`](./PROGRESS.md) marcando las subtareas completadas, fecha, rama y notas.
4. Firmar los commits con DCO (`git commit -s`) siguiendo Conventional Commits (`docs:`, `feat(core):`, `fix(engine):`, etc.).
5. Respetar la política de ramas del entorno: si trabajas en Arena Agent Mode, haz todos los commits en la rama activa fijada por la sesión; fuera de Arena, usa ramas `layer/NN-nombre` o `feat/...`.

---

## 6. Formato obligatorio de Informe Final

Al concluir la ejecución de una capa o entrega relevante, el agente DEBE presentar un informe estructurado con las siguientes secciones:

- **A. Lista de archivos creados o modificados** (en formato árbol o tabla clara).
- **B. Resumen de decisiones clave** (máximo 15 líneas, referenciando ADRs si se crearon).
- **C. Desviaciones respecto al prompt o al roadmap** y su justificación técnica.
- **D. Suposiciones realizadas** durante la implementación.
- **E. Datos o afirmaciones marcadas "por verificar"** (`verified: false` o pendientes de medición empírica).
- **F. Preguntas abiertas para el propietario** (numeradas y accionables).
- **G. Comandos `git` / `gh` exactos** ejecutados y los que debe ejecutar el propietario (push, PR, merge, tag `layer-N-done`), más el resumen de resultados de `lint` / `typecheck` / `test`.
- **H. Riesgos nuevos detectados** (y su alta en `RISKS_AND_SPIKES.md` si procede).

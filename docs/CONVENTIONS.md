# CONVENTIONS.md — Convenciones de Código, Unidades, Git y Open Source

- **Propósito:** Unificar las convenciones técnicas de TypeScript, rendimiento en hot path, sistema de unidades, control de versiones, licencias e higiene de repositorio público en EVO-AIM-CS2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Tabla Oficial de Identificadores del Producto

Estos valores son obligatorios en todos los paquetes, configuraciones, rutas y plantillas (`ADR-0013`):

| Concepto                        | Valor estándar                                                                         | Notas                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Nombre del producto             | `EVO-AIM-CS2`                                                                          | Uso consistente en UI, docs e instaladores                                 |
| Slug del repositorio            | `evo-aim-cs2`                                                                          | Nombre estándar del repo público                                           |
| Paquetes del monorepo           | `@evo-aim/core`, `@evo-aim/data`, `@evo-aim/engine`, `@evo-aim/ui`, `@evo-aim/desktop` | Scope único `@evo-aim/*`                                                   |
| `appId`                         | `io.github.evomaxpc.evoaim`                                                            | Identificador de aplicación Electron en espacio GitHub propio (`ADR-0013`) |
| Carpeta de datos de usuario     | `EVO-AIM-CS2` dentro de `app.getPath('userData')`                                      | 100 % multiplataforma; prohibidas rutas fijas de Windows                   |
| Extensión de intercambio        | `.evoaim`                                                                              | Contenedor validado para escenarios, rutinas y replays                     |
| Archivo de config GSI           | `gamestate_integration_evoaim.cfg`                                                     | Generado solo bajo consentimiento explícito en Capa 16                     |
| Prefijo de variables de entorno | `EVOAIM_`                                                                              | Ej.: `EVOAIM_LOG_LEVEL`, `EVOAIM_DEV_TOOLS`                                |
| Cabecera SPDX recomendada       | `// SPDX-License-Identifier: Apache-2.0`                                               | Recomendada en la primera línea de todo archivo `.ts`/`.tsx` nuevo         |

---

## 2. Estilo y Rigor en TypeScript

1. **Configuración estricta obligatoria (`tsconfig.base.json` en Capa 1):**
   - `"strict": true`
   - `"noUncheckedIndexedAccess": true`
   - `"exactOptionalPropertyTypes": true`
   - `"noImplicitOverride": true`
   - `"noFallthroughCasesInSwitch": true`
   - `"verbatimModuleSyntax": true`
2. **Prohibición de `any` y aserciones inseguras:** prohibido `any` implícito o explícito (`@typescript-eslint/no-explicit-any: error`). Usa `unknown` en fronteras externas (IPC, lectura de archivos `.evoaim`, GSI) y refínalo mediante esquemas Zod.
3. **Nomenclatura e idioma:**
   - Todo identificador de código, nombre de archivo, comentario técnico de código y mensaje de commit va en **inglés**.
   - Archivos de módulos y utilidades: `kebab-case.ts` (p. ej. `sensitivity-converter.ts`, `fixed-timestep-loop.ts`).
   - Componentes React: `PascalCase.tsx` (p. ej. `CalibrationWizard.tsx`).
   - Tipos, interfaces y clases: `PascalCase`. Funciones y variables: `camelCase`. Constantes inmutables de módulo: `UPPER_SNAKE_CASE`.
4. **Exports explícitos:** usar _named exports_ siempre; evitar `export default` (salvo donde una herramienta de config como Vite/Playwright lo exija). Evitar _barrel files_ gigantes que perjudiquen el _tree-shaking_ o introduzcan ciclos.

---

## 3. Sistema Explícito de Unidades (Cero Ambigüedad Dimensional)

Los errores entre grados y radianes o entre milisegundos y segundos son catastróficos en un simulador de puntería:

1. **Sufijo de unidad obligatorio** en parámetros, propiedades y variables numéricas con dimensión física:
   - Ángulos: `yawDeg`, `pitchDeg`, `fovHorizontalDeg` vs. `yawRad`, `halfFovRad`.
   - Longitudes: `distanceCm`, `cmPer360`, `targetRadiusMeters` (`RadiusM`).
   - Tiempo y frecuencia: `deltaTimeSec` (`dtSec`), `frameTimeMs`, `timestampMs`, `pollingRateHz`, `simTickRateHz`.
   - Ratón: `mouseDpi`, `deltaCountsX`, `countsPer360`.
2. **Branded Types en `@evo-aim/core`:** para las APIs matemáticas públicas de `@evo-aim/core`, se emplearán tipos nominales ligeros (_branded types_, p. ej. `Degrees`, `Radians`, `Centimeters`, `Counts`) de coste cero en runtime para impedir en tiempo de compilación pasar radianes a una función que espera grados.

---

## 4. Reglas Estrictas del _Hot Path_ (`@evo-aim/engine`)

Dentro del bucle de captura de eventos y de cada tick de simulación/render (`QB-08`):

- **PROHIBIDO asignar memoria en el heap:** nada de `new THREE.Vector3()`, literales `{ ... }`, `[...]`, `.map()`, `.filter()`, `structuredClone`, concatenación intensiva de strings ni `async/await` por tick.
- **PROHIBIDO crear closures por frame:** los callbacks reutilizan referencias estáticas pre-enlazadas.
- **PROHIBIDO usar relojes o azar no deterministas:** nada de `Math.random()` ni `Date.now()`.
- **PROHIBIDO cruzar IPC o tocar disco** mientras un run está en estado `RUNNING` (`QB-10`).

---

## 5. Política de Errores y Logging Estructurado

1. **`Result<T, E>` en `@evo-aim/core` y operaciones fallibles esperadas:** las validaciones de dominio, conversiones con entradas fuera de rango, parseo de `.evoaim` y búsqueda de rutas en `PlatformAdapter` devuelven un tipo discriminado `{ ok: true, value: T } | { ok: false, error: E }` en lugar de lanzar excepciones no tipadas.
2. **Prohibido tragar excepciones:** ningún bloque `catch` puede quedar vacío ni ignorar el error sin registrarlo estructuradamente o transformarlo en un error tipado de dominio.
3. **Logging estructurado y privado:** logs en formato JSON con campos `{ timestamp, level, scope, event, context }`, redactando siempre rutas de directorio personal del usuario antes de escribir a disco.

---

## 6. Convenciones de Git, Ramas, DCO y Versionado

### 6.1 Conventional Commits + DCO (`Signed-off-by`)

Todo commit debe firmarse con `-s` (DCO 1.1; véase [`CONTRIBUTING.md`](../CONTRIBUTING.md)) y seguir el formato:

```text
<type>(<scope>): <imperative summary>

Signed-off-by: Full Name <email@example.com>
```

- **Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`.
- **Scopes oficiales:** `core`, `data`, `engine`, `ui`, `desktop`, `platform`, `infra`, `docs`.
- **Ejemplos válidos:**
  - `docs(docs): add multi-platform support matrix and hardware tiers`
  - `feat(core): implement cs2 horizontal fov calculator with branded units`
  - `fix(platform): handle flatpak steam library path on linux`

### 6.2 Estrategia de Ramas (`ADR-0009`)

- **`main`:** rama protegida, siempre compilable y con todos los tests en verde.
- **Convención estándar para ramas futuras:**
  - Capas del roadmap: `layer/NN-nombre` (p. ej. `layer/01-skeleton-tooling`, `layer/02-core-math`).
  - Tareas puntuales: `feat/nombre-corto`, `fix/nombre-corto`, `docs/nombre-corto`.
- **Nota operativa importante para Arena Agent Mode:** _En sesiones ejecutadas dentro de **Arena Agent Mode**, la rama de trabajo la fija automáticamente el entorno (p. ej. `arena/<id>-...`) y no debe renombrarse ni cambiarse; todos los commits de la sesión se realizan en esa rama activa y se integran en `main` mediante Pull Request con squash merge._
- **Fusión y etiquetado:** fusión a `main` mediante **Squash Merge** (manteniendo historial lineal limpio y trailer DCO), seguida del tag `layer-N-done`. Versionado **SemVer** desde `v0.1.0` al cerrar la Capa 4.

---

## 7. Cobertura, Snapshots y Política de Dependencias Open Source

1. **Cobertura mínima (`QB-11`):** $\ge 95\%$ en `@evo-aim/core`, $\ge 80\%$ en el resto de lógica verificable.
2. **Política de Snapshots:** prohibidos los snapshots gigantes de árboles DOM/React frágiles; se prefieren aserciones explícitas de comportamiento y accesibilidad (`getByRole`). Los snapshots inline pequeños solo se admiten para estructuras serializadas estables bien justificadas.
3. **Dependencias y Licencias (`ADR-0010`, `ADR-0014`):**
   - Versiones exactas fijadas en `pnpm-lock.yaml` (`save-exact=true` recomendado para dependencias críticas).
   - **Licencias permitidas:** `MIT`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`, `Apache-2.0`, `0BSD`, `Unlicense` (y `MPL-2.0` sin modificar archivos cubiertos tras revisión explícita; `OFL-1.1` para tipografías; `CC0-1.0` / `CC-BY-4.0` con atribución en `THIRD_PARTY_NOTICES.md` para audio/assets propios o abiertos).
   - **Licencias PROHIBIDAS:** `GPL-*`, `AGPL-*`, `LGPL-*` estático sin revisión legal, `SSPL`, licencias comerciales propietarias o paquetes sin licencia declarada (`UNLICENSED`). En la Capa 1 se configurará verificación automática en CI.

---

## 8. Higiene de Repositorio Público

Al ser un repositorio público de código abierto:

- **PROHIBIDO commitear secretos, claves API, tokens, certificados de firma (`.pfx`, `.p12`, `.pem`), archivos `.env*` reales o bases de datos de usuario.**
- **PROHIBIDO commitear datos personales o rutas locales identificables** (p. ej. `C:\Users\<TuNombre>\...` o `/home/<tu_usuario>/...`).
- Las tablas de "Equipos de referencia" en `QUALITY_BARS.md` y `HARDWARE_TIERS.md` contendrán exclusivamente especificaciones técnicas anónimas de hardware y sistema operativo.

---

## 9. Definición General de "Hecho" (_Definition of Done_)

Ninguna tarea o PR se considera terminada hasta verificar:

1. Alcance ceñido a la capa actual + `PROGRESS.md` actualizado.
2. Build, lint, typecheck, tests (incluyendo cobertura) y validador de licencias/datos en verde.
3. Commits limpios con Conventional Commits y firmados con DCO (`-s`).
4. Compatibilidad multiplataforma (`PlatformAdapter` respetado para Windows Tier 1 y Linux Tier 2) e invarianza respecto a FPS intacta.
5. Cero datos sin fuente, cero assets de terceros con copyright y cero secretos en el diff.

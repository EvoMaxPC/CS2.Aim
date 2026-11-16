# Guía de Contribución (CONTRIBUTING)

- **Propósito:** Explicar cómo contribuir código, documentación, traducciones y datos verificados a EVO-AIM-CS2 bajo licencia Apache-2.0 y DCO.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

¡Gracias por tu interés en contribuir a **EVO-AIM-CS2**! Toda colaboración se rige por nuestro [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md), la arquitectura en [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) y los estándares en [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md).

---

## 1. Licencia de las contribuciones y DCO (Sin CLA)

### 1.1 Qué significa aportar bajo Apache-2.0

De acuerdo con la Sección 5 de [`LICENSE`](./LICENSE) (**Apache License 2.0**), cualquier contribución que envíes intencionadamente al repositorio (código, tests, documentación) se licencia bajo los mismos términos de Apache-2.0: conservas la titularidad de tus derechos de autor, pero otorgas al proyecto y a todos sus usuarios una licencia perpetua, mundial, gratuita e irrevocable de copyright y de patentes aplicables sobre tu aporte.

_(Nota sobre datos: las contribuciones al catálogo de datos en `/packages/data` deben incluir metadatos de procedencia verificables según [`docs/DATA_POLICY.md`](./docs/DATA_POLICY.md); su licencia específica de datos se formalizará antes de la Capa 6 conforme a `ADR-0008` y `ADR-0014`)._

### 1.2 Developer Certificate of Origin (DCO) obligatorio

No exigimos firmar un CLA (_Contributor License Agreement_) burocrático. En su lugar, utilizamos el **Developer Certificate of Origin (DCO 1.1)** (<https://developercertificate.org/>).

Cada commit debe llevar el pie `Signed-off-by:` certificando que tienes derecho legal a enviar ese trabajo bajo la licencia del proyecto. Git lo añade automáticamente usando el flag `-s`:

```bash
git commit -s -m "feat(core): add horizontal fov conversion formula"
```

Esto añadirá al final del mensaje de commit:

```text
Signed-off-by: Tu Nombre <tu.email@ejemplo.com>
```

Los Pull Requests con commits sin firma DCO recibirán la etiqueta `dco-missing` y no podrán fusionarse hasta corregirse (`git commit --amend -s` o rebase interactivo).

---

## 2. Reglas sobre contribuciones asistidas o generadas con IA

El uso de asistentes de IA (como Arena.ai Agent Mode, Claude, GitHub Copilot, ChatGPT, etc.) está permitido siempre que se cumplan estrictamente estas reglas:

1. **Responsabilidad íntegra del contribuyente:** quien abre el PR responde personalmente de haber revisado línea por línea el código o texto, de que comprende su funcionamiento y de que no infringe derechos de autor ni licencias incompatibles (p. ej. código copiado de proyectos GPL o propietarios).
2. **Cumplimiento estricto de `DATA_POLICY.md`:** **está terminantemente prohibido aceptar cifras, estadísticas de armas de CS2, patrones de recoil, citas científicas o DOIs generados de memoria por un modelo de IA**. Todo dato externo debe contrastarse contra una fuente primaria verificable y documentarse con `source`, `retrievedAt` y `verified`.
3. **Respeto a `AGENTS.md`:** si usas un agente autónomo sobre este repositorio, asegúrate de que lea y cumpla [`AGENTS.md`](./AGENTS.md).
4. **Transparencia:** indica en la descripción del PR si partes sustanciales fueron generadas con ayuda de IA y cómo las verificaste.

---

## 3. Cómo empezar y encontrar un `good first issue`

1. Revisa [`PROGRESS.md`](./PROGRESS.md) y [`docs/ROADMAP.md`](./docs/ROADMAP.md) para saber en qué capa se encuentra el proyecto. **No envíes funcionalidades de capas futuras** que aún no estén abiertas.
2. Filtra los Issues con las etiquetas:
   - `good first issue`: tareas acotadas y bien especificadas, ideales para estrenarse en el repositorio.
   - `help wanted`: tareas donde buscamos colaboración activa (especialmente pruebas en Linux X11/Wayland, hardware integrado Tier L o verificación de datos).
3. Comenta en el Issue antes de empezar para evitar trabajo duplicado.

---

## 4. Cómo proponer datos, correcciones de armas o estudios científicos

La credibilidad de EVO-AIM-CS2 depende de que **ningún dato sea inventado**:

1. Lee [`docs/DATA_POLICY.md`](./docs/DATA_POLICY.md) para conocer la jerarquía de fuentes aceptadas.
2. Abre un Issue usando la plantilla **Data Correction / Source Verification** (`.github/ISSUE_TEMPLATE/data_correction.yml`).
3. Aporta obligatoriamente la **fuente verificable** (archivos oficiales/medición reproducible documentada para armas/motor; **DOI o URL académica revisada por pares** para afirmaciones científicas).
4. Si envías un PR modificando datos o fórmulas, incluye tests unitarios con valores de referencia calculados independientemente.

---

## 5. Flujo de ramas, Commits y Pull Requests

### 5.1 Ramas

- `main` debe mantenerse siempre estable y compilable.
- Ramas de capas completas: `layer/NN-nombre-corto` (p. ej. `layer/01-skeleton-tooling`).
- Ramas de funcionalidades, correcciones o documentación: `feat/descripcion-corta`, `fix/descripcion-corta`, `docs/descripcion-corta`.
- _Excepción documentada:_ en sesiones de **Arena Agent Mode**, la rama de trabajo la fija automáticamente el entorno (`arena/...`) y se fusiona hacia `main` mediante PR con _squash_.

### 5.2 Mensajes de commit (Conventional Commits)

Formato obligatorio (en inglés):

```text
<type>(<scope>): <short summary in imperative mood>

[optional body explaining WHY, not just what]

Signed-off-by: Name <email>
```

- **Types permitidos:** `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`.
- **Scopes permitidos:** `core`, `data`, `engine`, `ui`, `desktop`, `platform`, `infra`, `docs`.

### 5.3 Política de dependencias

No añadas dependencias nuevas sin necesidad real. Cualquier dependencia debe tener una licencia permisiva compatible (MIT, BSD, ISC, Apache-2.0; véase `ADR-0014`). Las dependencias de runtime críticas exigen un ADR previo.

---

## 6. Definición de "Hecho" (_Definition of Done_ — DoD)

Un Pull Request está listo para fusionarse cuando cumple **todos** estos puntos:

- [ ] Se ajusta al alcance de la capa activa sin introducir _scope creep_.
- [ ] Todos los commits están firmados con DCO (`Signed-off-by`).
- [ ] Compila con TypeScript `strict` sin errores, `any` ni supresiones injustificadas (a partir de Capa 1).
- [ ] Pasa linter, tests unitarios/propiedades y cobertura mínima (≥ 95 % en `@evo-aim/core`, ≥ 80 % en resto de lógica).
- [ ] Respeta el aislamiento de plataforma (`PlatformAdapter`) y ha sido probado o razonado para Windows (Tier 1) y Linux (Tier 2).
- [ ] No degrada ningún presupuesto aplicable de [`docs/QUALITY_BARS.md`](./docs/QUALITY_BARS.md).
- [ ] Cualquier dato externo nuevo cumple [`docs/DATA_POLICY.md`](./docs/DATA_POLICY.md) y no incluye assets con copyright de terceros ni secretos.
- [ ] Actualiza documentación relevante, ADRs (si hubo decisión arquitectónica) y [`PROGRESS.md`](./PROGRESS.md) cuando corresponda.

## Resumen

<!-- Describe brevemente QUÉ cambia este PR y POR QUÉ. Indica la Capa (Layer 0..17) e Issue relacionado si existe. -->

- **Capa objetivo:** `layer-`
- **Issues relacionados:** Closes #

---

## Cambios principales

-

---

## Checklist de Verificación (Definition of Done)

Marca con `[x]` cada punto verificado (o escribe `N/A` justificándolo si no aplica a este PR):

### Gobernanza, Licencia y Open Source

- [ ] **Firmado con DCO:** Todos los commits incluyen `Signed-off-by:` (`git commit -s`).
- [ ] **Licencias de dependencias nuevas revisadas:** Si se añadieron paquetes, son permisivos compatibles (MIT/BSD/ISC/Apache-2.0; prohibido GPL/AGPL/SSPL según `ADR-0014`) y las dependencias críticas de runtime cuentan con ADR aprobado.
- [ ] **Sin assets de terceros ni secretos:** No se incluyen modelos, sonidos, iconos ni texturas de Valve/terceros con copyright, ni claves, `.env*` o rutas personales.

### Calidad Técnica y Multiplataforma

- [ ] **Alcance de capa respetado:** El PR no adelanta funcionalidades de capas futuras fuera de `docs/ROADMAP.md`.
- [ ] **Checks en verde:** `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan sin errores ni supresiones injustificadas (cuando existan a partir de Capa 1).
- [ ] **Probado/considerado en Windows y Linux (si aplica):** Todo acceso al SO pasa exclusivamente por `PlatformAdapter` y se han considerado diferencias de rutas/input entre Tier 1 (Windows) y Tier 2 (Linux).
- [ ] **Quality Bars respetados:** No degrada la invarianza de aim respecto a FPS ni los presupuestos de `docs/QUALITY_BARS.md` (sin asignaciones en el hot path).
- [ ] **Validado contra la matriz de personas (`docs/PERSONAS_MATRIX.md`) (o `N/A` justificado):** Se verificaron los extremos aplicables de `SUPPORTED_RANGES.md`, accesibilidad (`QB-15`) y cero supuestos del propietario (`QB-16`, `ADR-0018`).

### Datos y Documentación

- [ ] **Datos con fuente verificable (`DATA_POLICY.md`):** Toda fórmula, estadística de arma o referencia científica incluye `source`, `retrievedAt` y estado `verified` real (cero datos inventados).
- [ ] **Documentación y `PROGRESS.md` actualizados:** Se actualizaron docs/ADRs afectados y las casillas correspondientes de `PROGRESS.md`.

---

## Notas de prueba / Evidencia

<!-- Describe cómo probaste el cambio (SO, hardware tier L/M/H, comandos ejecutados, capturas o métricas). -->
<!-- Si utilizaste asistencia de IA para generar código, indica aquí cómo verificaste manualmente su exactitud y procedencia. -->

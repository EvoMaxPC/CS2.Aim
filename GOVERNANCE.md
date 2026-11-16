# Gobernanza del Proyecto (GOVERNANCE)

- **Propósito:** Definir cómo se toman decisiones técnicas y de producto, cómo se aceptan contribuciones y cómo evoluciona el equipo mantenedor en EVO-AIM-CS2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Modelo de gobernanza

**EVO-AIM-CS2** sigue un modelo de gobernanza ligero de **Mantenedor Principal (_Lead Maintainer_ / BDFL benévolo)** orientado al mérito técnico, la verificabilidad empírica y la transparencia pública. Este modelo es apropiado para las fases tempranas e intermedias del proyecto y puede evolucionar hacia un comité técnico de mantenedores cuando crezca la comunidad activa.

---

## 2. Roles

### 2.1 Usuarios y miembros de la comunidad

Cualquier persona que utilice EVO-AIM-CS2, reporte fallos, proponga ideas, corrija datos con fuentes o participe en discusiones respetando [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

### 2.2 Contribuyentes (_Contributors_)

Personas cuyas contribuciones (código, documentación, datos verificados, traducciones o pruebas en hardware real) han sido fusionadas en el repositorio bajo licencia Apache-2.0 y firmadas con DCO (`Signed-off-by`).

### 2.3 Mantenedores de área (_Maintainers_)

Contribuyentes recurrentes que han demostrado criterio técnico sólido, rigor con [`docs/QUALITY_BARS.md`](./docs/QUALITY_BARS.md) y respeto absoluto por [`docs/DATA_POLICY.md`](./docs/DATA_POLICY.md). Tienen permisos de revisión vinculante y fusión en áreas específicas (p. ej., `@evo-aim/core`, `@evo-aim/data`, plataforma Linux, i18n).

### 2.4 Mantenedor Principal (_Lead Maintainer_)

- **Titular actual:** `@EvoMaxPC` (propietario del repositorio).
- **Responsabilidades:** custodiar la visión del producto (`docs/VISION.md`), aprobar decisiones arquitectónicas críticas (ADRs), gestionar lanzamientos firmados en GitHub Releases, administrar permisos de seguridad del repositorio y resolver empates o desacuerdos técnicos.

---

## 3. Cómo se toman las decisiones

1. **Cambios rutinarios (bugs, mejoras acotadas, tests, traducciones, correcciones de datos con fuente):** se deciden mediante _Pull Request_ público con revisión de al menos un mantenedor y CI en verde.
2. **Cambios arquitectónicos, dependencias de runtime nuevas o alteraciones de `QUALITY_BARS.md`:** requieren un **ADR** (_Architecture Decision Record_) en `/docs/adr/` siguiendo el formato MADR. El ADR se discute públicamente en un PR antes o junto con la implementación y requiere aprobación explícita del Mantenedor Principal.
3. **Cambios de licencia o política legal:** cualquier cambio en el licenciamiento de código o datos requiere decisión expresa del Mantenedor Principal y cumplimiento estricto de los términos de Apache-2.0 y de las atribuciones de terceros.

En caso de desacuerdo técnico, prevalecen en este orden:

1. Límites legales, de seguridad y anti-cheat (`docs/LEGAL.md`, `docs/SECURITY_MODEL.md`).
2. Invarianza de fidelidad de aim y presupuestos medibles (`docs/QUALITY_BARS.md`).
3. Evidencia empírica reproducible sobre opiniones subjetivas (`docs/DATA_POLICY.md`).
4. Decisión final motivada por escrito del Mantenedor Principal.

---

## 4. Cómo se aceptan cambios

Todo cambio en `main` entra por _Pull Request_ cumpliendo:

- Firma DCO válida en todos los commits (`git commit -s`).
- Compatibilidad de licencias verificada (Apache-2.0 y dependencias permitidas según `ADR-0014`).
- Cumplimiento de la Definición de Hecho (_Definition of Done_) descrita en [`CONTRIBUTING.md`](./CONTRIBUTING.md) y [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md).
- Cero regresión en los _Quality Bars_ aplicables.

---

## 5. Incorporación y baja de mantenedores

- **Incorporación:** el Mantenedor Principal puede invitar como Mantenedor de área a contribuyentes con historial sostenido de aportes de alta calidad, revisiones constructivas y alineación con los principios del proyecto. El cambio se refleja mediante PR actualizando `.github/CODEOWNERS` y este documento.
- **Inactividad o baja:** un mantenedor puede pasar voluntariamente a estado _emérito_ en cualquier momento, o tras 6 meses sin actividad previa comunicación amistosa. En caso de incumplimiento grave de `CODE_OF_CONDUCT.md` o `SECURITY.md`, el Mantenedor Principal puede revocar permisos de inmediato.

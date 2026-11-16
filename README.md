# EVO-AIM-CS2

> **Estado:** Pre-alpha (`layer-1-done` en `main`; `layer-0.1` en curso — Adaptabilidad, fidelidad y licencia propuesta de datos) · **Licencia de código:** [Apache-2.0](./LICENSE) · **Plataformas objetivo:** Windows 10/11 (Tier 1), Linux x64 (Tier 2), macOS (Tier 3 best-effort)

**EVO-AIM-CS2** es una plataforma de entrenamiento de puntería (_aim training_) de código abierto para PC, especializada al 100 % en **Counter-Strike 2**. Combina un motor 3D propio enfocado en fidelidad de input sub-frame e invarianza respecto a los FPS, cálculos verificables de sensibilidad (`eDPI`, `cm/360`, `FOV`), simulación de armas y patrones de _recoil_, ejercicios tácticos específicos de CS2, rutinas adaptativas, analítica explicativa y un módulo científico con trazabilidad documental estricta.

---

## Aviso de no afiliación (Trademark & Legal Notice)

**EVO-AIM-CS2** es un proyecto independiente de código abierto mantenido por la comunidad y **no está afiliado, asociado, autorizado, respaldado ni conectado oficialmente de ninguna manera con Valve Corporation**.

_Counter-Strike_, _Counter-Strike 2_, _CS2_, _Steam_ y sus respectivos logotipos son marcas comerciales o marcas registradas de **Valve Corporation** en EE. UU. y otros países. Su mención en este repositorio tiene un propósito exclusivamente descriptivo para indicar compatibilidad de parámetros y enfoque de entrenamiento. Consulta [`docs/LEGAL.md`](./docs/LEGAL.md) para más detalles.

EVO-AIM-CS2 **no lee ni modifica memoria de procesos externos**, no inyecta DLLs ni interactúa con CS2 fuera de los mecanismos oficiales documentados (archivos de configuración `.cfg` bajo consentimiento del usuario y _Game State Integration_ local).

---

## Principios clave

1. **Fidelidad de aim invariante a los FPS:** el giro físico (`cm/360`), la resolución de impactos sub-frame y la puntuación base son idénticos en un portátil de 60 Hz con gráficos integrados (Tier L) y en un equipo entusiasta de 360 Hz (Tier H). Solo escala la calidad visual.
2. **Cero datos inventados:** toda fórmula, parámetro de arma o referencia científica incluye metadatos de procedencia verificables o se marca explícitamente como `Pendiente de verificación` (véase [`docs/DATA_POLICY.md`](./docs/DATA_POLICY.md)).
3. **Privacidad y código abierto real:** licencia Apache-2.0, **cero telemetría por defecto**, ejecución 100 % local en SQLite y sin servicios de terceros obligatorios.

---

## Documentación del proyecto (`/docs`)

Toda la arquitectura, especificaciones, estándares de calidad y hoja de ruta están documentados en [`/docs`](./docs):

| Documento                                                  | Descripción                                                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`PROGRESS.md`](./PROGRESS.md)                             | Estado actual del proyecto, checklist por capas (0–17), spikes y deuda técnica                 |
| [`docs/VISION.md`](./docs/VISION.md)                       | Visión de producto, principio Adaptativo por diseño, segmentos, historias y no-objetivos       |
| [`docs/QUALITY_BARS.md`](./docs/QUALITY_BARS.md)           | Presupuestos medibles (`QB-01`..`QB-19`), invarianza FPS, adaptabilidad y fidelidad CS2        |
| [`docs/PERSONAS_MATRIX.md`](./docs/PERSONAS_MATRIX.md)     | **Lectura clave:** 21 personas 100 % sintéticas (`P01`..`P21`) y cobertura de ejes extremos    |
| [`docs/SUPPORTED_RANGES.md`](./docs/SUPPORTED_RANGES.md)   | **Lectura clave:** rangos soportados por eje y degradación determinista fuera de rango         |
| [`docs/FIDELITY_SPEC.md`](./docs/FIDELITY_SPEC.md)         | **Lectura clave:** matriz de fidelidad frente a CS2, estado `"por verificar"` y exclusiones    |
| [`docs/TRAINER_PARITY.md`](./docs/TRAINER_PARITY.md)       | Taxonomía de 12 categorías de ejercicios con nombres propios `evo.*` y capa asociada           |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)           | Arquitectura Electron + TypeScript + Three.js + SQLite, `PlatformAdapter`, game loop e IPC     |
| [`docs/PLATFORM_SUPPORT.md`](./docs/PLATFORM_SUPPORT.md)   | Matriz de soporte multiplataforma (Windows Tier 1, Linux Tier 2, macOS Tier 3)                 |
| [`docs/HARDWARE_TIERS.md`](./docs/HARDWARE_TIERS.md)       | Escalabilidad de hardware (Tiers L/M/H), presets gráficos y accesibilidad de periféricos       |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md)                     | Plan de ejecución incremental por capas (`0`, `0.1`, `1`, `1.1` y `2` a `17`) y sub-capas      |
| [`docs/RISKS_AND_SPIKES.md`](./docs/RISKS_AND_SPIKES.md)   | Registro de riesgos (`R1`–`R17`), spikes (`SPIKE-1`..`SPIKE-6`) y seguimientos post-Capa 1     |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md)                 | Índice de _Architecture Decision Records_ (`ADR-0001` a `ADR-0019`)                            |
| [`docs/DATA_POLICY.md`](./docs/DATA_POLICY.md)             | Política de datos, medición propia reproducible (`ADR-0019`) y propuesta `CC BY 4.0` (`DT-03`) |
| [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md)             | Estándares TypeScript strict, reglas de hot path, unidades, Git y licencias                    |
| [`docs/TESTING_STRATEGY.md`](./docs/TESTING_STRATEGY.md)   | Pirámide de pruebas, determinismo, property-based testing, invarianza FPS y E2E                |
| [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)             | Guía práctica de desarrollo local, scripts `pnpm`, requisitos por SO y resolución de problemas |
| [`docs/BASELINE.md`](./docs/BASELINE.md)                   | Línea base medida de tamaño de bundles, sonda nativa `SPIKE-4` y tabla `QB-07..09`             |
| [`docs/VERIFY_ON_WINDOWS.md`](./docs/VERIFY_ON_WINDOWS.md) | Protocolo de verificación en Windows 10/11 (Tier 1) y GitHub Actions CI                        |
| [`docs/SECURITY_MODEL.md`](./docs/SECURITY_MODEL.md)       | Modelo de amenazas (`.evoaim`, IPC, GSI local, aislamiento Electron y telemetría cero)         |
| [`docs/LEGAL.md`](./docs/LEGAL.md)                         | Marco legal, marcas, anti-cheat, privacidad y licenciamiento de código/datos                   |
| [`docs/GLOSSARY.md`](./docs/GLOSSARY.md)                   | Glosario técnico de puntería, motor 3D y fórmulas base propuestas de CS2                       |

---

## Instalación

_Próximamente — El proyecto ha completado la **Capa 1 (Esqueleto y Tooling)**. Los primeros binarios jugables (`v0.1.0`) e instaladores para Windows y Linux se publicarán a través de GitHub Releases conforme avance el [`docs/ROADMAP.md`](./docs/ROADMAP.md)._

---

## Desarrollo

Requisitos: **Node.js `>= 22.22.1`** (`22.22.3` LTS en `.nvmrc`) y **`pnpm@12.18.0`** (vía Corepack).

```bash
corepack enable
corepack prepare pnpm@12.18.0 --activate
pnpm install --frozen-lockfile

# Ejecutar puerta completa de calidad (lint, format, typecheck, DAG, tests + cobertura, licencias)
pnpm verify

# Arrancar ventana Electron en modo desarrollo
pnpm dev
```

Consulta [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md), [`docs/VERIFY_ON_WINDOWS.md`](./docs/VERIFY_ON_WINDOWS.md) y [`CONTRIBUTING.md`](./CONTRIBUTING.md) para conocer todos los scripts, el flujo con DCO (`git commit -s`) y las convenciones de arquitectura.

---

## Comunidad, soporte y seguridad

- **Contribuir:** lee [`CONTRIBUTING.md`](./CONTRIBUTING.md) y [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
- ** Gobernanza:** consulta [`GOVERNANCE.md`](./GOVERNANCE.md).
- **Soporte y dudas:** revisa [`SUPPORT.md`](./SUPPORT.md).
- **Seguridad:** para reportar vulnerabilidades de forma privada, sigue [`SECURITY.md`](./SECURITY.md).

---

## Licencia

El código fuente de **EVO-AIM-CS2** se distribuye bajo la licencia **Apache License 2.0** (véase [`LICENSE`](./LICENSE) y [`docs/adr/0008-open-source-license.md`](./docs/adr/0008-open-source-license.md)). Para los futuros catálogos curados de datos en `/packages/data` se registra **CC BY 4.0** con estado **`PROPUESTA`**, pendiente de confirmación explícita del mantenedor (`DT-03`) antes de la **Capa 6**, capa en la que se incorporará el texto completo de la licencia de datos junto con el contenido del paquete (actualmente `/packages/data` es solo un esqueleto; véanse [`docs/adr/0014-open-source-policy.md`](./docs/adr/0014-open-source-policy.md) y [`docs/DATA_POLICY.md`](./docs/DATA_POLICY.md)).

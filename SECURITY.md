# Política de Seguridad (SECURITY)

- **Propósito:** Definir el canal seguro de reporte de vulnerabilidades, alcance de seguridad y plazos orientativos de respuesta para EVO-AIM-CS2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Versiones soportadas

El proyecto se encuentra actualmente en fase **Pre-alpha (Capa 0 — Fundamentos)**. Cuando se publiquen los primeros lanzamientos binarios (a partir de `v0.1.0`), las correcciones de seguridad se aplicarán únicamente sobre la **última versión publicada** y la rama `main`.

| Versión                          | Soportada con parches de seguridad  |
| -------------------------------- | ----------------------------------- |
| `main` (desarrollo activo)       | Sí                                  |
| Última release pre-1.0 (`0.x.y`) | Sí (cuando se publique)             |
| Versiones `0.x` anteriores       | No (actualizar a la última versión) |

---

## 2. Cómo reportar una vulnerabilidad (Canal principal)

**Por favor, NO abras un Issue público ni una discusión pública para reportar vulnerabilidades de seguridad.**

El canal oficial y prioritario es **GitHub Private Vulnerability Reporting**:

1. Ve a la pestaña **Security** del repositorio en GitHub.
2. Haz clic en **Advisories** → **Report a vulnerability** (enlace directo: `https://github.com/EvoMaxPC/evo-aim-cs2/security/advisories/new`).
3. Completa el formulario incluyendo:
   - Descripción clara del fallo y componente afectado (`@evo-aim/desktop`, parser `.evoaim`, receptor local GSI, IPC, dependencias, etc.).
   - Pasos detallados para reproducirlo o prueba de concepto (_PoC_) mínima.
   - Sistema operativo y versión afectada.
   - Impacto potencial estimado (ejecución remota de código, escape de sandbox de Electron, lectura/escritura arbitraria de archivos, denegación de servicio local, etc.).

_(Nota para el propietario del repositorio: si Private Vulnerability Reporting aún no aparece activo, habilítalo en `Settings → Code security → Private vulnerability reporting`)._

---

## 3. Plazos orientativos de respuesta (Objetivos, no garantías)

Al tratarse de un proyecto de código abierto mantenido sin acuerdos comerciales de nivel de servicio (SLA), los siguientes plazos constituyen **objetivos de buena fe y no garantías contractuales**:

| Fase                                                   | Plazo orientativo (objetivo)                                           |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| Acuse de recibo inicial                                | Dentro de **5 días hábiles**                                           |
| Evaluación preliminar y triaje de severidad            | Dentro de **10 días hábiles**                                          |
| Plan de mitigación o parche (severidad Crítica / Alta) | Dentro de **30 días naturales**                                        |
| Divulgación coordinada (_Security Advisory_)           | Tras publicar la versión corregida o acordar fecha con el investigador |

Reconoceremos públicamente el crédito del hallazgo en el _GitHub Security Advisory_ si quien reporta así lo desea.

---

## 4. Áreas de especial interés en el modelo de seguridad

Consulta [`docs/SECURITY_MODEL.md`](./docs/SECURITY_MODEL.md) para conocer la arquitectura defensiva completa. Consideramos dentro de alcance prioritario:

- Escapes de aislamiento en Electron (`contextIsolation`, `sandbox`, `preload`, políticas CSP o navegación a orígenes externos).
- Falta de validación o vulnerabilidades de deserialización/inyección al importar paquetes `.evoaim` (escenarios, rutinas, replays) o archivos `.cfg`.
- Exposición de red no autorizada o abuso en el servidor HTTP loopback del receptor de _Game State Integration_ (`127.0.0.1`).
- Escritura fuera de rutas autorizadas (_path traversal_) en los adaptadores de plataforma (`PlatformAdapter`).
- Contaminación de cadena de suministro en dependencias o workflows de GitHub Actions.

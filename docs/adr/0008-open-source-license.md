# ADR-0008: Licencia Open Source (Apache-2.0 para Código; Datos Pendientes)

- **Estado:** Accepted _(provisional hasta confirmación definitiva del propietario antes de abrir contribuciones externas masivas)_
- **Fecha:** 2026-11-13
- **Decisores:** Mantenedor Principal (`@EvoMaxPC`)

## Contexto y Problema

EVO-AIM-CS2 nace como un proyecto **open source** público. Elegir la licencia de código al inicio (Capa 0) es crítico porque cambiar de licencia más adelante requiere el consentimiento expreso de **todos** los titulares de copyright que hayan contribuido (a menos que se exigiera un CLA de cesión de derechos, lo cual desincentiva la colaboración comunitaria). Además, debemos distinguir entre el **código fuente de software** y los **catálogos de datos/contenido educativo** (`/packages/data`).

## Opciones Consideradas para el Código Fuente

| Licencia                       | Tipo                  | Concesión expresa de patentes               | Protección frente a uso de marca                  | ¿Permite derivados cerrados futuros (propios o de terceros)?                                             | Complejidad                 |
| ------------------------------ | --------------------- | ------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------- |
| **Apache-2.0** _(Recomendada)_ | Permisiva moderna     | **Sí** (cláusula 3 + terminación defensiva) | **Sí** (cláusula 6 excluye marcas explícitamente) | **Sí** (conservando avisos y `NOTICE`)                                                                   | Media (estándar industrial) |
| **MIT**                        | Permisiva minimalista | No explícita                                | No explícita                                      | Sí                                                                                                       | Muy baja                    |
| **GPL-3.0-only / or-later**    | Copyleft fuerte       | Sí                                          | Sí                                                | **No** (obliga a que cualquier derivado distribuido sea GPL-3.0; complica ciertas tiendas/integraciones) | Alta                        |
| **AGPL-3.0**                   | Copyleft de red       | Sí                                          | Sí                                                | **No** (extiende copyleft a SaaS en red; poco relevante para app de escritorio local)                    | Alta                        |

## Decisión

1. **Licencia del código fuente (`/LICENSE`):** adoptamos **Apache License, Version 2.0 (`Apache-2.0`)**, con aviso de copyright colectivo `"Copyright 2026 EVO-AIM-CS2 contributors"` y recomendación de cabecera `SPDX-License-Identifier: Apache-2.0` en los archivos de código.
2. **Política de contribuciones:** conforme a la Sección 5 de Apache-2.0 y mediante firma **DCO (`Signed-off-by`)** en cada commit (sin CLA; véase `ADR-0014`), toda contribución enviada al repositorio se licencia bajo Apache-2.0.
3. **Licencia de los DATOS (`/packages/data`: catálogos de armas verificados, escenarios base y fichas científicas):** queda explícitamente marcada como **PENDIENTE DE DECISIÓN ANTES DE LA CAPA 6**:
   - Candidata A: **CC BY 4.0** (exige atribución al reutilizar el esfuerzo de curación y verificación de datos; ojo: CC BY 4.0 es adecuada para contenido/bases de datos documentales, separada del código ejecutable).
   - Candidata B: **CC0 1.0** (dedicación al dominio público de los datos fácticos para máxima interoperabilidad sin fricción con cualquier licencia de software).

## Consecuencias

- **Positivas:** Apache-2.0 protege a mantenedores y usuarios frente a reclamaciones de patentes de contribuyentes, protege explícitamente el nombre del proyecto frente a usos indebidos de marca (cláusula 6) y mantiene total libertad futura tanto para la comunidad como para el fundador.
- **Dificultad de relicenciar:** una vez que se fusionen commits de terceros bajo Apache-2.0 + DCO, el proyecto **no podrá cerrarse ni cambiarse unilateralmente a GPL incompatible** sobre el código aportado por terceros sin pedir permiso a cada autor (aunque Apache-2.0 sí permite incluir el código en distribuciones mayores cumpliendo la sección 4). Por ello el propietario debe confirmar que está conforme con Apache-2.0 antes de aceptar PRs externos.
- **Acción pendiente obligatoria:** registrar un ADR complementario antes de iniciar la **Capa 6** cerrando la elección entre `CC BY 4.0` y `CC0 1.0` para `/packages/data`.

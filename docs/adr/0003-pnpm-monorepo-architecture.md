# ADR-0003: Monorepo con `pnpm` Workspaces y Dependencias Unidireccionales

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura

## Contexto y Problema

Un entrenador de puntería científicamente riguroso tiende a degradarse si las fórmulas matemáticas se mezclan con componentes React, objetos Three.js o llamadas a Electron/SQLite. Necesitamos fronteras modulares que permitan probar la lógica al $\ge 95\%$ en milisegundos y preservar la portabilidad futura.

## Opciones Consideradas

1. **Repositorio monolítico en una sola carpeta `src/`:** configuración inicial trivial, pero las importaciones cruzadas accidentales entre UI, Three.js y Node ocurren inevitablemente con el tiempo.
2. **Múltiples repositorios separados:** sobrecarga excesiva de sincronización de versiones en fase temprana.
3. **Monorepo `pnpm` workspaces con 5 paquetes bajo el scope `@evo-aim/*`:** aislamiento físico de `package.json` y `tsconfig.json` por dominio dentro de un único repositorio atómico.

## Decisión

Adoptamos un **monorepo con `pnpm` workspaces** compuesto por:

- `@evo-aim/core` (cero dependencias de plataforma/DOM/Node)
- `@evo-aim/data` (depende de `core` + `zod`)
- `@evo-aim/engine` (depende de `core` + `data` + `three`)
- `@evo-aim/ui` (depende de `core` + `data` + `react`/`zustand`)
- `@evo-aim/desktop` (ensambla todos los anteriores sobre Electron + SQLite + `PlatformAdapter`)

## Consecuencias

- **Positivas:** los tests de `@evo-aim/core` y `@evo-aim/data` corren de forma instantánea sin navegador ni Electron; cualquier violación de arquitectura falla inmediatamente en `typecheck`/`lint`; máxima facilidad para reutilizar `core` y `data` si un spike activase un cliente nativo alternativo.
- **Negativas:** requiere configurar referencias de TypeScript (`composite: true` / exports de workspace) correctamente en la Capa 1.

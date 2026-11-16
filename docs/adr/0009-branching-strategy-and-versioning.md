# ADR-0009: Estrategia de Ramas, Squash PRs, Etiquetas de Capa y SemVer

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Infra

## Contexto y Problema

El desarrollo por capas (Capas 0 a 17) con participación tanto humana como de agentes de IA requiere un historial de Git trazable, reversible por hito y compatible con las restricciones de entornos de agentes como Arena Agent Mode.

## Opciones Consideradas

1. **GitFlow clásico (`develop` + `release/*` + `hotfix/*`):** burocracia innecesaria para un equipo ágil y propenso a ramas de larga vida desincronizadas.
2. **Trunk-based estructurado por capas sobre `main`:** ramas cortas `layer/NN-nombre` (o `feat/*`, `fix/*`) integradas en `main` vía PR con _Squash Merge_ y tags inmutables por capa.

## Decisión

1. `main` es la única rama longeva y debe mantenerse siempre desplegable/compilable.
2. Convención estándar de ramas de trabajo: `layer/NN-nombre` para capas del roadmap y `feat/...`, `fix/...`, `docs/...` para cambios puntuales. _(Excepción operativa documentada: en Arena Agent Mode se utiliza la rama activa fijada por el entorno y se abre PR hacia `main`)._
3. Integración mediante **Pull Request + Squash Merge** conservando el trailer DCO (`Signed-off-by`).
4. Etiquetado doble:
   - Al completar cada capa $N \in [0..17]$: tag Git `layer-N-done` sobre el commit fusionado en `main`.
   - Versionado **SemVer 2.0.0** a partir de `v0.1.0` al cerrar la **Capa 4** (primer motor 3D jugable), incrementando `0.MINOR.PATCH` durante pre-release hasta `v1.0.0` al superar la **Capa 17**.

## Consecuencias

- **Positivas:** permite auditar o volver exactamente al estado final de cualquier capa (`git checkout layer-3-done`); mantiene `main` limpio y legible.
- **Negativas:** requiere disciplina para no mezclar trabajo de dos capas distintas en un mismo PR.

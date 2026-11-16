# ADR-0006: Política Estricta de Procedencia y Verificación de Datos

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Data / Mantenedor Principal

## Contexto y Problema

Los proyectos asistidos por IA o basados en wikis informales suelen contaminarse con cifras inventadas sobre cadencia/dispersión de armas de CS2, fórmulas obsoletas de CS:GO o citas científicas inexistentes (`R4`, `R5`, `R6`). En un entrenador especializado, un solo parámetro falso destruye la confianza del jugador competitivo.

## Opciones Consideradas

1. **Confiar en revisiones manuales informales:** propenso a errores humanos y alucinaciones silenciosas.
2. **Exigir metadatos estructurados `DataProvenance` validados en CI + bandera `verified: boolean` visible en UI:** ningún registro entra a `@evo-aim/data` sin `source`, `retrievedAt` y `notes`.

## Decisión

Adoptar obligatoriamente [`docs/DATA_POLICY.md`](../DATA_POLICY.md): todo dato externo requiere `DataProvenance` validado por Zod en CI (`QB-13`), los estudios científicos requieren DOI/URL académica real y cualquier fórmula o parámetro pendiente de confirmación empírica se etiqueta explícitamente como `verified: false` mostrándose con un aviso visual en la interfaz.

## Consecuencias

- **Positivas:** transparencia total frente a la comunidad competitiva; facilidad para auditar y actualizar datos cuando Valve publica un parche de equilibrio en CS2 mediante la plantilla `data_correction.yml`.
- **Negativas:** mayor esfuerzo documental al dar de alta cada arma o estudio en las Capas 6 y 10.

# ADR-0004: Persistencia Local con SQLite (`better-sqlite3` + Drizzle ORM)

- **Estado:** Accepted (sujeto a validación de empaquetado multiplataforma en `SPIKE-4`)
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Desktop

## Contexto y Problema

EVO-AIM-CS2 es 100 % local (_offline-first_) y almacenará miles de runs, cientos de miles de eventos de disparo individuales, perfiles de calibración y progresión histórica. Necesitamos consultas analíticas rápidas (percentiles, tendencias por arma/ángulo), transacciones atómicas a prueba de cierres inesperados (`QB-10`) y cero impacto en el _hot path_ del entrenamiento.

## Opciones Consideradas

1. **Archivos JSON planos / `electron-store`:** inviable para consultar decenas de miles de disparos sin cargar megabytes en memoria ni arriesgar corrupción de archivo.
2. **IndexedDB en el Renderer:** vive en el mismo proceso del motor 3D, es más difícil de respaldar/inspeccionar por el usuario y tiene ergonomía SQL inferior para analítica compleja.
3. **SQLite nativo (`better-sqlite3`) + Drizzle ORM en un `utilityProcess` / Worker:** velocidad extrema en consultas locales, modo `WAL` robusto, un único archivo `.sqlite` fácil de respaldar en `<userData>/EVO-AIM-CS2/` y tipado SQL ligero sin la pesadez binaria de Prisma Engine.

## Decisión

Usamos **`better-sqlite3` + Drizzle ORM** ejecutándose en un proceso/hilo dedicado fuera del `renderer` y fuera del bucle de eventos principal, con `journal_mode = WAL` y escritura exclusivamente **por lotes en una única transacción al finalizar cada run**.

## Consecuencias

- **Positivas:** licencia MIT en ambos paquetes; consultas analíticas complejas en pocos milisegundos; 0 impacto en FPS durante el ejercicio; migraciones SQL transparentes con backup automático previo.
- **Negativas / Riesgos:** `better-sqlite3` es un addon nativo C++ que debe compilarse para el ABI exacto de Electron en Windows x64 y Linux x64 (`R10`). Se valida obligatoriamente en la **Capa 1 (`SPIKE-4`)**; si fallase en alguna plataforma, el Plan B previsto es `node:sqlite` integrado o SQLite WASM en Worker.

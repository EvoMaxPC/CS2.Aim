# ADR-0012: Escalabilidad de Hardware (Tiers L/M/H) e Invarianza de la Fidelidad de Aim

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Engine

## Contexto y Problema

El segundo eje de **"Para todas las PCs"** es la heterogeneidad del hardware: desde portátiles modestos con GPU integrada y pantalla de 60 Hz (**Tier L**) hasta equipos competitivos con GPUs dedicadas modernas y monitores de 240–360 Hz (**Tier H**). En motores acoplados al _render loop_, bajar de 300 FPS a 60 FPS degrada el registro de disparos, altera trayectorias o introduce _stuttering_, penalizando mecánicamente al jugador con menos presupuesto (`R12`).

## Opciones Consideradas

1. **Diseñar solo para PCs gamer de gama media/alta (144+ Hz):** deja fuera a un enorme segmento de jugadores de CS2 (especialmente en Latinoamérica, Europa del Este y portátiles estudiantiles).
2. **Bajar la frecuencia de simulación en PCs lentos:** rompe el determinismo (`QB-05`) y altera la física entre máquinas.
3. **Principio de invarianza absoluta de simulación/input + escalabilidad estrictamente visual (Presets + DRS):** mantener idéntica la simulación de paso fijo (240 Hz) y la evaluación sub-frame del disparo en todos los equipos, escalando únicamente la carga gráfica en WebGL2.

## Decisión

Establecemos como principio arquitectónico innegociable ([`docs/HARDWARE_TIERS.md`](../HARDWARE_TIERS.md), `QB-06`):

1. **Invarianza de fidelidad de aim respecto a FPS y calidad gráfica:** el `cm/360`, la integración cronológica de eventos coalescidos de ratón hasta el timestamp exacto del disparo y la puntuación base deben ser **idénticos a 30, 60, 144 y 360 FPS**, verificado mediante un test automatizado obligatorio en CI desde la Capa 4.
2. **Tres Tiers de hardware (`Tier L`, `Tier M`, `Tier H`)** atendidos mediante presets `Modo Ahorro`, `Bajo`, `Medio`, `Alto` y `Personalizado`, Escalado Dinámico de Resolución (DRS) conservando mira/HUD a resolución nativa, detección de renderizado por software y prueba automática de 10 s en el primer arranque.
3. **Vigilancia de peso:** medir y publicar en Capa 1 la línea base de instalador y RAM (`QB-09`) y validar empíricamente un equipo real con iGPU en `SPIKE-5`.

## Consecuencias

- **Positivas:** equidad competitiva real entre jugadores de distintos recursos económicos; entrenamientos y benchmarks comparables entre un portátil de 60 Hz y un PC de 360 Hz.
- **Negativas:** mayor rigor de implementación en el bucle de eventos sub-frame de `@evo-aim/engine` y disciplina estricta de bajo número de _draw calls_ (`InstancedMesh`).

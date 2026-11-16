# ADR-0002: Renderizador 3D sobre Three.js (WebGL2) sin Motor de Videojuegos

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Engine

## Contexto y Problema

El proyecto prohíbe explícitamente usar motores de videojuegos generalistas (Unity, Unreal Engine, Godot) y exige construir nuestro propio motor de entrenamiento 3D ligero, auditable, determinista y libre de licencias restrictivas o sobrecarga innecesaria. Debemos decidir la capa gráfica sobre WebGL2 en `@evo-aim/engine`.

## Opciones Consideradas

1. **WebGL2 crudo desde cero (GLSL + gestión manual de buffers/matrices):** control absoluto, pero obliga a reimplementar carga/compilación segura de materiales básicos, cámaras, _frustum_, `InstancedMesh` y texto/helpers, retrasando meses el valor funcional.
2. **Three.js sobre WebGL2 (usado como librería de renderizado pura, NO como motor de simulación):** licencia MIT, maduro, excelente soporte de `InstancedMesh`, control directo de `WebGLRenderer` y bucle manual bajo nuestro propio _game loop_.
3. **Babylon.js / PlayCanvas:** motores web más pesados y acoplados con sus propios sistemas de física, escena y bucle de actualización.

## Decisión

Elegimos **Three.js (WebGL2)** utilizado estrictamente como **capa delgada de envío gráfico**, manteniendo toda la simulación física, cámara matemática, colisiones _hitscan_ sub-frame y ciclo de vida en código propio (`@evo-aim/core` + `@evo-aim/engine`).

## Consecuencias

- **Positivas:** licencia permisiva MIT; soporte inmediato de `THREE.InstancedMesh` para dibujar decenas de objetivos en 1–2 _draw calls_ (vital para Tier L a 60 Hz y Tier H a 360 Hz); control directo de `renderer.setPixelRatio()` para Escalado Dinámico de Resolución (DRS).
- **Negativas / Restricciones impuestas:** Three.js puede generar basura para el GC si se instancian vectores/matrices por frame o si no se llama `.dispose()` a geometrías/materiales. Por ello se prohíbe usar `THREE.Raycaster` genérico sobre mallas complejas en el hot path (la intersección geométrica rayo-esfera/cápsula se resuelve analíticamente en `@evo-aim/core`) y todas las instancias matemáticas temporales se pre-asignan al cargar el escenario (`QB-08`).

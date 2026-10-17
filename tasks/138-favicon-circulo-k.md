---
id: 138
title: "Favicon con el logo (círculo con la K)"
status: in-progress
---

## Contexto

El resultado de kinarafit.com.mx en Google y la pestaña del navegador mostraban el favicon anterior (un ícono de puntos). La usuaria subió el logo (círculo dorado con la K y "KINARA FIT") al Perfil de Empresa de Google y pidió usarlo también como favicon del sitio.

## Objetivo

Reemplazar el favicon por el círculo con la K, en los tamaños que piden Google y los navegadores (múltiplos de 48 px), con transparencia por fuera del círculo y un `apple-touch-icon` opaco para iOS.

## Archivos involucrados

- `public/favicon.ico` (16/32/48 px), `public/favicon-48x48.png`, `favicon-96x96.png`, `favicon-192x192.png`, `apple-touch-icon.png` (180 px, fondo blanco)
- `app/root.tsx` (`links()`: declarar los íconos)

## Restricciones específicas de esta tarea

- El logo es de la marca (no se rediseña): solo se recorta el círculo del archivo original que dio la usuaria (589×1280, recorte cuadrado) y se aplica máscara circular.
- Cambio visible aprobado explícitamente por la usuaria (muestra de 16/32/48/96 px sobre fondo claro y oscuro).

## Criterios de aceptación

- [x] `/favicon.ico`, `/favicon-48x48.png`, `/favicon-96x96.png`, `/favicon-192x192.png` y `/apple-touch-icon.png` responden 200.
- [x] El `<head>` declara los íconos con sus tamaños.
- [x] Typecheck sin errores (exit 0).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (solo agrega íconos y enlaces en `<head>`; sin cambios de layout)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno

## Pruebas manuales

- Ver la pestaña del navegador y el HTML del `<head>` en local.

## Notas de progreso

- 2026-10-16: íconos generados con PIL desde el logo original (recorte circular de 511 px), copiados a `public/`; el favicon anterior quedó respaldado en el scratchpad de la sesión (`favicon-anterior.ico`). Falta declarar los enlaces en `root.tsx`, probar y subir (pendiente de aprobación).
- 2026-10-16 (2): `root.tsx` declara 5 íconos (ico, 48, 96, 192 y apple-touch 180). Probado en local: los 5 archivos responden 200 con el tamaño correcto (ico 16/32/48 px). Falta subir a producción (pendiente de aprobación) y esperar que Google actualice el ícono en resultados (días a semanas).

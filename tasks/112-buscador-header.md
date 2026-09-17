---
id: 112
title: "Buscador funcional en el menú (antes era un botón muerto)"
status: done
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

El usuario reportó: "en el menu tiene la opcion de buscar pero no sirve". El botón "Buscar" (desktop y menú móvil, `SiteNav.tsx`) nunca tuvo `onClick` ni ninguna lógica detrás — era un placeholder visual desde que se armó el header, sin ninguna funcionalidad real.

## Objetivo

"Buscar" abre un buscador real: escribir un término y confirmar lleva a `/tienda` filtrado por ese texto (nombre, descripción o tipo de producto), sin cambiar el diseño visual aprobado (mismo look de paneles ya existentes: sand/bone, rounded-2xl, sombra).

## Archivos involucrados

- `app/components/SiteNav.tsx` — nuevo componente `SearchOverlay` (dialog con `useFocusTrap`, mismo patrón que `CartDrawer`/`MobileMenu`), botones "Buscar" (desktop y mobile) ahora sí disparan algo.
- `app/routes/tienda.tsx` — nuevo query param `?q=`, filtra `products` por nombre/descripción/tipo (normalizado sin acentos), input de búsqueda visible en la barra de filtros, heading dinámico (`Resultados para "…"`).

## Restricciones específicas de esta tarea

- No rediseñar el header ni la barra de filtros — el buscador reutiliza los mismos tokens de color/tipografía/radios ya usados en otros paneles del sitio.
- El overlay debe seguir el mismo estándar de accesibilidad ya establecido en la tarea 005 (`useFocusTrap`, `inert` cuando está cerrado, Escape cierra).

## Pasos sugeridos

1. `SearchOverlay` en `SiteNav.tsx`: dialog centrado arriba, con input + focus trap, `onSubmit` navega a `/tienda?q=...` y cierra el overlay.
2. Conectar el botón "Buscar" de desktop y el del menú móvil (este último debe cerrar el menú y abrir la búsqueda, no los dos abiertos a la vez).
3. En `tienda.tsx`: leer `q` de la URL, filtrar `products` (nombre/descripción/kind, normalizado con NFD para ignorar acentos), agregar un input de búsqueda visible en la barra de filtros (sincronizado con la URL via `replace: true` para no llenar el historial letra por letra), actualizar `heading` y `hasFilters`.

## Criterios de aceptación

- [x] Clic en "Buscar" (desktop) abre el overlay con foco automático en el input.
- [x] En mobile, "Buscar" del menú cierra el menú y abre el mismo overlay.
- [x] Escribir un término y enviar navega a `/tienda?q=<término>` con los resultados correctos filtrados.
- [x] El input de búsqueda dentro de `/tienda` filtra en vivo sin recargar la página, y sin llenar el historial de navegación por cada letra (`replace: true`).
- [x] "Limpiar filtros" también limpia la búsqueda; el heading cambia a `Resultados para "…"` cuando hay término activo.
- [x] Búsqueda sin acentos encuentra resultados con acentos (ej. "pantalon" encuentra "Pantalón").
- [x] `npm run typecheck` limpio, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se reutilizó `useFocusTrap` (patrón obligatorio para diálogos modales, tarea 005) en vez de inventar un manejo de foco/Escape nuevo.
- Regresiones encontradas: ninguna — el resto de filtros de `/tienda` (talla, color, tipo, orden) siguen funcionando igual; verificado con "Limpiar filtros" y con cada filtro combinado con búsqueda.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo (ya cubierto por el patrón de `useFocusTrap` existente).

## Pruebas manuales

- Verificado en el navegador (JS): overlay abre con foco en el input (desktop y mobile), Escape/clic en backdrop cierra y devuelve el foco.
- Buscar "legging" desde el header navega a `/tienda?q=legging` con 11 resultados correctos.
- Escribir directo en el input de `/tienda` actualiza resultados y URL sin recargar.
- "Limpiar filtros" con una búsqueda activa vuelve a "Toda la colección" con los 53 productos.
- Búsqueda sin resultados muestra el estado vacío ya existente ("Sin resultados").
- Captura visual: el overlay se ve integrado con la paleta/tipografía del sitio.
- Sin errores de consola.

## Notas de progreso

- 2026-09-17: Implementado y verificado en una sola sesión, a partir del reporte del usuario de que el botón de búsqueda no hacía nada.

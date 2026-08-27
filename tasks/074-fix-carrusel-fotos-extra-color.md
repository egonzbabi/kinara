---
id: 074
title: "Fix: el carrusel de fotos extra del color no aparecía hasta hacer clic en el color"
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

El usuario reportó que "ya no aparece el carrusel abajo de las fotos" en `/producto/:slug`. Al investigar (con capturas de pantalla reales del usuario) se confirmó que el carrusel de fotos extra de un color (tarea 019) nunca se rompió ni perdió datos — el problema era que ese carrusel solo se calculaba a partir del estado `color`, que empieza en `null` (el cliente debe elegir color a propósito antes de poder agregar al carrito). Aunque la foto principal ya mostraba el primer color disponible desde que carga la página (por diseño, para no mostrar la página vacía), el carrusel de fotos extra de ese mismo color no se mostraba hasta que el cliente hacía clic explícito en el círculo de color — algo nada obvio, porque la foto grande ya "parece" tener un color elegido.

## Objetivo

Si el color que ya se muestra por default en la foto principal (antes de que el cliente elija uno a propósito) tiene más de 1 foto, el carrusel de fotos extra aparece desde que carga la página — sin necesitar un clic primero.

## Archivos involucrados

- `app/routes/producto.$slug.tsx`: se agregó `displayColor` (el color ya mostrado por default: `color ?? product.colors[0]?.name`), y `colorPhotos`/el `aria-label` del carrusel ahora usan `displayColor` en vez de `color` directamente.

## Restricciones específicas de esta tarea

- **No cambia el flujo de compra**: `color` (el estado real, usado por `missingSelection` y el botón "Selecciona color y talla") sigue empezando en `null` — el cliente todavía tiene que elegir color a propósito antes de poder agregar al carrito. Solo cambió qué fotos se muestran antes de esa elección, no la lógica de selección/checkout.
- Se corrigió también el `aria-label` de los botones del carrusel ("Ver foto 2 de null" → "Ver foto 2 de Rosa"), que tenía el mismo bug.

## Criterios de aceptación

- [x] Al entrar a un producto con varios colores donde el primero (el que ya se muestra) tiene 2+ fotos, el carrusel de fotos extra aparece de inmediato, sin clic previo.
- [x] El botón "Selecciona color y talla" sigue exigiendo elegir color y talla a propósito — sin cambios ahí.
- [x] Los `aria-label` del carrusel usan el nombre de color correcto, nunca `null`.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca paleta, tipografía, layout ni copy; es puramente lógica de qué fotos se muestran y cuándo.
- Regresiones encontradas: ninguna — se probó en local que elegir un color distinto (Negro/Mulberry) sigue actualizando la foto principal y el carrusel correctamente, y que el botón de agregar al carrito sigue bloqueado hasta elegir color y talla.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Probado en local (`/producto/conjunto-mesh`, sin hacer clic en ningún color): confirmado en el árbol de accesibilidad que aparecen "Ver foto 2 de Rosa" y "Ver foto 3 de Rosa" desde la carga inicial, con "Color: Selecciona un color" todavía sin elegir (comportamiento de compra intacto).
- Confirmado con el usuario, vía captura de pantalla real de `kinara-ecommerce.vercel.app/producto/conjunto-mesh`, que en producción "Color: Selecciona un color" aparecía sin marcar y el carrusel no se veía — reproducido el mismo estado en local antes del fix, y confirmado que desaparece el problema después.

## Notas de progreso

- 2026-08-25/26: Encontrado tras una investigación larga con el usuario — se descartaron primero una regresión de código, un problema de datos (fotos perdidas) y un problema de despliegue (rama vieja conectada a Vercel) antes de llegar a la causa real con una captura de pantalla del usuario. El usuario pidió explícitamente el fix ("si ponlas desde el principio") tras confirmarse la causa.

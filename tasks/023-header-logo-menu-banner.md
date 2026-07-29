---
id: 023
title: "Header: menú principal debajo del logo KINARA, logo más grande, banner más lento"
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

El usuario pidió, por chat, 3 ajustes visuales al header y al banner superior:
1. El menú principal (Tienda, Top, Bottom...) está a la misma altura que el nombre "KINARA" — lo quiere en su propio renglón, debajo del logo.
2. El nombre "KINARA" debe verse más grande.
3. El banner de anuncios (marquee) se mueve muy rápido, lo quiere un poco más lento.

Esto es un cambio de layout/tipografía explícitamente pedido y aprobado por el usuario (dueño del diseño aprobado), por lo que aplica la excepción de `CLAUDE.md`: "sin permiso explícito y puntual del usuario para esa tarea".

## Objetivo

El header pasa a dos renglones: arriba el wordmark "KINARA" centrado y más grande junto con las utilidades (buscar/carrito); abajo, en su propio renglón, el menú de navegación centrado. El banner superior (`AnnouncementBar`) se desplaza a menor velocidad.

## Archivos involucrados

- `app/components/SiteNav.tsx`
- `app/components/AnnouncementBar.tsx` (o la animación en `app/app.css`, `--animate-marquee`)

## Restricciones específicas de esta tarea

- No tocar el menú móvil (`MobileMenu`) salvo que se rompa con el cambio — ya es un panel lateral aparte, no el problema reportado.
- Mantener todos los links y funcionalidad existentes (scroll header, botón volver en producto, buscar, carrito).

## Pasos sugeridos

1. Reestructurar `<header>` de `SiteNav.tsx` a dos filas: fila 1 = wordmark centrado (más grande) + utilidades a la derecha + burger a la izquierda en mobile; fila 2 = links de navegación centrados (solo desktop, ya que mobile usa el panel lateral).
2. Aumentar el tamaño de fuente del wordmark "KINARA".
3. Bajar la velocidad del marquee en `app.css` (`--animate-marquee`), aumentando la duración.
4. Verificar en el navegador desktop y mobile (~375px) que no se rompe el layout ni el sticky header.

## Criterios de aceptación

- [x] El menú de navegación aparece en su propio renglón, debajo del wordmark "KINARA", no a la misma altura.
- [x] El wordmark "KINARA" se ve visiblemente más grande que antes.
- [x] El banner superior se desplaza más lento que antes.
- [x] `npm run typecheck` pasa sin errores.
- [x] Verificado en el navegador en desktop y mobile (~375px), sin regresiones de layout.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno (cambio visual puntual, no un estándar nuevo).

## Pruebas manuales

- Cargar `/` y `/tienda` en desktop: confirmar 2 renglones en el header, wordmark grande, banner lento.
- Redimensionar a ~375px: confirmar que el burger/menú móvil sigue funcionando igual.

## Notas de progreso

- 2026-07-29: Tarea creada e implementada en la misma sesión a pedido directo del usuario por chat. Se reestructuró `SiteNav.tsx` en dos filas dentro del mismo `<header>` sticky: fila 1 (h-20) con burger/volver a la izquierda, wordmark "KINARA" centrado (de `text-[26px]` a `text-[40px]`) y utilidades (buscar/carrito) a la derecha; fila 2, un `<nav aria-label="Navegación principal">` propio con los links centrados, separado por un borde superior, visible solo en desktop (`hidden md:block`) — en mobile la navegación sigue viviendo en el panel lateral (`MobileMenu`), sin cambios ahí. Se aprovechó para mover el `<nav>` semántico a envolver solo los links reales (antes envolvía todo el header, incluyendo logo y utilidades). Se bajó la velocidad del marquee de `AnnouncementBar` de 36s a 55s (`--animate-marquee` en `app.css`). Verificado: `npm run typecheck` sin errores; en el navegador desktop (1280px) se ve el logo grande con el menú en su propio renglón debajo y el banner visiblemente más lento; en mobile (375px) el header de una sola fila y el panel lateral del burger funcionan igual que antes, sin regresiones.

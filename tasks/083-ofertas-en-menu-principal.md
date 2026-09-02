---
id: 083
title: "Enlace \"Ofertas\" en el menú principal"
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

El home ya tiene una sección "Ofertas" (productos con `isOnSale`), pero solo se ve si el visitante llega al home y baja hasta ahí — no había ninguna forma de llegar directo desde el menú principal, a diferencia de las demás categorías (Top, Bottom, Legging, etc.), que sí tienen su propio enlace.

## Objetivo

"Ofertas" aparece como una opción más del menú principal, y lleva a `/tienda` ya filtrado para mostrar solo los productos en oferta — mismo patrón que el resto del menú (cada opción es un filtro de `/tienda`, no un link a una sección del home).

## Archivos involucrados

- `app/components/SiteNav.tsx`: nuevo enlace `{ to: "/tienda?oferta=1", label: "Ofertas" }` en `LINKS`, justo después de "Tienda".
- `app/routes/tienda.tsx`: nuevo filtro `onlyOnSale` (lee `?oferta=1` de la URL) que reduce el listado a `p.isOnSale` — mismo patrón que los filtros ya existentes (`talla`, `color`, `tipo`).

## Restricciones específicas de esta tarea

- No se tocó la sección "Ofertas" del home — sigue igual, sigue siendo la vitrina principal para quien ya está en el home.
- Se eligió filtrar `/tienda` (coherente con cómo ya se comporta el resto del menú) en vez de un link `/#ofertas` a la sección del home — así "Ofertas" funciona igual sea cual sea la página en la que esté el visitante, no solo desde el home.
- Mismo estilo visual del menú ya aprobado — no se agregó color ni énfasis especial al enlace.

## Criterios de aceptación

- [x] "Ofertas" aparece en el menú principal (desktop y menú móvil, comparten el mismo `LINKS`).
- [x] Al hacer clic, `/tienda` muestra solo los productos con `isOnSale`.
- [x] El resto de los filtros de `/tienda` (talla, color, tipo, categoría) se pueden combinar con este sin romper nada.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — reutiliza exactamente el patrón visual y de filtrado ya aprobado, sin paleta ni layout nuevos.
- Regresiones encontradas: ninguna — se verificó en el navegador que el resto del menú y de los filtros de `/tienda` siguen funcionando igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: `/tienda?oferta=1` mostró correctamente los 5 productos en oferta del catálogo real (todos con precio tachado). El enlace "Ofertas" se ve en el menú principal, entre "Tienda" y "Top", con el mismo estilo que los demás.

## Notas de progreso

- 2026-08-27: Implementado en la misma sesión a pedido del usuario.

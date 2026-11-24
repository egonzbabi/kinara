---
id: 153
title: "Mostrar 'Agotado' cuando un color no tiene tallas disponibles"
status: in-progress
---

## Contexto

El stock real es por color + talla (`product.stockByVariant`). Hoy, si un color se queda sin ninguna talla, su muestra de color se ve igual que las demás y, al elegirlo, todas las tallas aparecen tachadas sin decir por qué (el texto "Agotado en <color>" solo sale como tooltip, invisible en celular); el botón sigue diciendo "Selecciona color y talla". Si TODOS los colores se agotan, `product.sizes` queda vacío y no se muestra ninguna talla ni aviso. La usuaria (2026-11-24) pidió que aparezca "Agotado" cuando no haya disponibilidad de tallas por color.

## Objetivo

Que se vea claramente "Agotado" en un color sin tallas disponibles (muestra de color, aviso, botón) y en el producto completo cuando se agotan todos sus colores, tanto en la página de producto como en la tarjeta (añadir rápido).

## Archivos involucrados

- `app/lib/availability.ts` (nuevo: `isColorSoldOut`, `isProductSoldOut`)
- `app/routes/producto.$slug.tsx`, `app/components/ProductCard.tsx`

## Restricciones específicas de esta tarea

- Es un cambio de comportamiento que la usuaria pidió; no se tocan colores, tipografías ni layout: solo se agrega el estado "Agotado" (muestra tachada, texto y botón).
- Un color agotado sigue pudiéndose seleccionar (para ver sus fotos), pero no se puede agregar al carrito; el checkout sigue validando el stock real server-side.
- Accesible: el estado no depende solo del color (texto visible + `aria-label`).

## Criterios de aceptación

- [ ] Muestra de un color sin ninguna talla con stock: marcada como agotada (tachada) y con `aria-label`/`title` "<color> — Agotado".
- [ ] Al elegir un color agotado: se ve "Agotado" junto al nombre del color y un aviso visible bajo las tallas; el botón dice "Agotado en este color" y no agrega.
- [ ] Combinación color+talla agotada dentro de un color con otras tallas: sigue como hoy ("Agotado en esta combinación").
- [ ] Producto con todos los colores agotados: botón "Agotado" y etiqueta "Agotado" en la tarjeta; no se puede agregar.
- [ ] Lo mismo en el añadir rápido de la tarjeta.
- [ ] Talla sin stock (en el color elegido, o en todos los colores si aún no hay color): visible en los botones de talla con la palabra "Agotado", incluso si ningún color la tiene (`listedSizes` en lugar de `sizes`); en la tarjeta, línea "Agotado: S, M".
- [ ] Typecheck y build sin errores; probado a 375 px.

## Verificación de requisitos anteriores

- Pendiente de revisar contra `REQUISITOS.md` al cerrar.

## Notas de progreso

- 2026-11-24: tarea creada; revisado el código (`stockByVariant` ya existe; tallas tachadas con tooltip; sin estado de color agotado).
- 2026-11-24 (2): implementado en local, sin subir. `app/lib/availability.ts` (`isColorSoldOut`, `isProductSoldOut`); página de producto y añadir rápido de la tarjeta: muestra de color agotada (atenuada + línea diagonal + `aria-label` "<color> — Agotado"), "· Agotado" junto al nombre del color, aviso visible bajo las tallas, botón "Agotado en este color" (o "Agotado" si todos los colores se agotaron; etiqueta "Agotado" en la tarjeta). Probado en local a 375 px con datos reales (Sculpt Flare Legging, color Vino agotado; Calcetines Mérida, Negro agotado). El caso "producto con todos los colores agotados" no existe hoy en el catálogo: solo verificado por lógica y typecheck. Typecheck y build limpios. Falta: "sí súbelo", verificar en producción y cerrar.
- 2026-11-24 (3): la usuaria pidió también marcar "Agotado" en las tallas sin stock. Nuevo `Product.listedSizes` (todas las tallas existentes, con o sin stock) y `isSizeSoldOut`; el botón de talla agotada muestra "Agotado" (letra tachada, palabra sin tachar) y la tarjeta una línea "Agotado: …". Probado en local con datos reales (All Out Pants: S agotada en todos los colores; Lilia Chaqueta: S agotada solo en Rey). Falta: "sí súbelo" y verificar en producción.
- 2026-11-24 (4): la usuaria pidió que la página de producto abra con el color de la foto ya elegido (para ver el "Agotado" de las tallas sin tener que elegir color). `producto.$slug.tsx`: color inicial = primer color con tallas disponibles (si el primero está agotado se salta al siguiente; la foto sigue a la selección); el botón dice "Selecciona tu talla" cuando solo falta la talla. El añadir rápido de las tarjetas no cambió. Probado en local (Lilia Chaqueta: abre con Rey y la S ya sale Agotado). Falta: verificar en producción y cerrar.

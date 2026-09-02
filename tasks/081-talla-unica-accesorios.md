---
id: 081
title: "Talla \"Única\" para accesorios (productos sin S/M/L/XL)"
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

El usuario empezó a dar de alta accesorios (bolsas, gorras, etc.) y encontró que el sistema no tenía forma de manejarlos: `product_variants.size` tenía una restricción fija en la base de datos que solo aceptaba S/M/L/XL — no había ninguna talla para un producto que no las necesita. El filtro de tallas de `/tienda` ya traía "Única" en su lista de opciones desde antes, pero nunca se conectó con la base de datos ni con el formulario de admin — era una opción "fantasma" que nunca podía coincidir con ningún producto real.

## Objetivo

Se puede dar de alta un accesorio con una sola talla ("Única") por color, tanto desde el admin como reflejado correctamente en la tienda pública (filtro, selector de talla, carrito).

## Archivos involucrados

- `supabase/migrations/20260827000000_accessory_size.sql` (nueva): agrega `'Única'` a la restricción `check` de `size` en las 3 tablas que la tienen (`product_variants`, `inventory_movements`, `inventory_counts`). Aplicada a la base real con `supabase db push --linked`.
- `app/lib/catalog-constants.ts`: nuevo `ACCESSORY_SIZE = "Única"` y el tipo compartido `ProductSize = (typeof SIZE_ORDER)[number] | "Única"` — reemplaza la unión `"S" | "M" | "L" | "XL"` que estaba repetida a mano en 6 archivos distintos.
- `app/lib/catalog.ts`: el cálculo de `sizes` (tallas disponibles) del catálogo público ahora evalúa contra `[...SIZE_ORDER, ACCESSORY_SIZE]`, no solo contra `SIZE_ORDER` — si no, un producto con talla "Única" jamás aparecía con ninguna talla disponible en la tienda, aunque el dato ya estuviera bien guardado.
- `app/lib/admin-inventory-groups.ts`: la matriz de `/admin/inventario` y `/admin/inventario/conteo` ahora incluye "Única" como una columna más (siempre, no solo cuando hay accesorios) — mismo criterio ya usado ahí (mostrar todas las tallas posibles, tengan o no stock).
- `app/components/admin/ProductForm.tsx`: nuevo `isAccessory = category === "accesorios"` (derivado, no un checkbox aparte). Cuando es accesorio, cada color solo muestra la talla "Única" en vez de las 4 de siempre (`sizeTemplate`/`emptyColor`/`sizesFor` ahora reciben ese flag). Un `useEffect` re-arma las tallas de todos los colores si se cambia la categoría a/desde "accesorios" en pleno formulario.
- `app/lib/admin-catalog.server.ts`, `app/lib/admin-inventory-movements.server.ts`, `app/lib/admin-inventory-counts.server.ts`, `app/lib/orders.server.ts`, `app/routes/admin.inventario.movimientos.tsx`, `app/lib/supabase.types.ts`: la unión `"S" | "M" | "L" | "XL"` repetida a mano se reemplazó por el tipo compartido `ProductSize` (o, en `supabase.types.ts`, que es autocontenido a propósito, se extendió la unión literal ahí mismo).

## Restricciones específicas de esta tarea

- **Se deriva de la categoría, no es una opción manual**: un producto de categoría "accesorios" siempre usa talla única; no hay forma de que un accesorio tenga tallas S/M/L/XL reales en este cambio — si algún día se necesita eso (ej. guantes con talla), sería una decisión aparte, no cubierta aquí.
- **No se tocó el flujo de "Tallas reducidas"**: el toggle `showReducedSizesNotice` (ya existente por producto) sigue funcionando igual — se verificó que, apagado, un accesorio de talla única no muestra ningún texto de "Tallas reducidas" junto a "Talla" (se probó con un producto real).
- **`/admin/inventario` y `/admin/inventario/conteo` ahora siempre muestran 5 columnas** (S/M/L/XL/Única) en vez de 4 — es un cambio visual menor en pantallas internas de admin (no en el sitio público), necesario para que el stock de accesorios sea visible ahí; se optó por esto en vez de columnas dinámicas por simplicidad, dado que ya era el criterio existente ("mostrar siempre todas las tallas posibles").

## Criterios de aceptación

- [x] Se puede crear un producto de categoría "accesorios" con un color y talla "Única" con stock, sin errores.
- [x] Ese producto aparece correctamente en `/admin/inventario` con su columna "Única".
- [x] En la tienda pública, el producto muestra "Talla: Única" con un solo botón, se puede agregar al carrito, y aparece correctamente en el filtro de tallas de `/tienda` (que ya tenía "Única" como opción).
- [x] Un producto de ropa normal (categoría mujer/hombre) sigue mostrando exactamente las 4 tallas de siempre, sin ningún cambio visible.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se tocó paleta, tipografía ni el diseño ya aprobado del sitio público; la única superficie visual que cambia es una columna extra en 2 pantallas internas de admin.
- Regresiones encontradas: ninguna — se probó contra un producto de prueba real, de punta a punta (creado, verificado en `/admin/inventario`, verificado en vivo en la tienda pública con el navegador, y borrado por completo al terminar, incluyendo su movimiento de carga inicial).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Migración aplicada a la base real; confirmado con un insert/delete de prueba que `product_variants` ya acepta `size = 'Única'`.
- Prueba de punta a punta con un producto real ("BOLSA PRUEBA ZZZ", categoría accesorios, color Café, talla Única, stock 4, `showReducedSizesNotice: false`):
  - Se creó correctamente vía `createProduct` — apareció en `listInventory()` con `size: 'Única'`.
  - Se generó su movimiento de "Carga inicial de producto" correctamente (tarea 079).
  - En el navegador, `/producto/bolsa-prueba-zzz` mostró "Talla" → "Única" (un solo botón), sin ningún texto de "Tallas reducidas", con "Añadir al carrito de compras · $350.00" disponible de inmediato (color y talla se auto-seleccionan solos al haber una sola opción de cada uno).
  - Se borró el producto completo (variantes, imágenes, movimiento de carga inicial) al terminar — no queda nada de prueba en la base real.

## Notas de progreso

- 2026-08-27: Implementado en la misma sesión en la que el usuario reportó el bloqueo al intentar dar de alta accesorios — se explicó primero la causa (restricción fija en la base + el filtro de tienda que ya anticipaba "Única" sin estar conectada) antes de construir, y se confirmó "sí, hazlo".

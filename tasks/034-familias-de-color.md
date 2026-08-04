---
id: 034
title: "Filtro de color en /tienda: agrupar por familia + reflejar el color en la foto"
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

El usuario reportó que el filtro de color de `/tienda` "no funciona". Al investigar, la lógica de filtrado en sí **sí funcionaba** (la lista de productos se reducía correctamente al elegir un color), pero `ProductCard` siempre mostraba `product.gallery[0]` (la foto genérica) sin importar qué color estuviera filtrado — así que al filtrar por, por ejemplo, "Negro", los productos mostrados seguían viéndose en sus fotos de portada de cualquier color (azul, café, etc.), dando la impresión de que el filtro no hacía nada.

Justo después, el usuario pidió además que el filtro no mostrara los 36 nombres de color exactos del catálogo por separado (ej. "Palo De Rosa", "Fresa", "Melon", "Rosa" como 4 puntos casi idénticos), sino agrupados por familia visual (todos los vinos juntos, todos los rosas juntos, etc.).

## Objetivo

1. El filtro de `/tienda` muestra ~11 familias de color (Blanco, Negro, Gris, Café, Rojo, Vino, Rosa, Morado, Azul, Turquesa, Verde) en vez de 36 colores exactos.
2. Al filtrar por una familia, cada tarjeta de producto muestra — cuando el producto tiene foto propia para alguno de sus colores de esa familia — esa foto, no la genérica. Nunca la foto de un color que no pertenece a la familia filtrada.

## Archivos involucrados

- `app/lib/colorFamilies.ts` (nuevo) — mapa color exacto → familia, hex representativo por familia, orden fijo del filtro.
- `app/routes/tienda.tsx` — swatches por familia en vez de por color exacto; filtro compara `getColorFamily(color) ∈ familias seleccionadas`.
- `app/components/ProductGrid.tsx` / `app/components/ProductCard.tsx` — nueva prop `activeFamily`; cada tarjeta resuelve cuál de sus propios colores pertenece a esa familia y muestra su foto si existe.

## Restricciones específicas de esta tarea

- La agrupación en familias es por criterio **visual** (hue/saturación/luminosidad del hex real), no solo por el nombre — verificado contra la foto real del producto cuando el hex y la foto no coincidían (pasó con "Lila": por hex parecía rosado pero en la foto del producto es claramente morado).
- Nunca mostrar la foto de un color que no es el filtrado — si el producto no tiene foto propia para ningún color de la familia activa, se cae a la foto genérica (mismo patrón ya establecido en tareas 009/018, nunca "la foto de otro color").
- Un color nuevo que se dé de alta sin actualizar el mapa de familias no debe romper el filtro — cae en su propia familia (mismo nombre) como fallback.

## Pasos sugeridos

1. Extraer los 36 nombres de color + hex reales de la base de datos.
2. Convertir cada hex a HSL para informar la agrupación, y ajustar a mano contra criterio de retail en español (ej. "Militar"/"Olivo" a Verde aunque el nombre no lo diga).
3. Crear `colorFamilies.ts` con el mapa, los hex representativos, y el orden fijo.
4. `tienda.tsx`: swatches por familia, filtro por familia, pasar `activeFamily` a `ProductGrid`.
5. `ProductCard`: resolver `matchingColor` = el color propio del producto que pertenece a `activeFamily`, usarlo para elegir la foto y como color por defecto del "Añadir rápido".
6. Verificar visualmente cada familia contra las fotos reales de los productos filtrados, corrigiendo cualquier caso donde el hex no coincida con cómo se ve la prenda en foto.

## Criterios de aceptación

- [x] El filtro de `/tienda` muestra ~11 swatches de familia en vez de 36 colores exactos.
- [x] Al filtrar por una familia, las tarjetas de producto muestran la foto del color correspondiente cuando existe (no la genérica ni la de otro color).
- [x] Ningún color queda fuera del mapa de familias (36/36 mapeados).
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador (desktop y mobile) sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — respeta el requisito de tarea 009 "nunca mostrar la foto de otro color, mejor sin foto que la equivocada" (sección Datos/Supabase), extendiéndolo del contexto de producto individual al de listado filtrado.
- Regresiones encontradas: ninguna. Se detectó y corrigió en la misma sesión un error propio de esta tarea (Lila mal clasificado en Rosa por depender solo del hue del hex) antes de cerrarla.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — ver abajo.

## Pruebas manuales

- `/tienda` sin filtro: confirmado que la barra de color muestra 11 swatches (antes 36).
- Filtro por "Rosa": 23 artículos, todas las fotos mostradas en tonos rosa/dusty rose reales.
- Filtro por "Morado": 11 artículos, incluyendo el AIRLIFT SHORT en "Lila" (corregido), todas las fotos en tonos lavanda/morado reales.
- Filtro por "Turquesa": 7 artículos. Filtro por "Café": 10 artículos, fotos en tonos café/marrón reales.
- Mobile (375px): los 11 swatches se acomodan en 2 filas, sin overflow.
- Sin errores de consola (se verificó en una pestaña nueva — los errores vistos en la pestaña de desarrollo eran de estados intermedios de HMR durante la edición, no del código final).

## Notas de progreso

- 2026-07-30: Tarea creada e implementada en la misma sesión, a partir de un reporte de bug del usuario ("no funciona el filtro por color") que llevó a encontrar la causa real (fotos de tarjeta no reflejaban el color filtrado) y, de inmediato, a una segunda solicitud del usuario de agrupar por familia. Ambas se resolvieron juntas ya que la segunda cambia directamente cómo se resuelve la primera (de "color exacto" a "color del producto que pertenece a la familia filtrada").
- 2026-07-30 (fix adicional): El usuario reportó, ya con el fix desplegado en producción, que filtrar por "Blanco" mostraba SET ESSENTIAL con foto rosa. Causa: el producto tiene 2 colores en la familia Blanco (Ivory y Agua), pero solo "Agua" tiene foto propia — `product.colors.find()` devolvía "Ivory" (el primero en el orden de variantes) sin foto, así que caía a la foto genérica del producto, que resulta ser la variante "Palo De Rosa". Se corrigió `ProductCard` para que, cuando hay varios colores del producto en la misma familia, prefiera el primero que sí tenga foto propia (`familyColorWithPhoto`) en vez de simplemente el primero que aparezca — y solo cae a la foto genérica si *ninguno* de los colores de esa familia tiene foto. Verificado: SET ESSENTIAL con filtro "Blanco" ahora muestra la foto real de "Agua", no la genérica.
- 2026-07-30 (selección única): El usuario notó que seleccionar 2 familias a la vez (ej. Blanco y Negro) hacía que las tarjetas mostraran "todos los colores" — porque con 2+ familias activas `activeFamily` queda `undefined` (solo se resuelve con exactamente 1 seleccionada) y cada tarjeta cae a su foto genérica. En vez de resolver la ambigüedad de qué foto mostrar con 2+ colores activos, el usuario pidió que el filtro de color sea de selección única. Se cambió `toggle("color", ...)` (multi-select, acumulaba en la URL como `color=Blanco,Negro`) por `selectColorFamily()`: click en una familia nueva reemplaza la anterior (`?color=Negro`, no se acumula), click en la misma la quita. La talla sigue siendo multi-select (no se tocó). Verificado en el navegador: clic en Blanco → clic en Negro reemplaza (no acumula); clic en Negro de nuevo lo quita.

---
id: 082
title: "Talla única: checkbox independiente de la categoría (no todo accesorio es talla única)"
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

La tarea 081 activaba "talla única" automáticamente cuando la categoría del producto era "accesorios". El usuario señaló que eso no es correcto: los guantes, que también van en "accesorios", **sí tienen talla** (S/M/L). No todos los accesorios son de talla única (una bolsa o una gorra sí, unos guantes no), así que la categoría no es un buen indicador de si un producto usa tallas reales o no.

## Objetivo

"Talla única" es una elección explícita del admin (un checkbox), independiente de la categoría — cualquier producto, sea o no accesorio, puede marcarse como talla única si corresponde.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx`:
  - Se quitó `isAccessory = category === "accesorios"` (derivado).
  - Nuevo estado `singleSize`, con un checkbox visible **"Talla única (sin S/M/L/XL)"** en la sección de Colores, con una nota aclarando que no todos los accesorios aplican.
  - Al editar un producto ya existente, el checkbox se precarga solo mirando si ya tenía guardada la talla "Única" en algún color (no por su categoría).
  - El `useEffect` que re-arma las tallas de todos los colores ahora depende de este checkbox, no de la categoría.

## Restricciones específicas de esta tarea

- No se tocó nada de la base de datos ni del resto del sistema (tarea 081: migración, tipo `ProductSize`, columna "Única" en las matrices de inventario, cálculo de tallas del catálogo público) — todo eso sigue igual, sigue siendo "Única" como concepto. Lo único que cambió es **quién decide** cuándo aplica: antes la categoría, ahora un checkbox explícito.
- El checkbox vive en la sección de Colores (no junto a Categoría) porque es lo que afecta directamente — mismo criterio de ubicación que otros toggles de esta pantalla ("Tallas reducidas" está junto a lo que afecta).

## Criterios de aceptación

- [x] Un producto de categoría "accesorios" con el checkbox de talla única **sin marcar** sigue mostrando las 4 tallas normales (S/M/L/XL) — ej. guantes.
- [x] Un producto de cualquier categoría con el checkbox marcado usa "Única" — no hace falta que sea "accesorios".
- [x] Al editar un producto que ya tenía talla "Única" guardada, el checkbox aparece marcado solo, sin que el admin tenga que volver a marcarlo.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismo estilo de checkbox+nota ya usado en el resto del formulario (`showReducedSizesNotice`), sin paleta ni tipografía nueva.
- Regresiones encontradas: ninguna — se confirmó que `/admin/productos/nuevo` sigue cargando sin errores de servidor.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: `/admin/productos/nuevo` (sin sesión) carga sin errores de servidor.
- El resto de la lógica (guardado, tipo `ProductSize`, columna "Única" en inventario) ya se había probado de punta a punta contra la base real en la tarea 081 y no se tocó aquí — este cambio es puramente sobre qué dispara el modo talla única en el formulario, no sobre cómo se guarda ni se muestra después.

## Notas de progreso

- 2026-08-27: Corregido en la misma sesión, inmediatamente después de la tarea 081, cuando el usuario señaló el caso de los guantes.

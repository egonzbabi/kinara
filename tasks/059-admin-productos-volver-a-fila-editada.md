---
id: 059
title: "Admin/Productos: al guardar, la lista regresa a la fila del producto editado"
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

Al editar un producto en `/admin/productos/:id` y guardar, la acción redirige a `/admin/productos` — como es una redirección de servidor (nueva entrada de navegación, no "atrás" del navegador), la lista siempre vuelve al inicio, sin importar en qué parte de la tabla estaba el producto editado. El usuario pidió que, al volver, la lista lo lleve directo al producto que estaba editando.

## Objetivo

Después de guardar (editar o crear un producto), la lista de `/admin/productos` hace scroll automático hasta la fila de ese producto y la resalta brevemente (fondo `clay/10` que se desvanece en 2s), para no tener que buscarlo de nuevo a mano en una lista larga.

## Archivos involucrados

- `app/routes/admin.productos.$id.tsx`: el `redirect` tras `updateProduct` pasa de `/admin/productos` a `/admin/productos?editado=${params.id}`.
- `app/routes/admin.productos.nuevo.tsx`: mismo patrón — `createProduct` ya devolvía el `id` del producto creado, ahora se usa para el redirect `?editado=${id}` (antes se descartaba el valor de retorno).
- `app/routes/admin.productos.tsx`:
  - `useSearchParams` lee `?editado=<id>` al montar; si está presente, hace `scrollIntoView({ block: "center" })` sobre `#producto-<id>`, marca ese id como `highlightId` (se apaga solo a los 2s), y limpia el query param de la URL (`replace: true`, para que un refresh no repita el scroll/resaltado).
  - Cada `<tr>` de la tabla ahora tiene `id={producto-${p.id}}` y una clase condicional `bg-clay/10` con `transition-colors duration-1000` cuando coincide con `highlightId`.

## Restricciones específicas de esta tarea

- No se guarda posición de scroll en píxeles ni se toca `ScrollRestoration` global (ya presente en `app/root.tsx`, cubre la navegación "atrás" del navegador) — este cambio cubre específicamente el caso que `ScrollRestoration` no cubre: volver desde un `redirect` de servidor tras guardar, que es una navegación nueva, no un "atrás".
- El resaltado usa el mismo tono `clay` ya usado en el resto del admin (ej. badge "Borrador"), no un color nuevo.
- Si el producto editado quedó fuera de los filtros de búsqueda/categoría de la lista (no debería pasar en el flujo normal, ya que `search`/`category` son estado local que se reinicia en cada carga completa), el `scrollIntoView` simplemente no encuentra el elemento y no hace nada — no rompe la página.

## Criterios de aceptación

- [x] Al guardar la edición de un producto, la lista hace scroll hasta esa fila.
- [x] La fila se resalta brevemente y el resaltado se apaga solo.
- [x] La URL vuelve a `/admin/productos` limpia (sin el query param) después del scroll, para que un refresh no repita el efecto.
- [x] Al crear un producto nuevo, la lista hace lo mismo con el producto recién creado.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia paleta, tipografía ni layout de la tabla existente, solo agrega comportamiento de scroll/resaltado temporal.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Se verificó en el navegador que `/admin/productos` sigue redirigiendo correctamente a la pantalla de login sin errores de consola.
- **No verificado en vivo el flujo completo de scroll/resaltado** — no se cuenta con credenciales de admin para iniciar sesión (y no corresponde crear una cuenta nueva). La lógica (mismo patrón que `useSearchParams` + `scrollIntoView` + limpieza de URL con `replace: true`) es estándar de React Router y no depende de datos del catálogo — se recomienda que el usuario confirme visualmente al editar un producto que esté abajo en la lista.

## Notas de progreso

- 2026-08-17: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario.

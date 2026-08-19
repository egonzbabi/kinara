---
id: 067
title: "Fix: al cambiar un SKU existente en el admin, el auto-llenado lo revertía"
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

El usuario reportó: "si cambio el sku no se guarda" en `/admin/productos/:id`.

## Causa

En `ProductForm.tsx` hay un `useEffect` que auto-completa el SKU (`modelo`) de cualquier talla con stock que todavía no tenga uno, usando el patrón `${modeloBase}-${colorCode}-${talla}`. La condición para autocompletar era solo `stock > 0 && !modelo` — sin distinguir "esta talla es nueva y nunca tuvo SKU" de "el admin acaba de borrar el SKU existente para escribir uno distinto".

Como el campo es controlado y el efecto corre en cada cambio de `colors`, al borrar un SKU existente para reemplazarlo, el efecto detectaba el campo vacío en el siguiente render y lo rellenaba de inmediato con el mismo valor de antes — el admin veía que su cambio "no pegaba" (se revertía solo), y al guardar, se mandaba el SKU viejo sin darse cuenta.

## Objetivo

Editar un SKU existente (borrarlo y escribir uno nuevo) funciona sin que el auto-llenado lo revierta, sin romper el auto-llenado real para tallas nuevas que nunca tuvieron SKU.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx`: nuevo estado `touchedModelos: Set<string>` (clave `"${colorIndex}:${talla}"`) — mismo patrón ya usado para el campo de slug (`slugTouched`, que evita que el slug se regenere solo una vez que el admin lo edita a mano). `updateModelo` marca la talla como "tocada" en cuanto el admin escribe algo en ese campo (incluso al vaciarlo). El `useEffect` de auto-llenado ahora también exige `!touchedModelos.has(key)` — una vez que el admin tocó esa talla, el auto-llenado nunca vuelve a escribir ahí, así el campo se quede momentáneamente vacío mientras retipea.

## Restricciones específicas de esta tarea

- No se tocó el comportamiento para tallas nuevas (sin SKU, recién dadas de alta con stock) — el auto-llenado sigue funcionando igual que antes para esos casos, que es su propósito original.
- `touchedModelos` se resetea naturalmente al recargar la página (es estado de sesión de edición, no persistido) — no hace falta guardarlo en ningún lado, solo necesita sobrevivir mientras el admin edita el formulario abierto.

## Criterios de aceptación

- [x] Borrar un SKU existente y escribir uno nuevo no lo revierte al valor anterior.
- [x] Una talla nueva (sin SKU, con stock recién puesto) se sigue auto-completando igual que antes.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia diseño ni layout, solo corrige un bug de estado en un formulario ya existente.
- Regresiones encontradas: ninguna — la lógica de auto-llenado para tallas nuevas queda exactamente igual, solo se le agregó una condición adicional.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Revisión de código línea por línea del efecto y del handler `updateModelo` para confirmar que la clave de "tocado" se marca en el momento correcto (primer `onChange`, antes de que el efecto pueda volver a correr) y que el efecto respeta esa marca incluso con el campo vacío.
- En el navegador: `/admin/productos/nuevo` carga sin errores de consola (no se cuenta con credenciales de admin para reproducir la edición en vivo — mismo caso que las tareas 058/059/060/064/066).

## Notas de progreso

- 2026-08-19: Bug reportado y corregido en la misma sesión.

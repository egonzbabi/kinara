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

## Causa (dos bugs distintos del mismo síntoma)

**Primer intento (insuficiente, el usuario reportó "SIGUE SIN ACTUALIZAR"):** en `ProductForm.tsx` había un `useEffect` que auto-completaba el SKU (`modelo`) de cualquier talla con stock que todavía no tuviera uno. La condición era `stock > 0 && !modelo` — solo tocaba campos vacíos. Se agregó un `touchedModelos` para no revertir un campo que el admin acababa de vaciar para retipear (ver commit 9a22cc9) — arreglaba el caso de editar un SKU individual por talla, pero no era la causa principal que reportaba el usuario.

**Causa real:** el formulario tiene DOS lugares con la palabra "SKU" — el campo grande de arriba ("SKU — código base") y el campo chico por cada talla. El campo de arriba solo se usaba para auto-completar tallas que **todavía no tenían SKU** (`!s.modelo`). Si una talla YA tenía un SKU cargado (el caso normal en un producto existente), cambiar el código base de arriba **nunca lo actualizaba** — el admin cambiaba "3322" por "9999" esperando que se reflejara en todas las tallas, y como todas ya tenían valor, ninguna se tocaba. Eso es exactamente "cambio el SKU y me deja el anterior".

## Objetivo

1. Editar un SKU existente por talla (borrarlo y escribir uno nuevo) funciona sin que el auto-llenado lo revierta.
2. Cambiar el código base de arriba **sí actualiza** el SKU de todas las tallas que lo siguen automáticamente, no solo las vacías.
3. Ninguno de los dos casos pisa una talla que el admin editó a mano directamente.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx`:
  - `touchedModelos: Set<string>` (clave `"${colorIndex}:${talla}"`) — mismo patrón ya usado para el campo de slug (`slugTouched`). `updateModelo` marca la talla como "tocada" en cuanto el admin escribe algo en ese campo.
  - El `useEffect` de auto-llenado quitó la condición `!s.modelo` — ahora compara el valor generado (`${modeloBase}-${colorCode}-${talla}`) contra el valor actual y lo actualiza si difieren, para cualquier talla con stock que no esté en `touchedModelos`. Esto cubre los dos casos: talla nueva sin SKU (como antes) **y** talla existente cuyo SKU debe seguir al código base cuando este cambia (el caso que faltaba).
  - Texto de ayuda de la sección "SKU" actualizado para explicar que cambiar el código base sí actualiza las tallas existentes, salvo las editadas a mano.

## Restricciones específicas de esta tarea

- El efecto sigue sin tocar nunca una talla en `touchedModelos` — el admin puede seguir poniendo un código distinto en una talla puntual y ese valor sobrevive a cualquier cambio futuro del código base.
- Verificado con una simulación aislada de la lógica exacta (fuera de React, en un script Node desechable) cubriendo: montaje inicial de un producto ya cargado (no debe cambiar nada), cambio de código base (debe cascadear a todas las tallas no tocadas), edición manual de una talla puntual, un segundo cambio de código base (la talla tocada debe sobrevivir, las demás deben seguir el nuevo código), y estabilidad (correr el efecto de nuevo sin cambios no debe generar más cambios — descarta un loop infinito). Las 5 verificaciones dieron el resultado esperado.
- `touchedModelos` se resetea naturalmente al recargar la página (es estado de sesión de edición, no persistido).

## Criterios de aceptación

- [x] Borrar un SKU existente y escribir uno nuevo no lo revierte al valor anterior.
- [x] Cambiar el código base actualiza el SKU de las tallas existentes que no se editaron a mano.
- [x] Una talla editada a mano nunca se sobreescribe, ni por el auto-llenado inicial ni por un cambio posterior del código base.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia diseño ni layout, solo corrige un bug de estado en un formulario ya existente.
- Regresiones encontradas: ninguna — la lógica de auto-llenado para tallas nuevas queda exactamente igual, solo se le agregó una condición adicional.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Simulación aislada de la lógica exacta del efecto (Node, script desechable) — las 5 verificaciones del escenario real (mount / cambio de base / edición manual / segundo cambio de base / estabilidad) dieron el resultado esperado (ver arriba).
- En el navegador: `/admin/productos/nuevo` carga sin errores de consola (no se cuenta con credenciales de admin para reproducir la edición en vivo — mismo caso que las tareas 058/059/060/064/066).

## Notas de progreso

- 2026-08-19: Bug reportado y "corregido" con un primer fix insuficiente (commit 9a22cc9) que solo cubría la edición manual talla por talla. El usuario reportó que seguía sin funcionar ("SIGUE SIN ACTUALIZAR el sku me deja el anterior"), lo que llevó a encontrar la causa real: el campo de código base nunca actualizaba tallas que ya tenían SKU. Se corrigió en la misma sesión y se verificó con una simulación aislada antes de reportarlo como resuelto, para no repetir el mismo error de confianza sin evidencia.

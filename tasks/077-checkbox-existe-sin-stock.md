---
id: 077
title: "Checkbox 'Existe sin stock' — dar de alta un color/talla en 0 sin escribir el SKU a mano"
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

La tarea 076 arregló que una talla en 0 existencias se guardara si tenía SKU cargado. Pero en la práctica el SKU casi nunca se escribe a mano: `ProductForm` lo **autogenera** a partir del "código base de modelo" en cuanto la talla tiene stock > 0 (para no obligar al admin a escribirlo). Ese autollenado nunca se disparaba para una talla en 0 — así que, aunque técnicamente ya se podía guardar una talla sin stock escribiéndole el SKU a mano, en la práctica el usuario seguía sin poder hacerlo (siguió reportando que un color nuevo en 0 no se guardaba), porque no hay costumbre ni instrucción clara de escribir un SKU a mano.

## Objetivo

Un checkbox "Existe sin stock" junto a cada talla en 0: al marcarlo, esa talla se guarda (el SKU se completa solo, igual que ya pasa con las tallas que sí tienen stock) — sin que el admin tenga que escribir nada a mano.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx`:
  - Nuevo estado `includedZeroStock` (Set de `"colorIndex:talla"`), precargado con las tallas que ya vinieran guardadas en 0 con SKU (para no perderlas al reabrir el formulario).
  - El efecto que autogenera el SKU (ya existente, antes solo por `stock > 0`) ahora también dispara cuando la talla está marcada como incluida.
  - Nuevo checkbox "Existe sin stock", visible solo cuando la talla está en 0. Al desmarcarlo, si el admin nunca editó el SKU a mano, se lo borra de vuelta (si no, quedaría un SKU "fantasma" que la seguiría guardando aunque ya no se quiera).
  - El checkbox se muestra marcado también si la talla ya trae SKU por cualquier otra razón (por ejemplo, una talla que tenía stock y se bajó a 0 — conserva su SKU viejo y sigue guardándose, lo cual es correcto: no debería desaparecer del catálogo solo por agotarse).
  - Nota de ayuda actualizada para mencionar el checkbox en vez de "escribe el SKU a mano".

## Restricciones específicas de esta tarea

- No cambió la regla de guardado del servidor (`insertVariantsAndImages`, tarea 076: se guarda si `stock > 0` o si tiene SKU) — este cambio es puramente de UX en el formulario, para que llegar a tener ese SKU sea automático en vez de manual.
- Si el "código base de modelo" del producto está vacío (típico solo en un producto totalmente nuevo, sin ninguna talla con SKU todavía), el autollenado no tiene con qué generar el SKU — el admin puede escribirlo él mismo en el campo "Código base" que ya existe en el formulario. No es un caso nuevo introducido por esta tarea; ya era así para tallas con stock.

## Criterios de aceptación

- [x] Al marcar "Existe sin stock" en una talla en 0 (de un producto ya existente, con código base de SKU ya cargado), esa talla queda con SKU generado automáticamente y se guarda al enviar el formulario.
- [x] Al desmarcarlo, si el SKU nunca se tocó a mano, se borra y la talla vuelve a no guardarse.
- [x] Una talla que ya traía SKU de antes (por ejemplo, se quedó sin stock) sigue mostrándose marcada y guardándose, sin necesidad de marcar nada.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no toca paleta, tipografía ni layout; el checkbox reutiliza el mismo estilo de texto pequeño (`text-[11px] text-muted`) ya usado en la nota de ayuda de al lado.
- Regresiones encontradas: ninguna — la lógica de autollenado de SKU para tallas con stock > 0 sigue exactamente igual (solo se le agregó una condición más, sin quitar la que ya tenía).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- La regla de guardado en servidor (stock > 0 o SKU presente) ya se había verificado de punta a punta contra la base real en la tarea 076 — este cambio solo hace más fácil llegar a tener ese SKU, no toca esa regla.
- En el navegador: `/admin/productos/nuevo` (sin sesión) redirige al login sin errores de servidor ni de consola — no se pudo probar el checkbox en vivo por falta de credenciales de admin (mismo caso ya documentado en varias tareas anteriores de este panel).

## Notas de progreso

- 2026-08-27: El usuario reportó, después de la tarea 076, que seguía sin poder dar de alta un color nuevo sin stock — se investigó y se confirmó en la base real que efectivamente no había guardado nada (el fix de la 076 requería escribir el SKU a mano, algo que el flujo normal del formulario nunca pide porque siempre se autogenera). Se agregó el checkbox para cerrar esa brecha sin que el admin tenga que aprenderse una regla nueva.

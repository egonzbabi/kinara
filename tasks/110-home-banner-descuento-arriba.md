---
id: 110
title: "Home: banner de 10% de descuento (registro) justo debajo del hero"
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

A pedido explícito del usuario: subir la sección de "Regístrate para obtener el descuento" (`WelcomeDiscountBanner`, "Llévate 10% en tu primera compra") a justo abajo del hero, en vez de su posición anterior (después de "Ofertas"/"Lo nuevo", antes de "Nuestra filosofía").

## Objetivo

En la home, el orden de secciones es: Hero → banner de 10% de descuento → tira de confianza (TrustStrip) → categorías → Ofertas/Lo nuevo → filosofía → best-sellers.

## Archivos involucrados

- `app/routes/_index.tsx` — solo se movió el orden de `<WelcomeDiscountBanner />`, ningún componente se modificó.

## Restricciones específicas de esta tarea

- Cambio de orden únicamente — el componente `WelcomeDiscountBanner` no se tocó.

## Criterios de aceptación

- [x] Orden verificado en el navegador (por los `<h2>`/`<h1>` de cada sección): Hero → "Llévate 10% en tu primera compra" → TrustStrip → "Encuentra lo tuyo" → "Ofertas" → "Lo nuevo" → EditorialSplit → "Best-sellers".
- [x] `npm run typecheck` limpio, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no aplica ningún requisito a un cambio de orden puro.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Verificado en el navegador (desktop) que el banner aparece inmediatamente debajo del hero, antes de TrustStrip.
- `npm run typecheck` limpio, sin errores de consola.

## Notas de progreso

- 2026-09-13: Completada en la misma sesión que las tareas 100-109.

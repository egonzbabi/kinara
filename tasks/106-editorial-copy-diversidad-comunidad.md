---
id: 106
title: "Home: nuevo copy de la sección \"Nuestra filosofía\" (diversidad, comunidad, fuerza)"
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

A pedido explícito del usuario: reescribir la frase/párrafo de la sección "Nuestra filosofía" de la home (`EditorialSplit.tsx`) para que incluya diversidad, mujeres, lo urbano, la idea de "brillar/realzar la fuerza", inclusión y una comunidad de marca ("comunidad KINARA") — evitando jerga técnica ("patronaje" no sonaba natural) y motivando la compra sin sonar a venta agresiva.

Se iteró en vivo con el usuario sobre varias versiones antes de llegar a la final: una primera propuesta con "patronaje" (rechazada por sonar técnica), una segunda con "menos colecciones, más duraderas" (el usuario pidió quitar esa frase), hasta la versión final centrada en "ropa urbana y deportiva que realza tu fuerza".

## Objetivo

La sección "Nuestra filosofía" comunica diversidad, inclusión (cuerpos reales, toda edad), lo urbano/deportivo y pertenencia a una comunidad de marca, con lenguaje simple y cálido — sin cambiar el layout, la foto ni el resto del diseño (regla de `CLAUDE.md`, autorizado puntualmente por el usuario solo para este copy).

## Archivos involucrados

- `app/components/EditorialSplit.tsx` — blockquote grande + párrafo debajo.

## Restricciones específicas de esta tarea

- Cambio de copy únicamente — layout, tipografía, foto y CTA ("Conoce la colección") intactos.
- Autorización explícita del usuario para tocar este copy puntual (`CLAUDE.md`: ningún copy se cambia sin permiso específico).

## Criterios de aceptación

- [x] Blockquote: "Ropa urbana y deportiva que realza tu fuerza."
- [x] Párrafo: "Hecha para mujeres diversas, de cuerpos reales y toda edad. Tejidos cómodos, colores cálidos que combinan con todo — súmate a la comunidad KINARA."
- [x] Sin jerga técnica ("patronaje" fuera) ni la frase "menos colecciones, más duraderas" (el usuario pidió quitarla explícitamente).
- [x] `npm run typecheck` limpio.
- [x] Verificado en el navegador que el texto exacto está en el DOM, en el lugar correcto, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no aplica ningún requisito de código a un cambio de copy puro; no se rompe la regla de diseño intocable (autorización puntual del usuario para este copy).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Verificado por JS en el navegador (`textContent` del `<blockquote>` y el `<p>` siguiente) que el copy exacto está publicado.
- `npm run typecheck` limpio, sin errores de consola.

## Notas de progreso

- 2026-09-13: Iterado en vivo con el usuario (varias rondas de ajuste de tono/palabras) hasta llegar a la versión final aprobada. Completado en la misma sesión que las tareas 100-105.

---
id: 102
title: "Accesibilidad: hallazgos de la auditoría de performance (aria-hidden con foco, salto de heading, aria-label del carrito, contraste)"
status: in-progress
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

La auditoría de performance (base de la tarea 100) encontró 4 hallazgos de accesibilidad, cola de esa auditoría por instrucción del usuario ("empieza con el video del hero... [luego] sigue con accesibilidad"):

1. `aria-hidden` con descendientes enfocables en el drawer del menú móvil (`SiteNav.tsx`) y en el panel del carrito (`CartDrawer.tsx`, `z-[100]`).
2. Salto de nivel de encabezado: `<h4>` en el footer sin ningún `<h3>` antes en la página.
3. `aria-label` del botón de carrito con plural incorrecto en español cuando `count === 1`.
4. Contraste de color insuficiente en `.btn-clay` (texto bone sobre fondo clay) y en `.text-muted` sobre fondo `sand` — **ambos son colores de marca ya aprobados**, así que por regla de `CLAUDE.md` ("si corregir un problema de accesibilidad... requeriría cambiar un color de marca ya aprobado, se marca como conflicto y se pregunta antes de tocarlo") esto no se toca sin permiso explícito del usuario.

## Objetivo

Los 3 hallazgos que no tocan colores de marca quedan corregidos; el hallazgo de contraste queda documentado como conflicto de diseño, pendiente de decisión del usuario.

## Archivos involucrados

- `app/components/SiteNav.tsx` — `MobileMenu` (drawer), `aria-label` del botón de carrito.
- `app/components/CartDrawer.tsx` — panel del carrito.
- `app/components/SiteFooter.tsx` — encabezados de columna.
- `app/app.css` — `.btn-clay`, `.text-muted` (pendiente, no tocado).

## Restricciones específicas de esta tarea

- No cambiar `--color-clay`, `--color-bone` ni `--color-muted` (paleta aprobada) sin autorización puntual del usuario para este caso.

## Pasos sugeridos

1. Reemplazar `aria-hidden={!open}` por `inert={!open}` en `MobileMenu` (`SiteNav.tsx`) y en `CartDrawer.tsx` — `inert` (soportado nativamente por React 19 / los tipos ya instalados) oculta el subárbol de la accesibilidad Y saca sus botones/links del orden de tabulación, que es justo lo que `aria-hidden` por sí solo no hacía (dejaba el drawer cerrado con elementos todavía alcanzables con Tab).
2. Cambiar `<h4>` a `<h3>` en las columnas del footer (`SiteFooter.tsx`) — el estilo viene 100% de la clase `.label`, así que no hay cambio visual.
3. Corregir el plural de `aria-label` del botón de carrito: `"1 artículo"` vs `"N artículos"`.
4. Documentar el conflicto de contraste (`.btn-clay`, `.text-muted`) y preguntar al usuario antes de tocar cualquier color de marca.

## Criterios de aceptación

- [x] `MobileMenu` y `CartDrawer` usan `inert` en vez de `aria-hidden` cuando están cerrados — verificado por JS que `.focus()` en un botón interno no mueve el foco mientras está cerrado, y sí funciona una vez abierto.
- [x] Footer usa `<h3>` para "Tienda"/"Ayuda"/"Marca" — sin `<h4>` restante, sin cambio visual (misma clase `.label`).
- [x] `aria-label` del botón de carrito dice "1 artículo" (singular) cuando `count === 1`, "N artículos" en cualquier otro caso.
- [ ] Contraste de `.btn-clay` (≈3.67:1, bajo el 4.5:1 de AA para texto normal) y `.text-muted` sobre `sand` (≈4.45:1, apenas bajo el umbral) — **pendiente de decisión del usuario**, ver "Notas de progreso".
- [x] `npm run typecheck` limpio.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el punto de accesibilidad "focus visible en todo elemento interactivo" y el estándar WCAG 2.1 AA ya estaban ahí; esta tarea avanza su cumplimiento sin bajar el piso de diseño (regla de paleta intocable, también en `REQUISITOS.md`/`CLAUDE.md`).
- Regresiones encontradas: ninguna — verificado que el carrito y el menú móvil siguen abriendo/cerrando igual, visualmente sin cambios.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica todavía (se agregará "preferir `inert` sobre `aria-hidden` para paneles con contenido enfocable" si el patrón se repite en una tarea futura).

## Pruebas manuales

- Verificado por JS en el navegador (`el.focus()` + revisar `document.activeElement`) que ambos paneles bloquean el foco cuando están cerrados y lo permiten cuando están abiertos.
- Verificado que el footer renderiza `<h3>` (no `<h4>`) con el mismo texto e igual apariencia visual.
- Sin errores de consola en home, tienda, producto, contacto.

## Notas de progreso

- 2026-09-13: Corregidos los 3 hallazgos que no tocan la paleta aprobada (aria-hidden→inert en ambos paneles, heading h4→h3, plural del aria-label del carrito). Falta cerrar el hallazgo de contraste (`.btn-clay`, `.text-muted`) — es un conflicto de diseño según la regla de `CLAUDE.md`, se le presentó al usuario con los números exactos (contraste calculado manualmente, no con una herramienta) y se espera su decisión antes de tocar cualquier color. Tarea queda `in-progress` hasta resolver ese punto.

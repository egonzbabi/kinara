---
id: 102
title: "Accesibilidad: hallazgos de la auditoría de performance (aria-hidden con foco, salto de heading, aria-label del carrito, contraste)"
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

La auditoría de performance (base de la tarea 100) encontró 4 hallazgos de accesibilidad, cola de esa auditoría por instrucción del usuario ("empieza con el video del hero... [luego] sigue con accesibilidad"):

1. `aria-hidden` con descendientes enfocables en el drawer del menú móvil (`SiteNav.tsx`) y en el panel del carrito (`CartDrawer.tsx`, `z-[100]`).
2. Salto de nivel de encabezado: `<h4>` en el footer sin ningún `<h3>` antes en la página.
3. `aria-label` del botón de carrito con plural incorrecto en español cuando `count === 1`.
4. Contraste de color insuficiente en `.btn-clay` (texto bone sobre fondo clay) y en `.text-muted` sobre fondo `sand` — **ambos son colores de marca ya aprobados**, así que por regla de `CLAUDE.md` ("si corregir un problema de accesibilidad... requeriría cambiar un color de marca ya aprobado, se marca como conflicto y se pregunta antes de tocarlo") se presentó como conflicto antes de tocar nada. El usuario autorizó puntualmente: "ajusta los colores solo lo necesario para pasar 4.5:1".

## Objetivo

Los 4 hallazgos quedan corregidos, incluido el de contraste — con el ajuste de color mínimo necesario para llegar a 4.5:1, autorizado explícitamente por el usuario para este caso puntual.

## Archivos involucrados

- `app/components/SiteNav.tsx` — `MobileMenu` (drawer), `aria-label` del botón de carrito.
- `app/components/CartDrawer.tsx` — panel del carrito.
- `app/components/SiteFooter.tsx` — encabezados de columna.
- `app/app.css` — `--color-clay`, `--color-muted` (`@theme`).

## Restricciones específicas de esta tarea

- `--color-clay` y `--color-muted` solo se oscurecieron lo mínimo necesario para llegar a 4.5:1 — no se tocó `--color-bone`, `--color-sand`, `--color-clay-deep` ni ningún otro color, y el ajuste fue autorizado puntualmente por el usuario (no es un permiso general para tocar la paleta en el futuro).

## Pasos sugeridos

1. Reemplazar `aria-hidden={!open}` por `inert={!open}` en `MobileMenu` (`SiteNav.tsx`) y en `CartDrawer.tsx` — `inert` (soportado nativamente por React 19 / los tipos ya instalados) oculta el subárbol de la accesibilidad Y saca sus botones/links del orden de tabulación, que es justo lo que `aria-hidden` por sí solo no hacía (dejaba el drawer cerrado con elementos todavía alcanzables con Tab).
2. Cambiar `<h4>` a `<h3>` en las columnas del footer (`SiteFooter.tsx`) — el estilo viene 100% de la clase `.label`, así que no hay cambio visual.
3. Corregir el plural de `aria-label` del botón de carrito: `"1 artículo"` vs `"N artículos"`.
4. Documentar el conflicto de contraste (`.btn-clay`, `.text-muted`) y preguntar al usuario antes de tocar cualquier color de marca — una vez autorizado, oscurecer `--color-clay` y `--color-muted` lo mínimo necesario (probando valores hasta encontrar el que cruza 4.5:1 con el menor margen), verificando el contraste real con la fórmula de luminancia relativa de WCAG (no solo a ojo) contra cada fondo donde se usan (`--color-bone` para clay, `--color-sand` y `--color-bone` para muted).

## Criterios de aceptación

- [x] `MobileMenu` y `CartDrawer` usan `inert` en vez de `aria-hidden` cuando están cerrados — verificado por JS que `.focus()` en un botón interno no mueve el foco mientras está cerrado, y sí funciona una vez abierto.
- [x] Footer usa `<h3>` para "Tienda"/"Ayuda"/"Marca" — sin `<h4>` restante, sin cambio visual (misma clase `.label`).
- [x] `aria-label` del botón de carrito dice "1 artículo" (singular) cuando `count === 1`, "N artículos" en cualquier otro caso.
- [x] `--color-clay` de `#c2603d` a `#ab5436`: `.btn-clay` (y todo `bg-clay`+`text-bone`) pasa de ≈3.67:1 a **4.56:1** contra `--color-bone`.
- [x] `--color-muted` de `#6f6457` a `#6d6356`: `.text-muted` pasa de ≈4.45:1 a **4.53:1** contra `--color-sand` (el fondo más exigente de los dos donde se usa; contra `--color-bone` queda en 5.18:1). Contraste verificado con la fórmula real de luminancia relativa de WCAG ejecutada en el navegador (`getComputedStyle` + cálculo, no solo estimado).
- [x] Cambio visualmente casi imperceptible (confirmado por captura antes/después) — ningún otro color de la paleta tocado.
- [x] `npm run typecheck` limpio.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el punto de accesibilidad "focus visible en todo elemento interactivo" y el estándar WCAG 2.1 AA ya estaban ahí; esta tarea completa su cumplimiento de contraste sin bajar el piso de diseño (el ajuste de color fue autorizado puntualmente por el usuario, no una excepción general a la regla de paleta intocable).
- Regresiones encontradas: ninguna — verificado que el carrito y el menú móvil siguen abriendo/cerrando igual, y que el nuevo clay/muted se ve prácticamente igual al original en todos los usos (`bg-clay`+`text-bone` en botones/toggles, `text-clay` de acento, `.text-muted` en todo el sitio).
- Requisitos nuevos agregados a `REQUISITOS.md`: se agrega el valor final de `--color-clay` (`#ab5436`) y `--color-muted` (`#6d6356`) como la paleta vigente (sección de UI/UX y accesibilidad), y "preferir `inert` sobre `aria-hidden` para paneles con contenido enfocable" como patrón a seguir en tareas futuras.

## Pruebas manuales

- Verificado por JS en el navegador (`el.focus()` + revisar `document.activeElement`) que ambos paneles bloquean el foco cuando están cerrados y lo permiten cuando están abiertos.
- Verificado que el footer renderiza `<h3>` (no `<h4>`) con el mismo texto e igual apariencia visual.
- Verificado en el navegador, con la fórmula real de contraste de WCAG, que `--color-clay` y `--color-muted` cruzan 4.5:1 contra sus fondos correspondientes.
- Comparación visual antes/después del hero y sus botones: cambio no perceptible a simple vista.
- Sin errores de consola en home, tienda, producto, contacto.

## Notas de progreso

- 2026-09-13: Corregidos los 3 hallazgos que no tocan la paleta aprobada (aria-hidden→inert en ambos paneles, heading h4→h3, plural del aria-label del carrito). El usuario autorizó explícitamente ajustar los colores para el 4º hallazgo ("ajusta los colores solo lo necesario para pasar 4.5:1") — se calculó el oscurecimiento mínimo de `--color-clay` y `--color-muted` (probando varios tonos hasta encontrar el que cruza el umbral con el menor margen posible) y se verificó el resultado con la fórmula real de WCAG en el navegador, no solo estimado. Tarea cerrada.

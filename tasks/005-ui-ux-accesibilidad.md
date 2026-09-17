---
id: 005
title: "Auditoría y mejora de UI/UX y accesibilidad"
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

La mejor experiencia de usuario impacta conversión, SEO (señales de UX) y accesibilidad legal. Hoy no se ha auditado el sitio contra WCAG ni contra heurísticas de UX de e-commerce.

## Objetivo

Que el sitio pase una auditoría de accesibilidad (Lighthouse Accessibility ≥ 95, sin errores críticos de axe) y aplique las mejores prácticas de UX para e-commerce definidas en la skill `ui-ux-pro-max`.

## Archivos involucrados

- `app/components/*` (todos, especialmente `SiteNav.tsx`, `CartDrawer.tsx`, `ProductCard.tsx`, `Accordion.tsx`, `Newsletter.tsx`)
- `app/app.css`

## Restricciones específicas de esta tarea

- No rediseñar la identidad visual/marca sin confirmarlo antes — esta tarea es de accesibilidad y usabilidad, no de rebranding.
- Usar la skill `ui-ux-pro-max` para decisiones de contraste, espaciado y patrones de interacción.

## Pasos sugeridos

1. Correr Lighthouse Accessibility y axe DevTools en `/`, `/tienda`, `/producto/:slug`.
2. Corregir contraste de color insuficiente, agregar `aria-label` a botones de solo ícono (carrito, cerrar drawer, flechas de galería).
3. Verificar orden de tabulación y que el `CartDrawer`/modales atrapen el foco (focus trap) y se puedan cerrar con `Esc`.
4. Verificar que todo formulario (`Newsletter.tsx`) tenga `label` asociado y mensajes de error accesibles.
5. Revisar la skill `ui-ux-pro-max` para heurísticas de conversión en tarjetas de producto, CTAs y checkout.

## Criterios de aceptación

- [x] Lighthouse Accessibility ≥ 95 en las tres rutas auditadas — **100/100 en las tres** (`/`, `/tienda`, `/producto/:slug`) tras las correcciones.
- [x] Sin errores críticos/serios en axe DevTools (Lighthouse Accessibility corre las mismas reglas de axe-core por debajo) — 0 audits fallidos en las tres rutas en la corrida final.
- [x] Navegación completa por teclado (tab, enter, esc) funcional en nav, drawer del carrito y galería de producto — agregado focus trap real (antes solo existía `inert` cuando estaba cerrado, pero nada evitaba que Tab se saliera del panel hacia el fondo de la página mientras estaba abierto, ni movía el foco adentro al abrir, ni lo devolvía al botón disparador al cerrar).
- [x] Todo botón de solo ícono tiene `aria-label` — ya estaba cubierto en su mayoría desde tarea 102; se corrigió además el `aria-label` del carrito, que no cumplía WCAG 2.5.3 (Label in Name).

## Hallazgos y correcciones

1. **Focus trap ausente en `CartDrawer` y `MobileMenu`** — nuevo hook reutilizable `app/hooks/useFocusTrap.ts`: al abrir mueve el foco adentro (primer elemento enfocable), encierra Tab/Shift+Tab dentro del panel, maneja Escape, y al cerrar devuelve el foco a quien lo tenía (el botón que abrió el panel) — antes se perdía en el `<body>`. Verificado en el navegador con JS (`document.activeElement` antes/después de abrir, tabbear y cerrar con Esc) en ambos componentes.
2. **`MobileMenu` no cerraba con Esc** — lo resuelve el mismo hook (antes solo `CartDrawer` tenía un listener de teclado propio).
3. **"Añadir rápido" en `ProductCard` invisible pero enfocable por teclado** — el panel de selección rápida de color/talla solo se revelaba con `group-hover` (mouse); con teclado, Tab llegaba al botón pero quedaba con `opacity-0`, un foco "fantasma" sin indicación visual. Se agregó `group-focus-within:` a las mismas clases, verificado en el navegador que `getComputedStyle(...).opacity` pasa a `1` de forma síncrona al enfocar el botón con `.focus()`.
4. **Puntos de color en `ProductCard` sin alternativa de texto** — los `<span>` de color no tenían nombre accesible individual ni agrupado; se marcaron `aria-hidden` y se agregó un `<span className="sr-only">` con la lista de colores disponibles.
5. **Panel colapsado de `Accordion` alcanzable con Tab estando oculto** — uno de los paneles (`producto.$slug.tsx`, "Envíos y devoluciones") contiene un `<Link>` real; con solo `aria-hidden` ese link seguía siendo tabbable estando visualmente colapsado (mismo patrón ya corregido en tarea 102 para el drawer/carrito). Se cambió a `inert`, y se agregó `aria-controls`/`id` para asociar el botón con su panel.
6. **`aria-label` del botón de carrito no incluía el texto visible ("Carrito")** — Lighthouse lo marcó como `label-content-name-mismatch` (WCAG 2.5.3): el label reemplazaba todo el nombre accesible con "Abrir carrito de compras...", que no contiene la palabra visible en pantalla, rompiendo el control por voz. Se quitó el `aria-label` y se dejó que el nombre accesible se arme del contenido visible ("Carrito" + contador) más un `<span className="sr-only">` con el plural correcto.
7. **Salto de nivel de encabezado en `/tienda`** — la página tiene un solo `<h1>` y las tarjetas de producto usan `<h3>` (correcto en home, donde cada sección ya tiene su propio `<h2>` antes de la grilla) pero en tienda no había ningún `<h2>` intermedio. Se agregó un `<h2 className="sr-only">Resultados</h2>` antes de la grilla — sin cambio visual.
8. **Contraste insuficiente en 2 casos nuevos, ambos color de marca** — presentados como conflicto y autorizados puntualmente por el usuario, mismo criterio que tarea 102:
   - `--color-sage` (badge "Nuevo", texto bone) daba 3.45:1 contra bone; cambiar solo el texto a espresso tampoco alcanzaba (4.01:1). Oscurecido de `#7c8466` a `#6a7057` → 4.54:1.
   - `--color-clay` como color de TEXTO sobre `sand` (precios de oferta, links de acento) daba 3.99:1 — el ajuste de la tarea 102 solo había cubierto la dirección bg-clay+texto-bone (4.56:1 contra bone), no esta. Oscurecido de `#ab5436` a `#9e4e32` → 4.51:1 contra sand, 5.15:1 contra bone (la dirección original sigue pasando de sobra).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — se reutilizó el patrón "preferir `inert` sobre `aria-hidden` para paneles con contenido enfocable" ya documentado en tarea 102 (aplicado ahora también en `Accordion.tsx`), y el criterio de "conflicto de contraste con color de marca → preguntar antes de tocar" (aplicado a `--color-sage` y a la segunda vuelta de `--color-clay`).
- Regresiones encontradas: ninguna — verificado que carrito, menú móvil, quick-add de producto y acordeón de detalle siguen funcionando igual visualmente (comparación de captura antes/después en `/tienda`), sin errores de consola en home/tienda/producto.
- Requisitos nuevos agregados a `REQUISITOS.md`: hook `useFocusTrap` como patrón obligatorio para cualquier panel/diálogo modal nuevo; valores finales de `--color-sage` (`#6a7057`) y `--color-clay` (`#9e4e32`) como paleta vigente; "usar `group-focus-within` además de `group-hover` en cualquier interacción que solo se revele al pasar el mouse" como patrón a seguir.

## Pruebas manuales

- Lighthouse Accessibility (headless, `npx lighthouse`) en `/`, `/tienda` y `/producto/daily-top`: **100/100 en las tres**, sin audits fallidos.
- Verificado con JS en el navegador: focus trap (foco entra al abrir, Tab no se sale del panel, Esc cierra y devuelve el foco) en `CartDrawer` (desktop) y `MobileMenu` (viewport 375px).
- Verificado que "Añadir rápido" en `ProductCard` se revela (`opacity: 1`) al enfocarlo con teclado, no solo con mouse.
- Verificado que el panel colapsado del acordeón queda `inert` (su link interno deja de ser alcanzable) y dejar de serlo al abrirlo.
- Comparación visual antes/después de `/tienda`: badges "Nuevo" y acentos clay se ven prácticamente iguales.
- `npm run typecheck` limpio, sin errores de consola.

## Notas de progreso

- 2026-09-16: Tarea completada en una sola sesión. El usuario autorizó puntualmente los dos ajustes de contraste de color de marca (sage y una segunda vuelta de clay) antes de tocarlos, siguiendo la regla de `CLAUDE.md`.

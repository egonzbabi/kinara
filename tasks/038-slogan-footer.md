---
id: 038
title: "Slogan de marca visible en todas las páginas"
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

El usuario pidió agregar el slogan de KINARA — "Hecha para moverte. Creada para brillar." — visible en todas las secciones y páginas del sitio, con un diseño cuidado ("muy bonito diseño"). Es un cambio visual/de copy puntual autorizado explícitamente por el usuario (excepción a la regla de diseño intocable de `CLAUDE.md`).

## Objetivo

El slogan aparece en un lugar realmente global del sitio (presente en toda página, no solo en home), con un tratamiento tipográfico destacado y elegante, sin agregarle altura permanente al header fijo (que ya lleva logo + navegación + banner superior) ni competir con el resto del contenido.

## Decisión de diseño

Se eligió el pie de página (`SiteFooter.tsx`) en vez del header: el footer ya se renderiza en el layout raíz (`app/root.tsx`) y por lo tanto aparece en absolutamente todas las rutas, igual que el header — pero agregarlo al header (que es `sticky`) le sumaría altura permanente visible en cada scroll de cada página, lo cual choca con las reglas de performance/UX ya establecidas en `CLAUDE.md` (no clutter, consistencia visual). El footer permite darle al slogan su propio momento visual sin ese costo.

Tratamiento: una línea centrada en `font-display` (Fraunces, la misma tipografía serif de los títulos del sitio) en itálicas, tamaño grande (`clamp(24px, 3.4vw, 38px)`), con la segunda mitad de la frase ("Creada para brillar.") en el color de acento de marca `text-clay` — mismo patrón ya validado visualmente en el Hero (la palabra "movimiento" en itálicas con acento de color). Se colocó arriba de las columnas existentes del footer, separado por una línea divisoria (`border-b`), sin tocar ningún otro contenido/copy ya existente.

## Archivos involucrados

- `app/components/SiteFooter.tsx` — nuevo bloque centrado antes del grid de columnas.

## Restricciones específicas de esta tarea

- No se tocó el header (`SiteNav.tsx`) ni el banner superior (`AnnouncementBar.tsx`) — el slogan vive solo en el footer.
- No se modificó ningún otro texto ya existente en el footer (la descripción de marca en la primera columna se dejó igual, aunque temáticamente se parece — el usuario no pidió quitarla).
- Reutiliza tokens de diseño ya existentes (`font-display`, `text-clay`, `text-espresso`, `border-line`) — no se inventó ninguna paleta ni tipografía nueva.

## Criterios de aceptación

- [x] El slogan "Hecha para moverte. Creada para brillar." aparece en el footer de toda página del sitio (verificado en home y en `/contacto`).
- [x] Tratamiento tipográfico destacado: itálicas, tamaño grande, acento de color en la segunda frase — consistente con el lenguaje visual ya usado en el Hero.
- [x] Se ve bien en desktop y mobile (el salto de línea en mobile es natural, sin corte a media palabra).
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no introduce ningún patrón nuevo que deba registrarse ahí (cambio de copy/diseño puntual, ya autorizado explícitamente por el usuario).
- Regresiones encontradas: ninguna — el resto del footer (columnas, copyright, links legales) se conserva igual.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Confirmado por JS (`document.body.innerText.includes(...)`) que el texto está presente tanto en `/` como en `/contacto`.
- Capturas en desktop (1280px) y mobile (375px): itálicas, color de acento y espaciado correctos en ambos, sin overflow ni corte de texto.
- Sin errores de consola.

## Notas de progreso

- 2026-08-10: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario. Verificado en dos rutas distintas para confirmar que es realmente global (vive en el layout raíz vía `SiteFooter`, no en una página específica).

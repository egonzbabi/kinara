---
id: 111
title: "Home: el banner de descuento llama la atención (rebote de entrada + flecha animada)"
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

A pedido explícito del usuario, sobre la sección ya movida en la tarea 110: "ahora haz que esa sección llame la atención que brinque o algo".

## Objetivo

El banner de descuento ("Llévate 10% en tu primera compra") entra con un rebote tipo resorte al aparecer en pantalla (en vez del fade+desplazamiento liso del resto del sitio), y una flechita hacia abajo rebota de forma continua apuntando al formulario de registro, para seguir llamando la atención después de la entrada.

## Archivos involucrados

- `app/app.css` — `@keyframes bounce-in` + `.reveal-bounce.in` (nueva variante de `.reveal`).
- `app/components/WelcomeDiscountBanner.tsx` — clase `reveal-bounce` en la tarjeta + flecha animada (`motion-safe:animate-bounce`, utilidad ya incluida en Tailwind).

## Restricciones específicas de esta tarea

- El rebote de entrada reusa el mismo mecanismo de `useScrollReveal` (la clase `.reveal` + `.in` que agrega el `IntersectionObserver` al entrar en viewport) — solo se le agregó `.reveal-bounce` como modificador visual, sin tocar el hook ni el resto de secciones que usan `.reveal` normal.
- Ambas animaciones respetan `prefers-reduced-motion`: el rebote de entrada cae bajo la regla global de `app.css` (`animation-duration: 0.001ms !important`); la flecha usa el prefijo `motion-safe:` de Tailwind, que directamente no aplica la animación si el usuario tiene esa preferencia activada.
- La flecha se oculta cuando el registro ya se completó (`!success`) — no tiene sentido seguir apuntando a un formulario que ya no está.

## Criterios de aceptación

- [x] `.reveal-bounce.in` está definido con un keyframe de rebote (overshoot en `translateY`) que arranca del mismo estado oculto que `.reveal` (para no generar un salto visual al iniciar).
- [x] La tarjeta del banner tiene las clases `reveal reveal-bounce`.
- [x] Una flecha (chevron hacia abajo) con `animate-bounce` continuo aparece entre el párrafo y el formulario, oculta tras un registro exitoso.
- [x] Confirmado por `getComputedStyle` en el navegador que ambas animaciones quedan correctamente asignadas (`animation-name: bounce-in` en la tarjeta al agregarle `.in`; `animation-name: bounce`, `iteration-count: infinite` en la flecha).
- [x] `npm run typecheck` limpio, sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no rompe el requisito de `prefers-reduced-motion` ya establecido (tarea 090); ambas animaciones nuevas lo respetan por mecanismos distintos (regla global + `motion-safe:`).
- Regresiones encontradas: ninguna — `.reveal` normal (usado en el resto del sitio) no se modificó, solo se agregó una regla nueva y aditiva (`.reveal-bounce.in`).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (efecto visual puntual).

## Pruebas manuales

- Confirmado por `getComputedStyle` que `animation-name`/`animation-duration` de la tarjeta (`bounce-in`, `0.9s`) y de la flecha (`bounce`, `1s`, `infinite`) están correctamente asignados.
- **No fue posible confirmar visualmente la reproducción completa de las animaciones** en esta sesión — el panel de vista previa del navegador quedó repetidamente en un estado de "no compositing" (mismo problema intermitente que afectó otras verificaciones visuales de la sesión), donde `requestAnimationFrame` no dispara y las animaciones CSS no avanzan aunque las propiedades ya estén bien asignadas. Se recomienda que el usuario confirme visualmente en producción.
- `npm run typecheck` limpio, sin errores de consola.

## Notas de progreso

- 2026-09-13: Implementado en la misma sesión que las tareas 100-110. Verificación visual pendiente de confirmación del usuario por la limitación del panel de vista previa mencionada arriba.

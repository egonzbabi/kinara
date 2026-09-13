---
id: 100
title: "Performance: auditoría Lighthouse y corrección del LCP del hero (video de fondo → imagen estática + recompresión)"
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

El usuario pidió una auditoría de performance del sitio en producción. Se corrió Lighthouse real (mobile) contra `https://kinara-ecommerce.vercel.app/` en todas las rutas principales. Resultado: Home fue la única página que no cumple el objetivo de `REQUISITOS.md` (Performance ≥ 90, LCP < 2.5s) — Performance 72, LCP 5.4s.

Causa raíz identificada: la capa de fondo ambiental del hero (`app/components/Hero.tsx`) era una segunda copia del `<video>` del hero, agrandada y desenfocada (`inset-0`, la región de mayor área del hero). Lighthouse marcaba ese `<video>` como el elemento de LCP de la página, y bajo red móvil simulada el 87% del tiempo de LCP (4.7s de 5.4s) era "Render Delay": el navegador esperaba a que bajara suficiente del archivo de video (entonces 4.43MB) antes de poder pintar un frame.

El usuario autorizó explícitamente: "empieza con el video del hero pero haz todo menos acortar el video quiero todas las fotos" — es decir, resolver el problema de LCP sin acortar el video ni quitar ninguna de las 10 fotos del collage (tarea 099).

## Objetivo

El hero ya no depende de un `<video>` para su elemento de LCP; el archivo de video (usado solo en la tarjeta nítida flotante) pesa significativamente menos sin pérdida perceptible de calidad ni cambio en su contenido/duración/número de fotos.

## Archivos involucrados

- `app/components/Hero.tsx` — capa de fondo ambiental (`inset-0`, `blur-2xl`).
- `product-images/site/hero-video.mp4` y `.../hero-poster.jpg` en Supabase Storage (recompresión, misma URL pública).

## Restricciones específicas de esta tarea

- **No acortar el video ni quitar ninguna de las 10 fotos** (instrucción explícita del usuario) — la recompresión solo reduce bitrate/tamaño de archivo, no duración ni contenido.
- No tocar paleta, tipografía, layout ni copy del hero (regla general de `CLAUDE.md`) — el cambio de `<video>` a `<img>` en el fondo usa exactamente las mismas clases CSS (posición, escala, blur, opacidad, saturación) que tenía el `<video>` que reemplaza.
- El video nítido de la tarjeta flotante (`HERO_COLLAGE.main.url`, en primer plano) no se toca en su comportamiento (sigue con autoplay/loop/muted/playsInline) — solo se recomprime el archivo que carga.

## Pasos sugeridos

1. Auditoría Lighthouse (mobile) de producción en todas las rutas para confirmar qué página(s) fallan el objetivo de Core Web Vitals y por qué.
2. Identificar el elemento de LCP y su desglose de tiempos (`lighthouse --output json`) para confirmar la causa (no asumir).
3. Reemplazar el `<video>` de fondo ambiental por un `<img>` estático usando el mismo `poster` (ya cargado por los `<video>` existentes, ~80KB) — mismas clases CSS.
4. Recomprimir `hero-video.mp4` probando varios CRF (26/30/34) con `-preset slow -pix_fmt yuv420p -an -movflags +faststart`, comparando frames extraídos visualmente contra el original para elegir el mejor tradeoff calidad/tamaño sin acortar ni recortar contenido.
5. Subir el video recomprimido + poster actualizado a Storage (`upsert: true`, mismas rutas públicas — no requiere cambiar `app/data/images.ts`).
6. `npm run typecheck` limpio tras el cambio en `Hero.tsx`.
7. Verificación manual en navegador (desktop + mobile, sin errores de consola).

## Criterios de aceptación

- [x] El fondo ambiental del hero es una `<img>` (no un `<video>`), visualmente equivalente al `<video>` que reemplazó (mismo poster, mismo blur/escala/opacidad).
- [x] `hero-video.mp4` se redujo de 4.43MB a 1.46MB (CRF 30) sin pérdida perceptible de calidad (confirmado por comparación visual de frames), sin cambiar duración (17.5s) ni el número de fotos (10).
- [x] `npm run typecheck` pasa limpio.
- [x] Verificado en navegador (dev): hero renderiza correctamente en desktop y mobile (375px), sin errores de consola.
- [x] Los archivos actualizados están en vivo en Storage (mismas URLs públicas que ya usa `app/data/images.ts`, confirmado por `content-length` de la respuesta HTTP).
- [ ] Confirmar con un Lighthouse real contra producción, después de desplegar el cambio de `Hero.tsx`, que Home alcanza Performance ≥ 90 y LCP < 2.5s (pendiente: requiere que el cambio de código esté desplegado, no solo el contenido de Storage).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el objetivo "LCP < 2.5s, Performance ≥ 90 (mobile)" ya estaba en `REQUISITOS.md` desde su redacción original; esta tarea es la que lo hace cumplir en Home. No se tocó paleta/tipografía/layout (regla de diseño intocable).
- Regresiones encontradas: ninguna — el video nítido de la tarjeta flotante conserva su comportamiento; el fondo ambiental es visualmente equivalente al `<video>` que reemplazó.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (esta tarea corrige el cumplimiento de un requisito ya existente, no agrega uno nuevo). Nota para tareas futuras de imágenes/video: evitar usar un `<video>` — sobre todo uno grande en área — como fondo puramente decorativo cuando una `<img>` estática logra el mismo efecto visual; preferir eso quita candidatos de LCP lentos.

## Pruebas manuales

- Verificado en `http://localhost:5173` (dev): hero se ve igual que antes (fondo ambiental + tarjeta nítida), sin errores de consola, en desktop (screenshot) y mobile 375px (screenshot).
- Verificado que los archivos servidos desde Supabase Storage tienen el tamaño esperado (`curl -I`, `content-length` 1498237 y 78279 respectivamente).
- Pendiente: re-correr Lighthouse contra producción una vez desplegado el cambio de `Hero.tsx` (el cambio de Storage ya está en vivo; el de código requiere deploy).

## Notas de progreso

- 2026-09-13: Auditoría completa (Lighthouse real, todas las rutas) presentada al usuario con prioridades: (1) este ítem — LCP del hero (crítico, único fallo de Core Web Vitals); (2) 4 hallazgos de accesibilidad (contraste en `.btn-clay`/`.text-muted`, `aria-hidden` con descendientes enfocables en el drawer móvil y un panel `z-[100]`, salto de nivel de encabezado `<h4>`, `aria-label` del botón de carrito desincronizado); (3) ahorros menores de formato de imagen/JS no usado; (4) reemplazar imágenes editoriales "hotlinked" de Unsplash (`app/data/images.ts`, `BASE = "https://images.unsplash.com/"`) por fotos reales del shooting.
- 2026-09-13: Usuario autorizó explícitamente empezar por este ítem con la restricción de no acortar el video ni quitar fotos. Implementado: swap de `<video>` a `<img>` en `Hero.tsx` (typecheck limpio) + recompresión CRF 30 (probado contra CRF 26/34, elegido por mejor balance calidad/tamaño) + subida a Storage + verificación visual en dev (desktop/mobile, sin errores).
- Pendiente para cerrar del todo: commit/push de `Hero.tsx` a `mio main` (requiere confirmación explícita del usuario, aún no dada en este punto de la sesión) y, tras el deploy, un Lighthouse de confirmación contra producción. Los puntos (2), (3) y (4) de la auditoría quedan pendientes, en ese orden, por instrucción del usuario.
